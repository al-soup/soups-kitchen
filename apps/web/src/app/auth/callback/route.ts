import { NextResponse } from "next/server";
import { getSupabaseServer } from "@/lib/supabase/server";
import { safeRedirect } from "@/lib/safeRedirect";

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const next = searchParams.get("next");

  const safePath = safeRedirect(next);

  if (code) {
    const supabase = await getSupabaseServer();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      return NextResponse.redirect(new URL(safePath, origin));
    }
  }

  return NextResponse.redirect(new URL("/login?error=auth", origin));
}
