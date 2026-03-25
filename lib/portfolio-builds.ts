import "server-only";
import { PostgrestError } from "@supabase/supabase-js";
import { generatePortfolioBlueprint, type PortfolioRow } from "@/lib/portfolio-ai";
import { getPortfolioPublicUrl } from "@/lib/portfolio-url";
import { supabaseAdmin } from "@/lib/supabase";

function isMissingTableError(error: PostgrestError | null) {
  return error?.code === "42P01" || error?.message.toLowerCase().includes("portfolio_builds");
}

function buildTableError() {
  return new Error("Run docs/portfolio-builds.sql in Supabase before using the portfolio build pipeline.");
}

export async function getLatestPortfolioBuild(portfolioUid: string) {
  const { data, error } = await supabaseAdmin
    .from("portfolio_builds")
    .select("id, status, stage, style_prompt, public_url, error_message, requested_at, completed_at")
    .eq("portfolio_uid", portfolioUid)
    .order("requested_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (isMissingTableError(error)) {
    return null;
  }

  if (error) {
    throw error;
  }

  return data;
}

type RunPortfolioBuildInput = {
  portfolio: PortfolioRow;
  requestedByUid: string;
  stylePrompt: string;
  intakePayload: Record<string, unknown>;
};

export async function runPortfolioBuild({
  portfolio,
  requestedByUid,
  stylePrompt,
  intakePayload,
}: RunPortfolioBuildInput) {
  const publicUrl = getPortfolioPublicUrl({ slug: portfolio.slug });
  const queuedAt = new Date().toISOString();

  const insertedBuild = await supabaseAdmin
    .from("portfolio_builds")
    .insert({
      portfolio_uid: portfolio.uid,
      requested_by_uid: requestedByUid,
      status: "queued",
      stage: "intake",
      style_prompt: stylePrompt,
      intake_payload: intakePayload,
      public_url: publicUrl,
      requested_at: queuedAt,
      updated_at: queuedAt,
    })
    .select("id")
    .single();

  if (isMissingTableError(insertedBuild.error)) {
    throw buildTableError();
  }

  if (insertedBuild.error) {
    throw insertedBuild.error;
  }

  const buildId = insertedBuild.data.id as string;

  await supabaseAdmin
    .from("portfolio_builds")
    .update({
      status: "processing",
      stage: "generation",
      started_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })
    .eq("id", buildId);

  try {
    const blueprint = await generatePortfolioBlueprint(portfolio, stylePrompt, intakePayload);
    const completedAt = new Date().toISOString();
    const completedBuild = await supabaseAdmin
      .from("portfolio_builds")
      .update({
        status: "completed",
        stage: "ready",
        blueprint,
        public_url: publicUrl,
        completed_at: completedAt,
        updated_at: completedAt,
      })
      .eq("id", buildId)
      .select("id, status, stage, public_url, completed_at")
      .single();

    if (completedBuild.error) {
      throw completedBuild.error;
    }

    return {
      build: completedBuild.data,
      blueprint,
      publicUrl,
    };
  } catch (error) {
    await supabaseAdmin
      .from("portfolio_builds")
      .update({
        status: "failed",
        stage: "generation",
        error_message: error instanceof Error ? error.message : "Portfolio build failed",
        updated_at: new Date().toISOString(),
      })
      .eq("id", buildId);

    throw error;
  }
}
