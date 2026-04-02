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

  const [userResult, ordersResult, latestBuildResult] = await Promise.all([
    supabaseAdmin.from("users").select("purchased").eq("uid", appUser.uid).maybeSingle(),
    supabaseAdmin.from("orders").select("id", { count: "exact", head: true }).eq("uid", appUser.uid).in("status", ["paid", "completed"]),
    supabaseAdmin
      .from("portfolio_builds")
      .select("id, status, validation_result")
      .eq("portfolio_uid", appUser.uid)
      .order("requested_at", { ascending: false })
      .limit(1)
      .maybeSingle(),
  ]);

  const paymentVerified = Boolean(userResult.data?.purchased) || (ordersResult.count ?? 0) > 0;

  if (!paymentVerified) {
    return NextResponse.json({ error: "Payment is required before publishing the portfolio." }, { status: 403 });
  }

  const latestBuild = latestBuildResult.data;

  if (latestBuildResult.error || !latestBuild) {
    return NextResponse.json({ error: "Generate a portfolio build before publishing." }, { status: 400 });
  }

  if (latestBuild.status !== "completed") {
    return NextResponse.json({ error: "The latest build is not ready for publishing yet." }, { status: 400 });
  }

  const publishReady =
    latestBuild.validation_result &&
    typeof latestBuild.validation_result === "object" &&
    "publishReady" in latestBuild.validation_result
      ? Boolean((latestBuild.validation_result as { publishReady?: unknown }).publishReady)
      : false;

  if (!publishReady) {
    return NextResponse.json({ error: "The latest build failed validation and cannot be published." }, { status: 400 });
  }

  const adminReviewResult = await supabaseAdmin
    .from("portfolio_reviews")
    .select("status")
    .eq("build_id", latestBuild.id)
    .eq("reviewer_type", "admin")
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (adminReviewResult.data && adminReviewResult.data.status !== "approved") {
    return NextResponse.json({ error: "The latest build still needs admin approval before publishing." }, { status: 403 });
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

  await supabaseAdmin
    .from("portfolio_builds")
    .update({
      stage: "publish",
      public_url: publishedUrl,
      published_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })
    .eq("portfolio_uid", appUser.uid)
    .eq("status", "completed");

  const vercelResult = await queueVercelPortfolioDeployment({
    slug: portfolio.slug,
    portfolioUid: appUser.uid,
    publishedUrl: publishedUrl ?? "",
  });

  return NextResponse.json({ ok: true, publishedUrl, vercelResult });
}
