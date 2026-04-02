import { NextResponse, type NextRequest } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { normalizeSupabaseCookieOptions } from "@/lib/auth-cookie";
import { supabaseConfig } from "@/lib/supabase-config";

// Routes that require authentication
const protectedRoutes = ["/dashboard", "/onboarding", "/profile"];

// Routes that should redirect authenticated users away
const authRoutes = ["/login", "/signup", "/auth/sign-in", "/auth/sign-up"];

function isProtectedRoute(pathname: string) {
  return protectedRoutes.some((route) => pathname === route || pathname.startsWith(`${route}/`));
}

function isAuthRoute(pathname: string) {
  return authRoutes.some((route) => pathname === route || pathname.startsWith(`${route}/`));
}

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const needsAuthCheck = isProtectedRoute(pathname) || isAuthRoute(pathname);

  // Skip for API routes - let them handle their own auth
  if (pathname.startsWith("/api/")) {
    return NextResponse.next();
  }

  if (!needsAuthCheck || !supabaseConfig.url || !supabaseConfig.anonKey) {
    return NextResponse.next();
  }

  const response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  });

  const supabase = createServerClient(supabaseConfig.url, supabaseConfig.anonKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value, options }) => {
          request.cookies.set(name, value);
          response.cookies.set(name, value, normalizeSupabaseCookieOptions(request.nextUrl, options));
        });
      },
    },
  });

  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Protected routes - require authentication
  if (isProtectedRoute(pathname) && !user) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("next", pathname);
    return NextResponse.redirect(loginUrl);
  }

  // Auth routes - redirect authenticated users to dashboard
  if (isAuthRoute(pathname) && user) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  return response;
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)"],
};
