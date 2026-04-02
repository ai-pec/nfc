import type { CookieOptions } from "@supabase/ssr";

function isLocalHostname(hostname: string) {
  return hostname === "localhost" || hostname === "127.0.0.1";
}

export function normalizeSupabaseCookieOptions(
  requestUrl: URL,
  options: CookieOptions | undefined,
): CookieOptions | undefined {
  if (!options) {
    return options;
  }

  const secure = requestUrl.protocol === "https:" || isLocalHostname(requestUrl.hostname);

  return {
    ...options,
    secure,
    sameSite: options.sameSite ?? "lax",
  };
}

export function resolveOAuthAppOrigin(currentOrigin: string) {
  try {
    const currentUrl = new URL(currentOrigin);

    if (isLocalHostname(currentUrl.hostname)) {
      return currentOrigin;
    }
  } catch {
    return process.env.NEXT_PUBLIC_APP_URL ?? currentOrigin;
  }

  return process.env.NEXT_PUBLIC_APP_URL ?? currentOrigin;
}
