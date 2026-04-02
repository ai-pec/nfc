"use client";

import { getSupabaseBrowserClient } from "@/lib/supabase-browser";

// Lazy getter to avoid SSR issues - only creates client when actually used in browser
export function getAuthClient() {
  return getSupabaseBrowserClient();
}

// For backwards compatibility - but prefer using getAuthClient() directly
export const authClient = typeof window !== "undefined" ? getSupabaseBrowserClient() : (null as never);
