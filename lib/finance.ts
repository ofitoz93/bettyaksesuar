// Kâr-zarar ve gider sayfalarında hem sunucu hem tarayıcı tarafında kullanılan yardımcılar.

export const EXPENSE_CATEGORIES: Record<string, string> = {
  kargo: "Kargo",
  reklam: "Reklam",
  paketleme: "Paketleme",
  komisyon: "Ödeme / Pazaryeri Komisyonu",
  kira: "Kira / Fatura",
  personel: "Personel",
  vergi: "Vergi / Muhasebe",
  diger: "Diğer",
};

export function expenseCategoryLabel(category: string): string {
  return EXPENSE_CATEGORIES[category] ?? category;
}

// Mağaza Türkiye saatine göre çalışır (UTC+3, yaz saati uygulaması yok)
const TR_OFFSET_MS = 3 * 60 * 60 * 1000;

// "2026-10" biçiminde ay anahtarı
export function monthKeyOf(iso: string): string {
  return new Date(Date.parse(iso) + TR_OFFSET_MS).toISOString().slice(0, 7);
}

export function currentMonthKey(): string {
  return monthKeyOf(new Date().toISOString());
}

export function isMonthKey(value: string | undefined): value is string {
  return Boolean(value && /^\d{4}-(0[1-9]|1[0-2])$/.test(value));
}

export function shiftMonth(key: string, delta: number): string {
  const [year, month] = key.split("-").map(Number);
  const date = new Date(Date.UTC(year, month - 1 + delta, 1));
  return date.toISOString().slice(0, 7);
}

// Ayın ilk anı (Türkiye saatiyle 00:00) — UTC ISO olarak
export function monthStartIso(key: string): string {
  const [year, month] = key.split("-").map(Number);
  return new Date(Date.UTC(year, month - 1, 1) - TR_OFFSET_MS).toISOString();
}

const MONTH_NAMES = [
  "Ocak",
  "Şubat",
  "Mart",
  "Nisan",
  "Mayıs",
  "Haziran",
  "Temmuz",
  "Ağustos",
  "Eylül",
  "Ekim",
  "Kasım",
  "Aralık",
];

export function monthLabel(key: string, short = false): string {
  const [year, month] = key.split("-").map(Number);
  const name = MONTH_NAMES[month - 1] ?? "";
  return short ? `${name.slice(0, 3)} ${String(year).slice(2)}` : `${name} ${year}`;
}

export function todayDateKey(): string {
  return new Date(Date.now() + TR_OFFSET_MS).toISOString().slice(0, 10);
}
