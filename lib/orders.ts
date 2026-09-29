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
};

export function paymentLabel(method: string): string {
  return PAYMENT_LABELS[method] ?? method;
}
