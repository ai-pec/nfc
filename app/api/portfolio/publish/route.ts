import { NextResponse } from "next/server";
import { getCurrentAppUser, requireAuth } from "@/lib/auth-server";
import { getPortfolioPublicUrl } from "@/lib/portfolio-url";
import { supabaseAdmin } from "@/lib/supabase";
import { queueVercelPortfolioDeployment } from "@/lib/vercel-deploy";

export async function POST() {
  await requireAuth();
  const appUser = await getCurrentAppUser();

  if (!appUser?.uid) {
    return NextResponse.json({ error: "App user not found" }, { status: 404 });
  }

  const { data: portfolio, error: readError } = await supabaseAdmin
    .from("portfolios")
    .select("slug")
    .eq("uid", appUser.uid)
    .single();

  if (readError || !portfolio) {
    return NextResponse.json({ error: "Portfolio not found" }, { status: 404 });
  }

  const publishedUrl = getPortfolioPublicUrl({ slug: portfolio.slug });

  const result = await supabaseAdmin
    .from("portfolios")
    .update({
      published: true,
      site_paused: false,
      updated_at: new Date().toISOString(),
    })
    .eq("uid", appUser.uid);

  if (result.error) {
    return NextResponse.json({ error: result.error.message }, { status: 500 });
  }

  const vercelResult = await queueVercelPortfolioDeployment({
    slug: portfolio.slug,
    portfolioUid: appUser.uid,
    publishedUrl: publishedUrl ?? "",
  });

  return NextResponse.json({ ok: true, publishedUrl, vercelResult });
}
