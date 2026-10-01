import { createClient } from "@supabase/supabase-js";

// Çerez/oturum kullanmayan anonim istemci. Herkese açık, salt okunur veri
// (ürünler, kategoriler, site ayarları vb.) için kullanılır. cookies()
// çağırmadığı için sayfaların statik/ISR olarak render edilmesini engellemez.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
let client: ReturnType<typeof createClient<any>> | null = null;

export function createPublicClient() {
  if (!client) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    client = createClient<any>(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      { auth: { persistSession: false, autoRefreshToken: false } },
    );
  }
  return client;
}
