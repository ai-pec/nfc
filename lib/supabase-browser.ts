"use client";

import { createBrowserClient } from "@supabase/ssr";
import { supabaseConfig } from "@/lib/supabase-config";

let browserClient: ReturnType<typeof createBrowserClient> | null = null;

export function getSupabaseBrowserClient() {
  if (!browserClient) {
    if (!supabaseConfig.url || !supabaseConfig.anonKey) {
      throw new Error("Missing public Supabase config for browser auth.");
    }

    browserClient = createBrowserClient(supabaseConfig.url, supabaseConfig.anonKey);
  }

  return browserClient;
}
