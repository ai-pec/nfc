import "server-only";
import { z } from "zod";
import { supabaseAdmin } from "@/lib/supabase";
import {
  portfolioBlueprintSchemaV2,
  portfolioIntakeSchema,
  portfolioValidationSchema,
  type PortfolioBlueprintV2,
  type PortfolioIntake,
  type PortfolioValidation,
} from "@/lib/portfolio-schema-v2";

export const PORTFOLIO_INVARIANTS = [
  "Every portfolio must remain mobile-first, fast-loading, and easy to scan within 10 seconds.",
  "Every portfolio must preserve clear contact actions such as save contact, call, WhatsApp, email, or website when the data exists.",
  "Every portfolio must keep a professional trust layer with clear identity, concise proof, and a footer with profile ownership.",
  "The AI must not generate executable code, custom scripts, raw HTML, or claims that are not present in the user data.",
  "The design can change, but the information hierarchy must remain simple, polished, and conversion-focused.",
  "The AI must preserve a premium but believable tone and avoid buzzword-heavy or exaggerated marketing copy.",
  "The AI must always include accessibility-safe contrast, short section labels, and CTAs that match the available contact data.",
  "The AI must treat missing fields gracefully instead of inventing experience, education, achievements, or metrics.",
];

export const PORTFOLIO_SYSTEM_CONTRACT = [
  "Use only approved sections, style tokens, and variants from the schema.",
  "Prefer strong typography, clean spacing, and polished hierarchy over flashy effects.",
  "If WhatsApp exists, include it as a high-priority CTA. If phone exists, include call. If email exists, include email.",
  "Never remove the owner identity from the footer.",
  "Publish only if the validator says the blueprint is structurally safe and credible.",
];

export const portfolioBlueprintSchema = portfolioBlueprintSchemaV2;

export type PortfolioRow = {
  uid: string;
  name: string;
  email: string | null;
  phone: string | null;
  whatsapp: string | null;
  instagram: string | null;
  linkedin: string | null;
  company: string | null;
  designation: string | null;
  headline: string | null;
  about: string | null;
  services: string[] | null;
  experience: string[] | null;
  education: string[] | null;
  gallery?: string[] | null;
  website: string | null;
  theme: string | null;
  slug: string;
  address?: string | null;
  meeting_link?: string | null;
};

export type PortfolioBuildArtifacts = {
  intake: PortfolioIntake;
  blueprint: PortfolioBlueprintV2;
  validation: PortfolioValidation;
};

const deepSeekRefinementSchema = z.object({
  should_refine: z.boolean(),
  reason: z.string().max(240).optional(),
  blueprint: portfolioBlueprintSchemaV2.optional(),
});

type GeminiStage = "intake" | "layout" | "validator";

function getGeminiModel(stage: GeminiStage) {
  if (stage === "intake") {
    return process.env.GEMINI_INTAKE_MODEL ?? process.env.GEMINI_FLASH_MODEL ?? "gemini-2.5-flash";
  }

  if (stage === "layout") {
    return process.env.GEMINI_LAYOUT_MODEL ?? process.env.GEMINI_PRO_MODEL ?? "gemini-2.5-pro";
  }

  return process.env.GEMINI_VALIDATOR_MODEL ?? process.env.GEMINI_PRO_MODEL ?? "gemini-2.5-pro";
}

function buildContactPriority(portfolio: PortfolioRow) {
  return [
    portfolio.whatsapp ? "whatsapp" : null,
    portfolio.phone ? "call" : null,
    portfolio.email ? "email" : null,
    portfolio.website ? "website" : null,
    portfolio.meeting_link ? "meeting" : null,
  ].filter(Boolean) as Array<"whatsapp" | "call" | "email" | "website" | "meeting">;
}

function buildFallbackIntake(portfolio: PortfolioRow, intakePayload?: Record<string, unknown>) {
  return portfolioIntakeSchema.parse({
    personName: portfolio.name,
    normalizedBio:
      portfolio.about ||
      `${portfolio.name}${portfolio.designation ? ` is a ${portfolio.designation}` : ""}${portfolio.company ? ` at ${portfolio.company}` : ""} using NFC to share a more polished professional identity.`,
    audience:
      typeof intakePayload?.targetAudience === "string" && intakePayload.targetAudience.trim().length > 0
        ? [intakePayload.targetAudience.trim()]
        : ["clients", "partners"],
    skills:
      portfolio.services && portfolio.services.length > 0
        ? portfolio.services.slice(0, 5)
        : [portfolio.designation || "Professional profile", "Relationship building", "Tap-to-share identity"],
    services:
      portfolio.services && portfolio.services.length > 0
        ? portfolio.services.slice(0, 6)
        : ["Hosted NFC portfolio", "Quick contact flow", "Professional first impression"],
    experienceBullets:
      portfolio.experience && portfolio.experience.length > 0
        ? portfolio.experience.slice(0, 5)
        : [portfolio.company || "Independent professional", "Share work, identity, and contact details in one tap"],
    educationBullets: portfolio.education?.slice(0, 4) ?? [],
    credibilityPoints: [
      portfolio.company || "Professional identity",
      portfolio.designation || "Clear personal positioning",
      portfolio.website ? "Website available" : "Direct contact path available",
    ],
    ctaPriorities: buildContactPriority(portfolio).slice(0, 5),
    missingDataFlags: [
      !portfolio.about ? "about_missing" : null,
      !portfolio.website ? "website_missing" : null,
      !portfolio.gallery || portfolio.gallery.length === 0 ? "gallery_missing" : null,
    ].filter(Boolean),
    source: "fallback-intake",
  });
}

function buildFallbackBlueprint(
  portfolio: PortfolioRow,
  stylePrompt: string,
  intake: PortfolioIntake,
): PortfolioBlueprintV2 {
  const primaryAction = intake.ctaPriorities[0] ?? "email";
  const secondaryAction = intake.ctaPriorities[1];
  const theme =
    portfolio.theme === "dark"
      ? "obsidian"
      : stylePrompt.toLowerCase().includes("minimal")
        ? "stone"
        : stylePrompt.toLowerCase().includes("warm")
          ? "terracotta"
          : "linen";

  return portfolioBlueprintSchemaV2.parse({
    schema_version: "portfolio_schema_v2",
    source: "fallback-layout",
    theme,
    layout_template: "editorial_split",
    hero_variant: "identity_spotlight",
    visual_direction: {
      color_mood: theme === "terracotta" ? "warm premium" : "clean editorial",
      typography_style: "modern serif with quiet sans pairing",
      spacing_density: "balanced",
      surface_style: "glass",
      accent_strategy: "editorial-highlight",
      animation_profile: "subtle",
    },
    hero: {
      headline:
        portfolio.headline || `${portfolio.name}${portfolio.designation ? ` | ${portfolio.designation}` : " | Digital profile"}`,
      subheadline: intake.normalizedBio,
      kicker: portfolio.company || "NFC profile",
      proofLine: intake.credibilityPoints.slice(0, 2).join(" • "),
    },
    summary: `${portfolio.name} is presented through a premium hosted card experience built for fast scanning, cleaner contact flow, and stronger trust.`,
    section_order: ["about", "services", "experience", "contact"],
    sections: [
      {
        id: "about",
        type: "about",
        variant: "editorial-story",
        title: "About",
        eyebrow: "Profile",
        items: [intake.normalizedBio],
      },
      {
        id: "services",
        type: "services",
        variant: "pill-grid",
        title: "Core focus",
        eyebrow: "What they offer",
        items: intake.services,
      },
      {
        id: "experience",
        type: "experience",
        variant: "stacked-timeline",
        title: "Experience highlights",
        eyebrow: "Proof of work",
        items: intake.experienceBullets,
      },
      {
        id: "contact",
        type: "contact",
        variant: "action-panel",
        title: "Contact",
        eyebrow: "Direct reach",
        items: [portfolio.email, portfolio.phone, portfolio.whatsapp, portfolio.website, portfolio.meeting_link].filter(
          Boolean,
        ) as string[],
      },
    ],
    cta_bar: {
      primary: {
        action: primaryAction,
        label: primaryAction === "whatsapp" ? "WhatsApp now" : primaryAction === "call" ? "Call now" : "Get in touch",
      },
      secondary: secondaryAction
        ? {
            action: secondaryAction,
            label: secondaryAction === "website" ? "Visit website" : secondaryAction === "email" ? "Send email" : "Learn more",
          }
        : undefined,
    },
    media_slots: [
      { kind: "avatar", usage: "Primary identity image", required: false },
      { kind: "gallery", usage: "Selected work or brand visuals", required: false },
    ],
    trust_elements: intake.credibilityPoints,
    footer_style: "identity_minimal",
    invariants: PORTFOLIO_INVARIANTS,
  });
}

function buildFallbackValidation(blueprint: PortfolioBlueprintV2): PortfolioValidation {
  const issues: PortfolioValidation["issues"] = [];

  if (blueprint.sections.length > 7) {
    issues.push({
      code: "section_count",
      severity: "medium",
      message: "Too many sections reduce scan speed on mobile.",
    });
  }

  if (!blueprint.section_order.includes("contact")) {
    issues.push({
      code: "missing_contact_section",
      severity: "high",
      message: "A contact section is required for conversion.",
    });
  }

  return portfolioValidationSchema.parse({
    valid: issues.length === 0,
    score: issues.length === 0 ? 90 : 72,
    issues,
    suggestions:
      issues.length === 0
        ? ["Ready for preview and publish after payment gating is added."]
        : ["Reduce section count and preserve a clear contact path."],
    publishReady: issues.length === 0,
    source: "fallback-validator",
  });
}

function buildIntakePrompt(portfolio: PortfolioRow, stylePrompt: string, intakePayload?: Record<string, unknown>) {
  return [
    "Normalize this user's portfolio intake into strict JSON facts.",
    "Return JSON only.",
    `Name: ${portfolio.name}`,
    `Headline: ${portfolio.headline ?? "Not specified"}`,
    `Designation: ${portfolio.designation ?? "Not specified"}`,
    `Company: ${portfolio.company ?? "Not specified"}`,
    `About: ${portfolio.about ?? "Not specified"}`,
    `Services: ${(portfolio.services ?? []).join(", ") || "Not specified"}`,
    `Experience: ${(portfolio.experience ?? []).join(", ") || "Not specified"}`,
    `Education: ${(portfolio.education ?? []).join(", ") || "Not specified"}`,
    `Target audience: ${typeof intakePayload?.targetAudience === "string" ? intakePayload.targetAudience : "Not specified"}`,
    `Goals: ${typeof intakePayload?.goals === "string" ? intakePayload.goals : "Not specified"}`,
    `Style request: ${stylePrompt}`,
    "Keep facts grounded in the provided content only.",
  ].join("\n");
}

function buildLayoutPrompt(
  portfolio: PortfolioRow,
  stylePrompt: string,
  intake: PortfolioIntake,
  intakePayload?: Record<string, unknown>,
) {
  return [
    "Create a premium portfolio website blueprint in strict JSON.",
    "Return JSON only.",
    `Style request: ${stylePrompt}`,
    `Portfolio owner: ${portfolio.name}`,
    `Intake facts: ${JSON.stringify(intake)}`,
    `Extra onboarding context: ${JSON.stringify(intakePayload ?? {})}`,
    "Honor these non-negotiable rules:",
    ...PORTFOLIO_INVARIANTS.map((item, index) => `${index + 1}. ${item}`),
    "Output should be expressive but realistic, conversion-focused, and easy to render from a structured component system.",
  ].join("\n");
}

function buildValidatorPrompt(portfolio: PortfolioRow, blueprint: PortfolioBlueprintV2, intake: PortfolioIntake) {
  return [
    "Validate this portfolio blueprint for safety, credibility, structure, and conversion readiness.",
    "Return JSON only.",
    `Portfolio owner: ${portfolio.name}`,
    `Intake facts: ${JSON.stringify(intake)}`,
    `Blueprint: ${JSON.stringify(blueprint)}`,
    "Reject fake claims, weak CTA coverage, broken structure, excessive section count, and brand-inconsistent layouts.",
  ].join("\n");
}

function buildRefinementPrompt(
  portfolio: PortfolioRow,
  intake: PortfolioIntake,
  blueprint: PortfolioBlueprintV2,
) {
  return [
    "Review this already-generated portfolio blueprint and improve it only if a final UI pass would materially improve quality.",
    "Return strict JSON only.",
    "If the blueprint is already strong, return should_refine=false.",
    "If refining, preserve the same facts and schema while improving hierarchy, elegance, CTA clarity, scan speed, and overall premium feel.",
    "Do not invent facts, metrics, or achievements.",
    `Portfolio owner: ${portfolio.name}`,
    `Intake facts: ${JSON.stringify(intake)}`,
    `Current blueprint: ${JSON.stringify(blueprint)}`,
    'Response format: {"should_refine": true|false, "reason": "short note", "blueprint": { ...portfolio_schema_v2 if changed... }}',
  ].join("\n");
}

async function generateJsonWithGemini<T>({
  stage,
  prompt,
}: {
  stage: GeminiStage;
  prompt: string;
}): Promise<T | null> {
  const apiKeys = [process.env.GEMINI_API_KEY, process.env.GEMINI_API_KEY_SECONDARY].filter(Boolean) as string[];

  if (apiKeys.length === 0) {
    return null;
  }

  const model = getGeminiModel(stage);

  for (const apiKey of apiKeys) {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          contents: [
            {
              role: "user",
              parts: [{ text: prompt }],
            },
          ],
          generationConfig: {
            responseMimeType: "application/json",
            temperature: stage === "validator" ? 0.2 : 0.7,
          },
        }),
      },
    );

    if (!response.ok) {
      continue;
    }

    const data = await response.json();
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!text) {
      continue;
    }

    return JSON.parse(text) as T;
  }

  return null;
}

async function generateJsonWithDeepSeek<T>(prompt: string): Promise<T | null> {
  const apiKey = process.env.DEEPSEEK_API_KEY;

  if (!apiKey) {
    return null;
  }

  const response = await fetch("https://api.deepseek.com/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: process.env.DEEPSEEK_MODEL ?? "deepseek-chat",
      response_format: {
        type: "json_object",
      },
      messages: [
        {
          role: "system",
          content: "Return strict JSON only. Do not return markdown, commentary, or prose outside JSON.",
        },
        {
          role: "user",
          content: prompt,
        },
      ],
    }),
  });

  if (!response.ok) {
    return null;
  }

  const data = await response.json();
  const text = data.choices?.[0]?.message?.content;

  if (!text) {
    return null;
  }

  return JSON.parse(text) as T;
}

async function generateIntake(portfolio: PortfolioRow, stylePrompt: string, intakePayload?: Record<string, unknown>) {
  const geminiResult = await generateJsonWithGemini<PortfolioIntake>({
    stage: "intake",
    prompt: buildIntakePrompt(portfolio, stylePrompt, intakePayload),
  });

  if (geminiResult) {
    return portfolioIntakeSchema.parse({
      ...geminiResult,
      source: "gemini-intake",
    });
  }

  return buildFallbackIntake(portfolio, intakePayload);
}

async function generateLayout(
  portfolio: PortfolioRow,
  stylePrompt: string,
  intake: PortfolioIntake,
  intakePayload?: Record<string, unknown>,
) {
  const geminiResult = await generateJsonWithGemini<PortfolioBlueprintV2>({
    stage: "layout",
    prompt: buildLayoutPrompt(portfolio, stylePrompt, intake, intakePayload),
  });

  let blueprint: PortfolioBlueprintV2;

  if (geminiResult) {
    blueprint = portfolioBlueprintSchemaV2.parse({
      ...geminiResult,
      schema_version: "portfolio_schema_v2",
      source: "gemini-layout",
      invariants: Array.isArray(geminiResult.invariants) && geminiResult.invariants.length > 0
        ? geminiResult.invariants
        : PORTFOLIO_INVARIANTS,
    });
  } else {
    const deepSeekResult = await generateJsonWithDeepSeek<PortfolioBlueprintV2>(
      buildLayoutPrompt(portfolio, stylePrompt, intake, intakePayload),
    );

    if (deepSeekResult) {
      blueprint = portfolioBlueprintSchemaV2.parse({
        ...deepSeekResult,
        schema_version: "portfolio_schema_v2",
        source: "deepseek-layout",
        invariants: Array.isArray(deepSeekResult.invariants) && deepSeekResult.invariants.length > 0
          ? deepSeekResult.invariants
          : PORTFOLIO_INVARIANTS,
      });
    } else {
      blueprint = buildFallbackBlueprint(portfolio, stylePrompt, intake);
    }
  }

  const refinementResult = await generateJsonWithDeepSeek<z.infer<typeof deepSeekRefinementSchema>>(
    buildRefinementPrompt(portfolio, intake, blueprint),
  );
  const parsedRefinement = deepSeekRefinementSchema.safeParse(refinementResult);

  if (parsedRefinement.success && parsedRefinement.data.should_refine && parsedRefinement.data.blueprint) {
    return portfolioBlueprintSchemaV2.parse({
      ...parsedRefinement.data.blueprint,
      schema_version: "portfolio_schema_v2",
      source: "deepseek-refined",
      invariants:
        Array.isArray(parsedRefinement.data.blueprint.invariants) && parsedRefinement.data.blueprint.invariants.length > 0
          ? parsedRefinement.data.blueprint.invariants
          : PORTFOLIO_INVARIANTS,
    });
  }

  return blueprint;
}

async function validateBlueprint(
  portfolio: PortfolioRow,
  intake: PortfolioIntake,
  blueprint: PortfolioBlueprintV2,
) {
  const geminiResult = await generateJsonWithGemini<PortfolioValidation>({
    stage: "validator",
    prompt: buildValidatorPrompt(portfolio, blueprint, intake),
  });

  if (geminiResult) {
    return portfolioValidationSchema.parse({
      ...geminiResult,
      source: "gemini-validator",
    });
  }

  return buildFallbackValidation(blueprint);
}

function createCanvasPayload({
  stylePrompt,
  intakePayload,
  intake,
  blueprint,
  validation,
}: {
  stylePrompt: string;
  intakePayload?: Record<string, unknown>;
  intake: PortfolioIntake;
  blueprint: PortfolioBlueprintV2;
  validation: PortfolioValidation;
}) {
  return {
    generatedAt: new Date().toISOString(),
    schemaVersion: blueprint.schema_version,
    stylePrompt,
    intakePayload: intakePayload ?? null,
    invariants: PORTFOLIO_INVARIANTS,
    contract: PORTFOLIO_SYSTEM_CONTRACT,
    intake,
    blueprint,
    validation,
  };
}

export async function generatePortfolioPackage(
  portfolio: PortfolioRow,
  stylePrompt: string,
  intakePayload?: Record<string, unknown>,
): Promise<PortfolioBuildArtifacts> {
  const intake = await generateIntake(portfolio, stylePrompt, intakePayload);
  const blueprint = await generateLayout(portfolio, stylePrompt, intake, intakePayload);
  const validation = await validateBlueprint(portfolio, intake, blueprint);

  return { intake, blueprint, validation };
}

export async function generatePortfolioBlueprint(
  portfolio: PortfolioRow,
  stylePrompt: string,
  intakePayload?: Record<string, unknown>,
) {
  const artifacts = await generatePortfolioPackage(portfolio, stylePrompt, intakePayload);

  const updateResult = await supabaseAdmin
    .from("portfolios")
    .update({
      theme:
        artifacts.blueprint.theme === "obsidian"
          ? "dark"
          : artifacts.blueprint.theme === "stone"
            ? "minimal"
            : "light",
      headline: artifacts.blueprint.hero.headline,
      about: artifacts.blueprint.summary,
      canvas: createCanvasPayload({
        stylePrompt,
        intakePayload,
        intake: artifacts.intake,
        blueprint: artifacts.blueprint,
        validation: artifacts.validation,
      }),
    })
    .eq("uid", portfolio.uid);

  if (updateResult.error) {
    throw updateResult.error;
  }

  return artifacts.blueprint;
}
