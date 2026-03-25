import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth-server";
import { supabaseAdmin } from "@/lib/supabase";

type RouteContext = {
  params: Promise<{
    uid: string;
  }>;
};

export async function POST(_: Request, context: RouteContext) {
  await requireAdmin();
  const { uid } = await context.params;

  const { data: portfolio, error: readError } = await supabaseAdmin
    .from("portfolios")
    .select("site_paused")
    .eq("uid", uid)
    .maybeSingle();

  if (readError || !portfolio) {
    return NextResponse.json({ error: "Portfolio not found" }, { status: 404 });
  }

  const result = await supabaseAdmin
    .from("portfolios")
    .update({
      site_paused: !portfolio.site_paused,
      updated_at: new Date().toISOString(),
    })
    .eq("uid", uid);

  if (result.error) {
    return NextResponse.json({ error: result.error.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true, sitePaused: !portfolio.site_paused });
}
