import { createHmac } from "crypto";

export function isPaytrConfigured(): boolean {
  return Boolean(
    process.env.PAYTR_MERCHANT_ID &&
      process.env.PAYTR_MERCHANT_KEY &&
      process.env.PAYTR_MERCHANT_SALT,
  );
}

interface PaytrCredentials {
  merchantId: string;
  merchantKey: string;
  merchantSalt: string;
}

function getCredentials(): PaytrCredentials {
  const merchantId = process.env.PAYTR_MERCHANT_ID;
  const merchantKey = process.env.PAYTR_MERCHANT_KEY;
  const merchantSalt = process.env.PAYTR_MERCHANT_SALT;

  if (!merchantId || !merchantKey || !merchantSalt) {
    throw new Error("PayTR bilgileri (.env) eksik: PAYTR_MERCHANT_ID/KEY/SALT");
  }

  return { merchantId, merchantKey, merchantSalt };
}

export interface PaytrBasketItem {
  name: string;
  price: number;
  quantity: number;
}

export interface GetTokenParams {
  merchantOid: string;
  email: string;
  amountKurus: number;
  basket: PaytrBasketItem[];
  userIp: string;
  userName: string;
  userAddress: string;
  userPhone: string;
  okUrl: string;
  failUrl: string;
}

export interface GetTokenResult {
  token?: string;
  error?: string;
}

export async function requestPaytrToken(params: GetTokenParams): Promise<GetTokenResult> {
  const { merchantId, merchantKey, merchantSalt } = getCredentials();
  const testMode = process.env.PAYTR_TEST_MODE === "1" ? "1" : "0";
  const noInstallment = "1";
  const maxInstallment = "0";
  const currency = "TL";

  const userBasket = Buffer.from(
    JSON.stringify(params.basket.map((item) => [item.name, item.price.toFixed(2), item.quantity])),
  ).toString("base64");

  const hashStr =
    merchantId +
    params.userIp +
    params.merchantOid +
    params.email +
    params.amountKurus +
    userBasket +
    noInstallment +
    maxInstallment +
    currency +
    testMode;

  const paytrToken = createHmac("sha256", merchantKey)
    .update(hashStr + merchantSalt)
    .digest("base64");

  const body = new URLSearchParams({
    merchant_id: merchantId,
    user_ip: params.userIp,
    merchant_oid: params.merchantOid,
    email: params.email,
    payment_amount: String(params.amountKurus),
    paytr_token: paytrToken,
    user_basket: userBasket,
    debug_on: testMode === "1" ? "1" : "0",
    no_installment: noInstallment,
    max_installment: maxInstallment,
    user_name: params.userName,
    user_address: params.userAddress,
    user_phone: params.userPhone,
    merchant_ok_url: params.okUrl,
    merchant_fail_url: params.failUrl,
    timeout_limit: "30",
    currency,
    test_mode: testMode,
    lang: "tr",
  });

  const response = await fetch("https://www.paytr.com/odeme/api/get-token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body,
  });

  const data = (await response.json()) as { status: string; token?: string; reason?: string };

  if (data.status !== "success" || !data.token) {
    return { error: data.reason || "PayTR ödeme başlatılamadı." };
  }

  return { token: data.token };
}

export function verifyPaytrCallbackHash(params: {
  merchantOid: string;
  status: string;
  totalAmount: string;
  hash: string;
}): boolean {
  const { merchantKey, merchantSalt } = getCredentials();
  const hashStr = params.merchantOid + merchantSalt + params.status + params.totalAmount;
  const expected = createHmac("sha256", merchantKey).update(hashStr).digest("base64");
  return expected === params.hash;
}
