export type TurkeyRegion =
  | "Marmara"
  | "Ege"
  | "Akdeniz"
  | "İç Anadolu"
  | "Karadeniz"
  | "Doğu Anadolu"
  | "Güneydoğu Anadolu";

export const TURKEY_REGIONS: Record<TurkeyRegion, string[]> = {
  Marmara: [
    "İstanbul",
    "Edirne",
    "Kırklareli",
    "Tekirdağ",
    "Çanakkale",
    "Balıkesir",
    "Bursa",
    "Yalova",
    "Kocaeli",
    "Sakarya",
    "Bilecik",
  ],
  Ege: ["İzmir", "Manisa", "Aydın", "Denizli", "Muğla", "Uşak", "Kütahya", "Afyonkarahisar"],
  Akdeniz: [
    "Antalya",
    "Isparta",
    "Burdur",
    "Mersin",
    "Adana",
    "Hatay",
    "Kahramanmaraş",
    "Osmaniye",
  ],
  "İç Anadolu": [
    "Ankara",
    "Konya",
    "Kayseri",
    "Sivas",
    "Yozgat",
    "Kırşehir",
    "Nevşehir",
    "Niğde",
    "Aksaray",
    "Kırıkkale",
    "Çankırı",
    "Karaman",
    "Eskişehir",
  ],
  Karadeniz: [
    "Samsun",
    "Trabzon",
    "Ordu",
    "Giresun",
    "Rize",
    "Artvin",
    "Zonguldak",
    "Bartın",
    "Karabük",
    "Kastamonu",
    "Çorum",
    "Amasya",
    "Tokat",
    "Sinop",
    "Bayburt",
    "Gümüşhane",
    "Düzce",
    "Bolu",
  ],
  "Doğu Anadolu": [
    "Erzurum",
    "Erzincan",
    "Kars",
    "Ardahan",
    "Iğdır",
    "Ağrı",
    "Van",
    "Muş",
    "Bitlis",
    "Bingöl",
    "Tunceli",
    "Elazığ",
    "Malatya",
    "Hakkari",
  ],
  "Güneydoğu Anadolu": [
    "Gaziantep",
    "Şanlıurfa",
    "Diyarbakır",
    "Mardin",
    "Siirt",
    "Şırnak",
    "Batman",
    "Adıyaman",
    "Kilis",
  ],
};

export const TURKEY_PROVINCES: string[] = Object.values(TURKEY_REGIONS)
  .flat()
  .sort((a, b) => a.localeCompare(b, "tr"));

const PROVINCE_TO_REGION: Record<string, TurkeyRegion> = Object.fromEntries(
  Object.entries(TURKEY_REGIONS).flatMap(([region, provinces]) =>
    provinces.map((province) => [province, region as TurkeyRegion]),
  ),
);

export function regionOf(province: string): TurkeyRegion | null {
  return PROVINCE_TO_REGION[province] ?? null;
}
