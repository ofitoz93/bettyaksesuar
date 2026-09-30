import { type NextRequest } from "next/server";
import { updateSession } from "@/lib/supabase/middleware";

export async function middleware(request: NextRequest) {
  return updateSession(request);
}

export const config = {
  // _next varlıkları, favicon ve uzantılı statik dosyalar (görsel/font/css/js vb.)
  // middleware'den geçmez — her sayfa isteğinde gereksiz DB sorgusu/gecikme olmaz.
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\..*).*)"],
};
