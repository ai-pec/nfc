import "server-only";
import { PostgrestError } from "@supabase/supabase-js";
import { generatePortfolioPackage, type PortfolioBuildArtifacts, type PortfolioRow } from "@/lib/portfolio-ai";
import { getPortfolioPublicUrl } from "@/lib/portfolio-url";
import { supabaseAdmin } from "@/lib/supabase";

function isMissingTableError(error: PostgrestError | null) {
  return error?.code === "42P01" || error?.message.toLowerCase().includes("portfolio_build");
}

function buildTableError() {
  return new Error("Run docs/portfolio-builds.sql in Supabase before using the multi-step portfolio build pipeline.");
}

function resolveStageProvider(source: string | undefined) {
  if (!source) {
    return "unknown";
  }

  if (source.startsWith("gemini")) {
    return "gemini";
  }

  if (source.startsWith("deepseek")) {
    return "deepseek";
  }

  if (source.startsWith("fallback")) {
    return "fallback";
  }

  return "unknown";
}

function resolveStageModel(source: string | undefined, stage: "intake" | "layout" | "validator") {
  const provider = resolveStageProvider(source);

  if (provider === "gemini") {
    if (stage === "intake") {
      return process.env.GEMINI_INTAKE_MODEL ?? process.env.GEMINI_FLASH_MODEL ?? "gemini-2.5-flash";
    }

    if (stage === "layout") {
      return process.env.GEMINI_LAYOUT_MODEL ?? process.env.GEMINI_PRO_MODEL ?? "gemini-2.5-pro";
    }

    return process.env.GEMINI_VALIDATOR_MODEL ?? process.env.GEMINI_PRO_MODEL ?? "gemini-2.5-pro";
  }

  if (provider === "deepseek") {
    return process.env.DEEPSEEK_MODEL ?? "deepseek-chat";
  }

  if (provider === "fallback") {
    return `fallback-${stage}`;
  }

  return null;
}

async function createBuildStep({
  buildId,
  stepKey,
  status,
  provider,
  model,
  inputPayload,
  outputPayload,
  errorMessage,
}: {
  buildId: string;
  stepKey: "intake" | "layout" | "validation" | "revision";
  status: "queued" | "processing" | "completed" | "failed";
  provider?: string;
  model?: string | null;
  inputPayload?: Record<string, unknown>;
  outputPayload?: Record<string, unknown>;
  errorMessage?: string;
}) {
  const { error } = await supabaseAdmin.from("portfolio_build_steps").insert({
    build_id: buildId,
    step_key: stepKey,
    status,
    provider: provider ?? null,
    model: model ?? null,
    input_payload: inputPayload ?? {},
    output_payload: outputPayload ?? null,
    error_message: errorMessage ?? null,
    started_at: status === "processing" ? new Date().toISOString() : null,
    completed_at: status === "completed" || status === "failed" ? new Date().toISOString() : null,
  });

  if (isMissingTableError(error)) {
    throw buildTableError();
  }

  if (error) {
    throw error;
  }
}

async function createReview(buildId: string, artifacts: PortfolioBuildArtifacts) {
  const { error } = await supabaseAdmin.from("portfolio_reviews").insert({
    build_id: buildId,
    reviewer_type: "ai",
    status: artifacts.validation.publishReady ? "approved" : "needs_revision",
    score: artifacts.validation.score,
    findings: artifacts.validation.issues,
  });

  if (isMissingTableError(error)) {
    throw buildTableError();
  }

  if (error) {
    throw error;
  }
}

function buildRevisionPrompt(stylePrompt: string, artifacts: PortfolioBuildArtifacts) {
  const issueLines = artifacts.validation.issues.map((issue, index) => `${index + 1}. ${issue.message}`).join("\n");
  const suggestionLines = artifacts.validation.suggestions.map((item, index) => `${index + 1}. ${item}`).join("\n");

  return [
    stylePrompt,
    "",
    "Revision instructions for the next layout pass:",
    issueLines || "1. Improve overall clarity and publish readiness.",
    "",
    "Validator suggestions:",
    suggestionLines || "1. Tighten the hierarchy and CTA clarity.",
  ].join("\n");
}

async function createVersion(portfolioUid: string, buildId: string, blueprint: PortfolioBuildArtifacts["blueprint"]) {
  const versionLookup = await supabaseAdmin
    .from("portfolio_versions")
    .select("version_number")
    .eq("portfolio_uid", portfolioUid)
    .order("version_number", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (isMissingTableError(versionLookup.error)) {
    throw buildTableError();
  }

  if (versionLookup.error) {
    throw versionLookup.error;
  }

  const nextVersionNumber = (versionLookup.data?.version_number ?? 0) + 1;

  const resetActive = await supabaseAdmin
    .from("portfolio_versions")
    .update({ is_active: false })
    .eq("portfolio_uid", portfolioUid)
    .eq("is_active", true);

  if (resetActive.error && !isMissingTableError(resetActive.error)) {
    throw resetActive.error;
  }

  const { error } = await supabaseAdmin.from("portfolio_versions").insert({
    portfolio_uid: portfolioUid,
    build_id: buildId,
    version_number: nextVersionNumber,
    schema_version: blueprint.schema_version,
    blueprint,
    is_active: true,
  });

  if (isMissingTableError(error)) {
    throw buildTableError();
  }

  if (error) {
    throw error;
  }
}

export async function getLatestPortfolioBuild(portfolioUid: string) {
  const { data, error } = await supabaseAdmin
    .from("portfolio_builds")
    .select("id, status, stage, schema_version, style_prompt, public_url, error_message, requested_at, completed_at")
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
  const modelPlan = {
    intake: process.env.GEMINI_INTAKE_MODEL ?? process.env.GEMINI_FLASH_MODEL ?? "gemini-2.5-flash",
    layoutPrimary: process.env.GEMINI_LAYOUT_MODEL ?? process.env.GEMINI_PRO_MODEL ?? "gemini-2.5-pro",
    layoutFallback: process.env.DEEPSEEK_MODEL ?? "deepseek-chat",
    layoutRefinement: process.env.DEEPSEEK_MODEL ?? "deepseek-chat",
    validator: process.env.GEMINI_VALIDATOR_MODEL ?? process.env.GEMINI_PRO_MODEL ?? "gemini-2.5-pro",
  };

  const insertedBuild = await supabaseAdmin
    .from("portfolio_builds")
    .insert({
      portfolio_uid: portfolio.uid,
      requested_by_uid: requestedByUid,
      status: "queued",
      stage: "intake",
      schema_version: "portfolio_schema_v2",
      style_prompt: stylePrompt,
      provider: "multi-provider",
      model_plan: modelPlan,
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

  try {
    await supabaseAdmin
      .from("portfolio_builds")
      .update({
        status: "processing",
        stage: "intake",
        started_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq("id", buildId);

    let artifacts = await generatePortfolioPackage(portfolio, stylePrompt, intakePayload);
    let finalStylePrompt = stylePrompt;

    await createBuildStep({
      buildId,
      stepKey: "intake",
      status: "completed",
      provider: resolveStageProvider(artifacts.intake.source),
      model: resolveStageModel(artifacts.intake.source, "intake"),
      inputPayload: {
        stylePrompt,
        intakePayload,
      },
      outputPayload: artifacts.intake,
    });

    await createBuildStep({
      buildId,
      stepKey: "layout",
      status: "completed",
      provider: resolveStageProvider(artifacts.blueprint.source),
      model: resolveStageModel(artifacts.blueprint.source, "layout"),
      inputPayload: artifacts.intake,
      outputPayload: artifacts.blueprint,
    });

    await createBuildStep({
      buildId,
      stepKey: "validation",
      status: artifacts.validation.publishReady ? "completed" : "failed",
      provider: resolveStageProvider(artifacts.validation.source),
      model: resolveStageModel(artifacts.validation.source, "validator"),
      inputPayload: {
        intake: artifacts.intake,
        blueprint: artifacts.blueprint,
      },
      outputPayload: artifacts.validation,
      errorMessage: artifacts.validation.publishReady ? undefined : artifacts.validation.issues.map((issue) => issue.message).join(" | "),
    });

    await createReview(buildId, artifacts);

    if (!artifacts.validation.publishReady) {
      const revisedPrompt = buildRevisionPrompt(stylePrompt, artifacts);
      const revisedArtifacts = await generatePortfolioPackage(portfolio, revisedPrompt, {
        ...intakePayload,
        revisionFrom: buildId,
        revisionReasons: artifacts.validation.issues.map((issue) => issue.message),
        revisionSuggestions: artifacts.validation.suggestions,
      });

      await createBuildStep({
        buildId,
        stepKey: "revision",
        status: revisedArtifacts.validation.publishReady ? "completed" : "failed",
        provider: resolveStageProvider(revisedArtifacts.blueprint.source),
        model: resolveStageModel(revisedArtifacts.blueprint.source, "layout"),
        inputPayload: {
          revisedPrompt,
          previousValidation: artifacts.validation,
        },
        outputPayload: {
          blueprint: revisedArtifacts.blueprint,
          validation: revisedArtifacts.validation,
        },
        errorMessage: revisedArtifacts.validation.publishReady
          ? undefined
          : revisedArtifacts.validation.issues.map((issue) => issue.message).join(" | "),
      });

      await createReview(buildId, revisedArtifacts);

      if (
        revisedArtifacts.validation.publishReady ||
        revisedArtifacts.validation.score >= artifacts.validation.score
      ) {
        artifacts = revisedArtifacts;
        finalStylePrompt = revisedPrompt;
      }
    }

    await createVersion(portfolio.uid, buildId, artifacts.blueprint);

    const completedAt = new Date().toISOString();
    const completedBuild = await supabaseAdmin
      .from("portfolio_builds")
      .update({
        status: artifacts.validation.publishReady ? "completed" : "failed",
        stage: artifacts.validation.publishReady ? "ready" : "validation",
        intake_result: artifacts.intake,
        blueprint: artifacts.blueprint,
        validation_result: artifacts.validation,
        style_prompt: finalStylePrompt,
        public_url: publicUrl,
        error_message: artifacts.validation.publishReady
          ? null
          : artifacts.validation.issues.map((issue) => issue.message).join(" | "),
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
      intake: artifacts.intake,
      blueprint: artifacts.blueprint,
      validation: artifacts.validation,
      publicUrl,
    };
  } catch (error) {
    await createBuildStep({
      buildId,
      stepKey: "validation",
      status: "failed",
      provider: "unknown",
      model: resolveStageModel(undefined, "validator"),
      errorMessage: error instanceof Error ? error.message : "Portfolio build failed",
    }).catch(() => undefined);

    await supabaseAdmin
      .from("portfolio_builds")
      .update({
        status: "failed",
        stage: "validation",
        error_message: error instanceof Error ? error.message : "Portfolio build failed",
        updated_at: new Date().toISOString(),
      })
      .eq("id", buildId);

    throw error;
  }
}
