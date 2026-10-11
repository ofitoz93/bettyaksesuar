import { after } from "next/server";
import { verifyPaytrCallbackHash } from "@/lib/paytr";
import { notifyNewOrder } from "@/lib/push";
import { createServiceClient } from "@/lib/supabase/service";

export async function POST(request: Request) {
  const formData = await request.formData();
  const merchantOid = String(formData.get("merchant_oid") ?? "");
  const status = String(formData.get("status") ?? "");
  const totalAmount = String(formData.get("total_amount") ?? "");
  const hash = String(formData.get("hash") ?? "");

  if (!merchantOid || !status || !totalAmount || !hash) {
    return new Response("PAYTR notification failed: missing fields", { status: 400 });
  }

  let validHash: boolean;
  try {
    validHash = verifyPaytrCallbackHash({ merchantOid, status, totalAmount, hash });
  } catch (err) {
    console.error("paytr callback config error:", err);
    return new Response("PAYTR notification failed: not configured", { status: 500 });
  }

  if (!validHash) {
    console.error("paytr callback: invalid hash for", merchantOid);
    return new Response("PAYTR notification failed: bad hash", { status: 400 });
  }

  const supabase = createServiceClient();
  // PayTR aynı bildirimi tekrar gönderebilir — yalnızca ilk başarılı ödemede admin'e bildir
  const { data: before } = await supabase
    .from("orders")
    .select("id, payment_status")
    .eq("paytr_merchant_oid", merchantOid)
    .maybeSingle();

  const { error } = await supabase.rpc("paytr_mark_payment", {
    p_merchant_oid: merchantOid,
    p_success: status === "success",
  });

  if (error) {
    console.error("paytr_mark_payment error:", error.message);
    return new Response("PAYTR notification failed: db error", { status: 500 });
  }

  if (status === "success" && before?.payment_status === "beklemede") {
    after(() => notifyNewOrder(before.id));
  }

  // PayTR yalnızca gövdesi tam olarak "OK" olan yanıtı kabul eder,
  // aksi halde bildirimi tekrar tekrar göndermeye devam eder.
  return new Response("OK");
}
