import "server-only";
import { redirect } from "next/navigation";
import { supabaseAdmin } from "@/lib/supabase";
import { createSupabaseServerClient } from "@/lib/supabase-server";
import { ADMIN_EMAILS } from "@/lib/admin";
import { ensureAppUserForAuthUser } from "@/lib/user-sync";

export type AppAuthSession = {
  user: {
    id: string;
    email: string | null;
    name: string | null;
  };
};

export async function getAuthSession() {
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
}

export async function getCurrentAppUser() {
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
    .select("uid, email, name, role, account_status")
    .eq("uid", appUid)
    .maybeSingle();

  if (error) {
    throw error;
  }

  return data;
}

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

  const allowlisted = session.user.email ? ADMIN_EMAILS.includes(session.user.email.toLowerCase()) : false;
  const isAdmin = allowlisted || appUser?.role === "admin";

  if (!isAdmin) {
    redirect("/");
  }

  return { session, appUser };
}
