const RETURN_STATUS_LABELS: Record<string, string> = {
  beklemede: "Beklemede",
  onaylandi: "Onaylandı",
  reddedildi: "Reddedildi",
  tamamlandi: "Tamamlandı",
};

export const RETURN_STATUSES = Object.keys(RETURN_STATUS_LABELS);

export function returnStatusLabel(status: string): string {
  return RETURN_STATUS_LABELS[status] ?? status;
}
