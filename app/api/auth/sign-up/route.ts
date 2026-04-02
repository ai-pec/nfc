import { NextResponse, type NextRequest } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { normalizeSupabaseCookieOptions } from "@/lib/auth-cookie";
import { supabaseConfig } from "@/lib/supabase-config";

export async function POST(request: NextRequest) {
  if (!supabaseConfig.url || !supabaseConfig.anonKey) {
    return NextResponse.json({ error: "Supabase auth is not configured" }, { status: 500 });
  }

  const body = await request.json();
  const email = typeof body.email === "string" ? body.email : "";
  const password = typeof body.password === "string" ? body.password : "";
  const name = typeof body.name === "string" ? body.name : "";
  const nextPath =
    typeof body.nextPath === "string" && body.nextPath.startsWith("/") && !body.nextPath.startsWith("//")
      ? body.nextPath
      : "/onboarding";

  const response = NextResponse.json({ ok: true, nextPath });
  const supabase = createServerClient(supabaseConfig.url, supabaseConfig.anonKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value, options }) => {
          response.cookies.set(name, value, normalizeSupabaseCookieOptions(request.nextUrl, options));
        });
      },
    },
  });

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        name,
        full_name: name,
      },
      emailRedirectTo: `${request.nextUrl.origin}/auth/callback?next=${encodeURIComponent(nextPath)}`,
    },
  });

  if (error) {
    return NextResponse.json({ error: error.message ?? "Sign-up failed" }, { status: 400 });
  }

  return NextResponse.json({
    ok: true,
    nextPath,
    needsEmailConfirmation: !data.session,
  });
}
