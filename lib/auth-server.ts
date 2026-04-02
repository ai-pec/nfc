import "server-only";
import { cache } from "react";
import { redirect } from "next/navigation";
import { supabaseAdmin } from "@/lib/supabase";
import { createSupabaseServerClient } from "@/lib/supabase-server";
import { hasAdminSession } from "@/lib/admin";
import { ensureAppUserForAuthUser } from "@/lib/user-sync";

export type AppAuthSession = {
  user: {
    id: string;
    email: string | null;
    name: string | null;
  };
};

export const getAuthSession = cache(async () => {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase.auth.getUser();

  if (error || !data.user) {
    return null;
  }

  return {
    user: {
      id: data.user.id,
      email: data.user.email ?? null,
      name:
        (typeof data.user.user_metadata?.full_name === "string" && data.user.user_metadata.full_name) ||
        (typeof data.user.user_metadata?.name === "string" && data.user.user_metadata.name) ||
        null,
    },
  } satisfies AppAuthSession;
});

export const getCurrentAppUser = cache(async () => {
  const session = await getAuthSession();

  if (!session?.user?.id || !session.user.email) {
    return null;
  }

  const { appUid } = await ensureAppUserForAuthUser({
    id: session.user.id,
    email: session.user.email,
    name: session.user.name,
  });

  const { data, error } = await supabaseAdmin
    .from("users")
    .select("uid, email, name, role, account_status, profile_completed")
    .eq("uid", appUid)
    .maybeSingle();

  if (error) {
    throw error;
  }

  return data;
});

export async function requireAuth() {
  const session = await getAuthSession();

  if (!session?.user) {
    redirect("/login");
  }

  return session satisfies AppAuthSession;
}

export async function requireAdmin() {
  const session = await requireAuth();
  const appUser = await getCurrentAppUser();
  const isAdmin = await hasAdminSession(appUser?.uid);

  if (!isAdmin) {
    redirect("/admin");
  }

  return { session, appUser };
}
