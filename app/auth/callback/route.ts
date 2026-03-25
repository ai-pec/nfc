import { NextResponse, type NextRequest } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { supabaseConfig } from "@/lib/supabase-config";

function sanitizeNextPath(value: string | null) {
  if (!value || !value.startsWith("/") || value.startsWith("//")) {
    return "/dashboard";
  }

  return value;
}

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get("code");
  const tokenHash = requestUrl.searchParams.get("token_hash");
  const authType = requestUrl.searchParams.get("type");
  const nextPath = sanitizeNextPath(requestUrl.searchParams.get("next"));

  const response = NextResponse.redirect(new URL(nextPath, requestUrl.origin));

  if (!supabaseConfig.url || !supabaseConfig.anonKey) {
    return NextResponse.redirect(new URL(`/login?next=${encodeURIComponent(nextPath)}`, requestUrl.origin));
  }

  const supabase = createServerClient(supabaseConfig.url, supabaseConfig.anonKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value, options }) => {
          response.cookies.set(name, value, options);
        });
      },
    },
  });

  if (code) {
    const { error } = await supabase.auth.exchangeCodeForSession(code);

    if (error) {
      return NextResponse.redirect(new URL(`/login?next=${encodeURIComponent(nextPath)}`, requestUrl.origin));
    }
  } else if (tokenHash && authType) {
    const { error } = await supabase.auth.verifyOtp({
      token_hash: tokenHash,
      type: authType as "signup" | "recovery" | "email_change" | "invite" | "magiclink",
    });

    if (error) {
      return NextResponse.redirect(new URL(`/login?next=${encodeURIComponent(nextPath)}`, requestUrl.origin));
    }
  } else {
    return NextResponse.redirect(new URL(`/login?next=${encodeURIComponent(nextPath)}`, requestUrl.origin));
  }

  return response;
}
