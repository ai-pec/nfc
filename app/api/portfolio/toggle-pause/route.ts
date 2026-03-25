import { NextResponse } from "next/server";
import { getCurrentAppUser, requireAuth } from "@/lib/auth-server";
import { supabaseAdmin } from "@/lib/supabase";

export async function POST() {
  await requireAuth();
  const appUser = await getCurrentAppUser();

  if (!appUser?.uid) {
    return NextResponse.json({ error: "App user not found" }, { status: 404 });
  }

  const { data: portfolio, error: readError } = await supabaseAdmin
    .from("portfolios")
    .select("site_paused")
    .eq("uid", appUser.uid)
    .single();

  if (readError || !portfolio) {
    return NextResponse.json({ error: "Portfolio not found" }, { status: 404 });
  }

  const result = await supabaseAdmin
    .from("portfolios")
    .update({
      site_paused: !portfolio.site_paused,
      updated_at: new Date().toISOString(),
    })
    .eq("uid", appUser.uid);

  if (result.error) {
    return NextResponse.json({ error: result.error.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
