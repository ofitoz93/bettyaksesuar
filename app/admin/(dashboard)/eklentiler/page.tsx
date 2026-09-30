import { getAllPaymentMethods } from "@/lib/data/paymentMethods";
import { isPaytrConfigured } from "@/lib/paytr";
import PaymentMethodRow from "./PaymentMethodRow";

export default async function EklentilerPage() {
  const methods = await getAllPaymentMethods();
  const paytrConfigured = isPaytrConfigured();

  return (
    <div>
      <h1 className="font-display mb-2 text-[28px]">Eklentiler — Ödeme Yöntemleri</h1>
      <p className="mb-8 text-sm text-ink-soft">
        Ödeme yöntemlerini aktif/pasif yapabilir, adını değiştirebilir ve (havale gibi
        yöntemler için) ek bir indirim yüzdesi tanımlayabilirsiniz. Kapattığınız bir yöntem
        checkout sayfasında hiç görünmez.
      </p>

      <div
        className={`mb-6 border p-4 text-xs ${
          paytrConfigured
            ? "border-status-green-bg bg-status-green-bg text-status-green-fg"
            : "border-status-amber-bg bg-status-amber-bg text-status-amber-fg"
        }`}
      >
        {paytrConfigured
          ? "PayTR bağlantı bilgileri (.env) tanımlı — Kredi Kartı yöntemi aktifse checkout'ta görünür."
          : "PayTR bağlantı bilgileri (.env — PAYTR_MERCHANT_ID/KEY/SALT) henüz girilmedi. Aktif olsa bile Kredi Kartı yöntemi bu bilgiler girilene kadar checkout'ta görünmez."}
      </div>

      <div className="border border-line bg-white">
        {methods.map((method) => (
          <PaymentMethodRow key={method.code} method={method} />
        ))}
      </div>
    </div>
  );
}
