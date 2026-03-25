export const supabaseConfig = {
  projectId: process.env.NEXT_PUBLIC_SUPABASE_PROJECT_ID ?? "",
  publishableKey: process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ?? "",
  anonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "",
  url: process.env.NEXT_PUBLIC_SUPABASE_PROJECT_ID
    ? `https://${process.env.NEXT_PUBLIC_SUPABASE_PROJECT_ID}.supabase.co`
    : "",
};

export const supabaseReady =
  Boolean(supabaseConfig.projectId) &&
  Boolean(supabaseConfig.publishableKey) &&
  Boolean(supabaseConfig.anonKey);
