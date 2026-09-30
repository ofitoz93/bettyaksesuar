// TCMB günlük döviz kuru servisinden USD/TRY satış kurunu çeker.
// Basit regex ile ayrıştırma yapılır; tam bir XML parser gerektirmeyecek kadar
// sabit bir yapıya sahip olduğu için ek bağımlılık eklenmedi.
export async function fetchTcmbUsdRate(): Promise<number | null> {
  try {
    const response = await fetch("https://www.tcmb.gov.tr/kurlar/today.xml", {
      cache: "no-store",
    });
    if (!response.ok) return null;

    const xml = await response.text();
    const usdBlockMatch = xml.match(/<Currency[^>]*Kod="USD"[^>]*>([\s\S]*?)<\/Currency>/);
    if (!usdBlockMatch) return null;

    const sellingMatch = usdBlockMatch[1].match(/<ForexSelling>([\d.,]+)<\/ForexSelling>/);
    if (!sellingMatch) return null;

    const rate = Number(sellingMatch[1].replace(",", "."));
    return Number.isFinite(rate) && rate > 0 ? rate : null;
  } catch (err) {
    console.error("fetchTcmbUsdRate error:", err);
    return null;
  }
}
