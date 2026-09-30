import { createClient } from "@supabase/supabase-js";

// Yalnızca sunucu-sunucu (webhook gibi) çağrılarda kullanılır — RLS'i atlar.
// Tarayıcıya veya "use client" bileşenlere asla aktarılmamalıdır.
export function createServiceClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !serviceRoleKey) {
    throw new Error("SUPABASE_SERVICE_ROLE_KEY (.env) eksik");
  }

  return createClient(url, serviceRoleKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}
