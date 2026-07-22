import { NextRequest, NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabaseServer";

// Supabase Auth callback handler — exchanges code for session
export async function GET(req: NextRequest) {
  const { searchParams, origin } = new URL(req.url);
  const code = searchParams.get("code");
  const next = searchParams.get("next") ?? "/";

  if (code) {
    const supabase = await createServerSupabaseClient();
    const { data, error } = await supabase.auth.exchangeCodeForSession(code);

    if (!error && data.user) {
      const role = data.user.user_metadata?.role ?? "student";
      return NextResponse.redirect(`${origin}/dashboard/${role}`);
    }
  }

  return NextResponse.redirect(`${origin}/login?error=auth_failed`);
}
