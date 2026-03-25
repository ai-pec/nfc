import "server-only";
import { createClient } from "@supabase/supabase-js";

const projectId = process.env.NEXT_PUBLIC_SUPABASE_PROJECT_ID;
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!projectId) {
  throw new Error("Missing NEXT_PUBLIC_SUPABASE_PROJECT_ID");
}

if (!anonKey) {
  throw new Error("Missing NEXT_PUBLIC_SUPABASE_ANON_KEY");
}

if (!serviceRoleKey) {
  throw new Error("Missing SUPABASE_SERVICE_ROLE_KEY");
}

export const supabaseUrl = `https://${projectId}.supabase.co`;
export const supabaseAnonKey = anonKey;

export const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});

export const supabasePublic = createClient(supabaseUrl, anonKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});
