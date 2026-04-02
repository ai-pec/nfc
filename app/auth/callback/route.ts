import { NextResponse, type NextRequest } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { normalizeSupabaseCookieOptions } from "@/lib/auth-cookie";
import { supabaseConfig } from "@/lib/supabase-config";
import { supabaseAdmin } from "@/lib/supabase";

function sanitizeNextPath(value: string | null) {
  if (!value || !value.startsWith("/") || value.startsWith("//")) {
    return "/dashboard";
  }

  return value;
}

async function checkUserExists(email: string): Promise<boolean> {
  const normalizedEmail = email.trim().toLowerCase();

  const { data } = await supabaseAdmin
    .from("users")
    .select("uid")
    .eq("email", normalizedEmail)
    .maybeSingle();

  return Boolean(data);
}

async function ensureUserExists(userId: string, email: string, name: string | null) {
  const normalizedEmail = email.trim().toLowerCase();

  // Check if user already exists
  const { data: existingUser } = await supabaseAdmin
    .from("users")
    .select("uid")
    .eq("email", normalizedEmail)
    .maybeSingle();

  if (existingUser) {
    // Update supabase_auth_user_id if needed
    await supabaseAdmin
      .from("users")
      .update({ supabase_auth_user_id: userId })
      .eq("uid", existingUser.uid);
    return existingUser.uid;
  }

  // Create new user
  const { data: newUser, error } = await supabaseAdmin
    .from("users")
    .insert({
      email: normalizedEmail,
      name: name ?? normalizedEmail.split("@")[0],
      supabase_auth_user_id: userId,
      role: "user",
      account_status: "active",
      profile_completed: false,
    })
    .select("uid")
    .single();

  if (error || !newUser) {
    console.error("Failed to create user:", error);
    return null;
  }

  // Create portfolio for the user
  const slug = normalizedEmail.split("@")[0].toLowerCase().replace(/[^a-z0-9]/g, "-");
  await supabaseAdmin.from("portfolios").insert({
    uid: newUser.uid,
    slug: `${slug}-${Date.now().toString(36)}`,
    name: name ?? normalizedEmail.split("@")[0],
    email: normalizedEmail,
    published: false,
    site_paused: false,
  });

  return newUser.uid;
}

async function getRedirectPathForUser(userId: string, email: string, name: string | null, preferredPath: string) {
  const normalizedEmail = email.trim().toLowerCase();

  // Check if user exists and has completed profile
  let existingUser = await supabaseAdmin
    .from("users")
    .select("uid, profile_completed, supabase_auth_user_id")
    .eq("supabase_auth_user_id", userId)
    .maybeSingle();

  if (!existingUser.data && !existingUser.error) {
    existingUser = await supabaseAdmin
      .from("users")
      .select("uid, profile_completed, supabase_auth_user_id")
      .eq("email", normalizedEmail)
      .maybeSingle();
  }

  // If user exists and has completed profile, go to preferred path (usually dashboard)
  if (existingUser.data?.profile_completed) {
    return preferredPath;
  }

  // New user or user without completed profile - go to onboarding
  return "/onboarding";
}

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get("code");
  const tokenHash = requestUrl.searchParams.get("token_hash");
  const authType = requestUrl.searchParams.get("type");
  const preferredPath = sanitizeNextPath(requestUrl.searchParams.get("next"));
  const authMode = requestUrl.searchParams.get("mode") ?? "sign-in"; // Default to sign-in for safety

  if (!supabaseConfig.url || !supabaseConfig.anonKey) {
    return NextResponse.redirect(new URL(`/login?next=${encodeURIComponent(preferredPath)}`, requestUrl.origin));
  }

  // Create a temporary response to collect cookies
  let finalRedirectPath = preferredPath;
  const tempResponse = NextResponse.redirect(new URL(preferredPath, requestUrl.origin));

  const supabase = createServerClient(supabaseConfig.url, supabaseConfig.anonKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value, options }) => {
          tempResponse.cookies.set(name, value, normalizeSupabaseCookieOptions(requestUrl, options));
        });
      },
    },
  });

  let authUser: { id: string; email?: string; user_metadata?: Record<string, unknown> } | null = null;

  if (code) {
    const { data, error } = await supabase.auth.exchangeCodeForSession(code);

    if (error) {
      return NextResponse.redirect(new URL(`/login?next=${encodeURIComponent(preferredPath)}&error=auth_failed`, requestUrl.origin));
    }

    authUser = data.user;
  } else if (tokenHash && authType) {
    const { data, error } = await supabase.auth.verifyOtp({
      token_hash: tokenHash,
      type: authType as "signup" | "recovery" | "email_change" | "invite" | "magiclink",
    });

    if (error) {
      return NextResponse.redirect(new URL(`/login?next=${encodeURIComponent(preferredPath)}&error=verification_failed`, requestUrl.origin));
    }

    authUser = data.user;
  } else {
    return NextResponse.redirect(new URL(`/login?next=${encodeURIComponent(preferredPath)}`, requestUrl.origin));
  }

  // Check if this is a sign-in attempt and user doesn't exist in our database
  if (authUser?.email && authMode === "sign-in") {
    const userExists = await checkUserExists(authUser.email);

    if (!userExists) {
      // User is trying to sign in but doesn't have an account
      // Sign them out and redirect with error
      await supabase.auth.signOut();

      // Create redirect response and clear auth cookies
      const errorRedirect = NextResponse.redirect(
        new URL(`/login?error=user_not_found`, requestUrl.origin)
      );

      // Clear all Supabase auth cookies
      request.cookies.getAll().forEach((cookie) => {
        if (cookie.name.includes("supabase") || cookie.name.includes("sb-")) {
          errorRedirect.cookies.delete(cookie.name);
        }
      });

      return errorRedirect;
    }
  }

  // For sign-up mode, ensure user exists in our database
  if (authUser?.id && authUser.email && authMode === "sign-up") {
    const userName =
      (typeof authUser.user_metadata?.full_name === "string" && authUser.user_metadata.full_name) ||
      (typeof authUser.user_metadata?.name === "string" && authUser.user_metadata.name) ||
      null;

    await ensureUserExists(authUser.id, authUser.email, userName);
  }

  // Determine the correct redirect based on user's profile status
  if (authUser?.id && authUser.email) {
    const userName =
      (typeof authUser.user_metadata?.full_name === "string" && authUser.user_metadata.full_name) ||
      (typeof authUser.user_metadata?.name === "string" && authUser.user_metadata.name) ||
      null;

    finalRedirectPath = await getRedirectPathForUser(authUser.id, authUser.email, userName, preferredPath);
  }

  // Create final response with correct redirect path and all cookies
  const response = NextResponse.redirect(new URL(finalRedirectPath, requestUrl.origin));

  // Copy all cookies from temp response to final response
  tempResponse.cookies.getAll().forEach((cookie) => {
    response.cookies.set(cookie.name, cookie.value, {
      path: "/",
      sameSite: "lax",
      secure: requestUrl.protocol === "https:",
    });
  });

  return response;
}
