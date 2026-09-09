import { NextResponse, type NextRequest } from "next/server";
import { createProxyClient } from "@/lib/supabase/proxy";
import { isProtectedPath } from "@/lib/protectedRoutes";

export async function proxy(request: NextRequest) {
  const { supabase, response } = createProxyClient(request);
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { pathname, search } = request.nextUrl;
  if (!user && isProtectedPath(pathname)) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    url.search = `?redirectTo=${encodeURIComponent(pathname + search)}`;
    const redirect = NextResponse.redirect(url);
    // Keep any refreshed/cleared auth cookies from the Supabase client.
    for (const cookie of response().cookies.getAll()) {
      redirect.cookies.set(cookie);
    }
    return redirect;
  }

  return response();
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
