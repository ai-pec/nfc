import { supabaseAdmin } from "@/lib/supabase";

type AuthIdentityUser = {
  id: string;
  email: string;
  name?: string | null;
};

function slugify(value: string) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 40);
}

async function createUniqueSlug(name: string) {
  const base = slugify(name) || `profile-${crypto.randomUUID().slice(0, 8)}`;

  for (let index = 0; index < 10; index += 1) {
    const candidate = index === 0 ? base : `${base}-${index + 1}`;
    const { data } = await supabaseAdmin.from("portfolios").select("uid").eq("slug", candidate).maybeSingle();

    if (!data) {
      return candidate;
    }
  }

  return `${base}-${crypto.randomUUID().slice(0, 6)}`;
}

export async function ensureAppUserForAuthUser(user: AuthIdentityUser) {
  const normalizedEmail = user.email.trim().toLowerCase();
  const role = "user";

  let existingUser = await supabaseAdmin
    .from("users")
    .select("uid, email, name, role, supabase_auth_user_id")
    .eq("supabase_auth_user_id", user.id)
    .maybeSingle();

  if (!existingUser.data && !existingUser.error) {
    existingUser = await supabaseAdmin
      .from("users")
      .select("uid, email, name, role, supabase_auth_user_id")
      .eq("email", normalizedEmail)
      .maybeSingle();
  }

  if (existingUser.error) {
    throw existingUser.error;
  }

  let appUid = existingUser.data?.uid as string | undefined;

  if (!appUid) {
    const insertedUser = await supabaseAdmin
      .from("users")
      .insert({
        email: normalizedEmail,
        name: user.name ?? normalizedEmail.split("@")[0],
        supabase_auth_user_id: user.id,
        role,
        profile_completed: false,
      })
      .select("uid")
      .single();

    if (insertedUser.error) {
      throw insertedUser.error;
    }

    appUid = insertedUser.data.uid as string;
  } else {
    const nextName = user.name ?? normalizedEmail.split("@")[0];
    const needsUserRefresh =
      existingUser.data.email !== normalizedEmail ||
      existingUser.data.name !== nextName ||
      existingUser.data.supabase_auth_user_id !== user.id ||
      existingUser.data.role !== role;

    if (needsUserRefresh) {
      const updatedUser = await supabaseAdmin
        .from("users")
        .update({
          email: normalizedEmail,
          name: nextName,
          supabase_auth_user_id: user.id,
          role,
        })
        .eq("uid", appUid)
        .select("uid")
        .single();

      if (updatedUser.error) {
        throw updatedUser.error;
      }
    }
  }

  const existingPortfolio = await supabaseAdmin.from("portfolios").select("uid").eq("uid", appUid).maybeSingle();

  if (existingPortfolio.error) {
    throw existingPortfolio.error;
  }

  if (!existingPortfolio.data) {
    const slug = await createUniqueSlug(user.name ?? normalizedEmail.split("@")[0] ?? "profile");
    const portfolioInsert = await supabaseAdmin.from("portfolios").insert({
      uid: appUid,
      slug,
      name: user.name ?? normalizedEmail.split("@")[0],
      published: false,
      theme: "light",
      canvas: {
        generatedAt: null,
        source: "bootstrap",
        sections: [],
      },
    });

    if (portfolioInsert.error) {
      throw portfolioInsert.error;
    }
  }

  return { appUid, role };
}

export async function deleteAppUserForAuthUser(authUserId: string) {
  const existingUser = await supabaseAdmin
    .from("users")
    .select("uid")
    .eq("supabase_auth_user_id", authUserId)
    .maybeSingle();

  if (existingUser.error) {
    throw existingUser.error;
  }

  const appUid = existingUser.data?.uid as string | undefined;

  if (!appUid) {
    return;
  }

  const deletions = [
    supabaseAdmin.from("addresses").delete().eq("owner_uid", appUid),
    supabaseAdmin.from("contact_requests").delete().eq("owner_uid", appUid),
    supabaseAdmin.from("orders").delete().eq("uid", appUid),
    supabaseAdmin.from("portfolio_events").delete().eq("owner_uid", appUid),
    supabaseAdmin.from("portfolios").delete().eq("uid", appUid),
    supabaseAdmin.from("users").delete().eq("uid", appUid),
  ];

  const results = await Promise.all(deletions);
  const failed = results.find((result) => result.error);

  if (failed?.error) {
    throw failed.error;
  }
}
