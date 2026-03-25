import "server-only";
import { z } from "zod";
import { supabaseAdmin } from "@/lib/supabase";

export const PORTFOLIO_INVARIANTS = [
  "Every portfolio must remain mobile-first, fast-loading, and easy to scan within 10 seconds.",
  "Every portfolio must preserve clear contact actions such as save contact, call, WhatsApp, email, or website when the data exists.",
  "Every portfolio must keep a professional trust layer: hero section, concise about section, social/contact area, and a footer with profile identity.",
  "The AI must not generate custom scripts, raw HTML, or claims that are not present in the user data.",
  "The design can change, but the information hierarchy must remain simple, polished, and conversion-focused.",
  "The AI must preserve a premium but believable tone and avoid buzzword-heavy or exaggerated marketing copy.",
  "The AI must always include accessibility-safe contrast, short section labels, and CTAs that match the available contact data.",
  "The AI must treat missing fields gracefully instead of inventing experience, education, achievements, or metrics.",
];

export const PORTFOLIO_SYSTEM_CONTRACT = [
  "Keep the hero, about, highlights, and contact structure consistent across all generated sites.",
  "Prefer strong typography, clean spacing, and polished hierarchy over flashy effects.",
  "If WhatsApp exists, include it as a high-priority CTA. If phone exists, include call. If email exists, include email.",
  "Never remove the owner identity from the footer.",
  "Never output executable code, inline script, or arbitrary HTML fragments.",
];

export const portfolioBlueprintSchema = z.object({
  theme: z.enum(["light", "dark", "warm", "minimal"]).default("light"),
  hero: z.object({
    headline: z.string().min(8).max(120),
    subheadline: z.string().min(12).max(220),
    primaryCtaLabel: z.string().min(2).max(30),
    secondaryCtaLabel: z.string().min(2).max(30),
  }),
  summary: z.string().min(20).max(280),
  sections: z.array(
    z.object({
      type: z.enum(["about", "services", "experience", "education", "gallery", "contact"]),
      title: z.string().min(2).max(50),
      items: z.array(z.string().min(2).max(180)).min(1).max(6),
    }),
  ),
  invariants: z.array(z.string()).min(3),
  source: z.string(),
});

type PortfolioRow = {
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
  website: string | null;
  theme: string | null;
  slug: string;
};

function buildFallbackBlueprint(portfolio: PortfolioRow, stylePrompt: string) {
  return portfolioBlueprintSchema.parse({
    theme: portfolio.theme === "dark" ? "dark" : stylePrompt.toLowerCase().includes("minimal") ? "minimal" : "warm",
    hero: {
      headline:
        portfolio.headline ||
        `${portfolio.name} ${portfolio.designation ? `| ${portfolio.designation}` : "| Digital profile"}`,
      subheadline:
        portfolio.about ||
        `A polished NFC portfolio for ${portfolio.name}${portfolio.company ? ` at ${portfolio.company}` : ""}.`,
      primaryCtaLabel: portfolio.phone ? "Call now" : "Get in touch",
      secondaryCtaLabel: portfolio.website ? "Visit website" : "View profile",
    },
    summary: `This portfolio highlights ${portfolio.name}'s work with a clean, premium, scan-friendly structure tuned for mobile visitors.`,
    sections: [
      {
        type: "about",
        title: "About",
        items: [portfolio.about || `${portfolio.name} uses NFC to share a more polished professional identity.`],
      },
      {
        type: "services",
        title: "Highlights",
        items:
          portfolio.services && portfolio.services.length > 0
            ? portfolio.services.slice(0, 4)
            : [
                portfolio.company || "Professional profile",
                portfolio.designation || "Strong first impression",
                "Tap-to-open contact flow",
              ],
      },
      {
        type: "contact",
        title: "Contact",
        items: [portfolio.email, portfolio.phone, portfolio.whatsapp, portfolio.website].filter(Boolean),
      },
    ],
    invariants: PORTFOLIO_INVARIANTS,
    source: "template-fallback",
  });
}

function buildPrompt(portfolio: PortfolioRow, stylePrompt: string) {
  return [
    "You are designing a professional NFC-powered portfolio blueprint.",
    "You must return JSON only.",
    `Style direction from user: ${stylePrompt}`,
    `Person name: ${portfolio.name}`,
    `Designation: ${portfolio.designation ?? "Not specified"}`,
    `Company: ${portfolio.company ?? "Not specified"}`,
    `About: ${portfolio.about ?? "Not specified"}`,
    `Services: ${(portfolio.services ?? []).join(", ") || "Not specified"}`,
    `Experience: ${(portfolio.experience ?? []).join(", ") || "Not specified"}`,
    `Education: ${(portfolio.education ?? []).join(", ") || "Not specified"}`,
    "Non-negotiable site rules:",
    ...PORTFOLIO_INVARIANTS.map((item, index) => `${index + 1}. ${item}`),
    "Global portfolio system contract:",
    ...PORTFOLIO_SYSTEM_CONTRACT.map((item, index) => `${index + 1}. ${item}`),
    "Output constraints:",
    "1. Keep section count focused and useful, not bloated.",
    "2. Use only the supported section types from the schema.",
    "3. Adapt style, but keep the structure trustworthy and conversion-ready.",
  ].join("\n");
}

async function generateWithDeepSeek(portfolio: PortfolioRow, stylePrompt: string) {
  const apiKey = process.env.DEEPSEEK_API_KEY;

  if (!apiKey) {
    return buildFallbackBlueprint(portfolio, stylePrompt);
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
          content:
            "Generate a strict JSON portfolio blueprint for a premium NFC profile site. Never output prose outside JSON.",
        },
        {
          role: "user",
          content: buildPrompt(portfolio, stylePrompt),
        },
      ],
    }),
  });

  if (!response.ok) {
    return buildFallbackBlueprint(portfolio, stylePrompt);
  }

  const data = await response.json();
  const content = data.choices?.[0]?.message?.content;

  if (!content) {
    return buildFallbackBlueprint(portfolio, stylePrompt);
  }

  return portfolioBlueprintSchema.parse({
    ...JSON.parse(content),
    source: "deepseek",
  });
}

export async function generatePortfolioBlueprint(portfolio: PortfolioRow, stylePrompt: string) {
  const blueprint = await generateWithDeepSeek(portfolio, stylePrompt);

  const updateResult = await supabaseAdmin
    .from("portfolios")
    .update({
      theme: blueprint.theme,
      headline: blueprint.hero.headline,
      about: blueprint.summary,
      canvas: {
        generatedAt: new Date().toISOString(),
        stylePrompt,
        invariants: PORTFOLIO_INVARIANTS,
        contract: PORTFOLIO_SYSTEM_CONTRACT,
        blueprint,
      },
    })
    .eq("uid", portfolio.uid);

  if (updateResult.error) {
    throw updateResult.error;
  }

  return blueprint;
}
