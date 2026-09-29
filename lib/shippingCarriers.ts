export const SHIPPING_CARRIERS = [
  "Yurtiçi Kargo",
  "Aras Kargo",
  "MNG Kargo",
  "PTT Kargo",
  "Sürat Kargo",
  "UPS",
  "Diğer",
];

export function getTrackingUrl(carrier: string | null, trackingNumber: string | null): string | null {
  if (!carrier || !trackingNumber) return null;
  const code = encodeURIComponent(trackingNumber);

  switch (carrier) {
    case "Yurtiçi Kargo":
      return `https://www.yurticikargo.com/tr/online-servisler/gonderi-sorgula?code=${code}`;
    case "Aras Kargo":
      return `https://kargotakip.araskargo.com.tr/mainpage.aspx?code=${code}`;
    case "MNG Kargo":
      return `https://www.mngkargo.com.tr/gonderitakip?takipNo=${code}`;
    case "PTT Kargo":
      return `https://gonderitakip.ptt.gov.tr/Track/Verify?q=${code}`;
    case "Sürat Kargo":
      return `https://www.suratkargo.com.tr/KargoTakip?code=${code}`;
    case "UPS":
      return `https://www.ups.com/track?loc=tr_TR&tracknum=${code}`;
    default:
      return null;
  }
}
