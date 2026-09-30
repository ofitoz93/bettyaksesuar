import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

export async function updateSession(request: NextRequest) {
  let response = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value),
          );
          response = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options),
          );
        },
      },
    },
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { pathname } = request.nextUrl;
  const isAdminRoute = pathname.startsWith("/admin");
  const isAdminLoginRoute = pathname === "/admin/login";
  const isAccountRoute = pathname.startsWith("/hesabim");
  const isAccountAuthRoute = pathname === "/hesabim/giris" || pathname === "/hesabim/kayit";
  const isApiRoute = pathname.startsWith("/api");
  const isMaintenancePage = pathname === "/bakim";

  let isAdmin = false;
  if (user) {
    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .maybeSingle();
    isAdmin = profile?.role === "admin";
  }

  if (!isAdminRoute && !isApiRoute && !isMaintenancePage && !isAdmin) {
    const { data: storeSettings } = await supabase
      .from("store_settings")
      .select("maintenance_mode")
      .eq("id", 1)
      .maybeSingle();

    if (storeSettings?.maintenance_mode) {
      const url = request.nextUrl.clone();
      url.pathname = "/bakim";
      return NextResponse.redirect(url);
    }
  }

  if (isAdminRoute && !isAdminLoginRoute && !isAdmin) {
    const url = request.nextUrl.clone();
    url.pathname = "/admin/login";
    return NextResponse.redirect(url);
  }

  if (isAdminLoginRoute && isAdmin) {
    const url = request.nextUrl.clone();
    url.pathname = "/admin";
    return NextResponse.redirect(url);
  }

  if (isAccountRoute && !isAccountAuthRoute && !user) {
    const url = request.nextUrl.clone();
    url.pathname = "/hesabim/giris";
    return NextResponse.redirect(url);
  }

  if (isAccountAuthRoute && user) {
    const url = request.nextUrl.clone();
    url.pathname = "/hesabim";
    return NextResponse.redirect(url);
  }

  return response;
}
