const STATUS_LABELS: Record<string, string> = {
  beklemede: "Beklemede",
  onaylandi: "Onaylandı",
  kargoda: "Kargoda",
  teslim_edildi: "Teslim Edildi",
  iptal: "İptal Edildi",
};

export const ORDER_STATUSES = Object.keys(STATUS_LABELS);

export function statusLabel(status: string): string {
  return STATUS_LABELS[status] ?? status;
}

const PAYMENT_LABELS: Record<string, string> = {
  kapida_odeme: "Kapıda Ödeme",
  havale: "Havale / EFT",
  kredi_karti: "Kredi Kartı (Online)",
};

export function paymentLabel(method: string): string {
  return PAYMENT_LABELS[method] ?? method;
}

const PAYMENT_STATUS_LABELS: Record<string, string> = {
  beklemede: "Ödeme Bekleniyor",
  odendi: "Ödendi",
  basarisiz: "Ödeme Başarısız",
};

export function paymentStatusLabel(status: string): string {
  return PAYMENT_STATUS_LABELS[status] ?? status;
}

export const ORDER_STATUS_TONE: Record<string, string> = {
  beklemede: "bg-status-amber-bg text-status-amber-fg",
  onaylandi: "bg-status-blue-bg text-status-blue-fg",
  kargoda: "bg-status-blue-bg text-status-blue-fg",
  teslim_edildi: "bg-status-green-bg text-status-green-fg",
  iptal: "bg-status-red-bg text-status-red-fg",
};

export const PAYMENT_STATUS_TONE: Record<string, string> = {
  beklemede: "bg-status-amber-bg text-status-amber-fg",
  odendi: "bg-status-green-bg text-status-green-fg",
  basarisiz: "bg-status-red-bg text-status-red-fg",
};

export function formatPrice(value: number): string {
  return `₺${value.toLocaleString("tr-TR", { minimumFractionDigits: 0, maximumFractionDigits: 2 })}`;
}
