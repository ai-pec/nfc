import { z } from "zod";

export const portfolioIntakeSchema = z.object({
  personName: z.string().min(2).max(80),
  normalizedBio: z.string().min(20).max(500),
  audience: z.array(z.string().min(2).max(80)).min(1).max(4),
  skills: z.array(z.string().min(2).max(80)).min(2).max(10),
  services: z.array(z.string().min(2).max(120)).min(1).max(6),
  experienceBullets: z.array(z.string().min(2).max(180)).min(1).max(6),
  educationBullets: z.array(z.string().min(2).max(180)).max(6).default([]),
  credibilityPoints: z.array(z.string().min(2).max(120)).min(2).max(5),
  ctaPriorities: z
    .array(z.enum(["whatsapp", "call", "email", "website", "meeting"]))
    .min(1)
    .max(5),
  missingDataFlags: z.array(z.string().min(2).max(120)).max(8).default([]),
  source: z.string(),
});

export const portfolioSectionSchema = z.object({
  id: z.string().min(2).max(40),
  type: z.enum(["about", "services", "experience", "education", "gallery", "contact", "trust", "cta"]),
  variant: z.string().min(2).max(40),
  title: z.string().min(2).max(60),
  eyebrow: z.string().max(40).optional().default(""),
  items: z.array(z.string().min(2).max(220)).min(1).max(8),
});

export const portfolioBlueprintSchemaV2 = z.object({
  schema_version: z.literal("portfolio_schema_v2"),
  source: z.string(),
  theme: z.enum(["linen", "obsidian", "terracotta", "stone", "forest"]).default("linen"),
  layout_template: z.enum(["editorial_split", "stacked_story", "studio_grid", "concierge_card"]),
  hero_variant: z.enum(["identity_spotlight", "split_trust", "cta_lead", "founder_note"]),
  visual_direction: z.object({
    color_mood: z.string().min(2).max(60),
    typography_style: z.string().min(2).max(60),
    spacing_density: z.enum(["compact", "balanced", "airy"]),
    surface_style: z.enum(["glass", "paper", "soft-shadow", "solid-premium"]),
    accent_strategy: z.enum(["warm-line", "dark-ink", "quiet-contrast", "editorial-highlight"]),
    animation_profile: z.enum(["none", "subtle", "staggered"]),
  }),
  hero: z.object({
    headline: z.string().min(8).max(120),
    subheadline: z.string().min(12).max(240),
    kicker: z.string().min(2).max(40),
    proofLine: z.string().min(2).max(120),
  }),
  summary: z.string().min(20).max(320),
  section_order: z.array(z.string().min(2).max(40)).min(3).max(8),
  sections: z.array(portfolioSectionSchema).min(3).max(8),
  cta_bar: z.object({
    primary: z.object({
      action: z.enum(["whatsapp", "call", "email", "website", "meeting"]),
      label: z.string().min(2).max(30),
    }),
    secondary: z
      .object({
        action: z.enum(["whatsapp", "call", "email", "website", "meeting"]),
        label: z.string().min(2).max(30),
      })
      .optional(),
  }),
  media_slots: z.array(
    z.object({
      kind: z.enum(["avatar", "gallery", "document-teaser"]),
      usage: z.string().min(2).max(80),
      required: z.boolean(),
    }),
  ).min(1).max(4),
  trust_elements: z.array(z.string().min(2).max(120)).min(2).max(5),
  footer_style: z.enum(["identity_minimal", "cta_footer", "signature_footer"]),
  invariants: z.array(z.string()).min(3),
});

export const portfolioValidationSchema = z.object({
  valid: z.boolean(),
  score: z.number().min(0).max(100),
  issues: z.array(
    z.object({
      code: z.string().min(2).max(40),
      severity: z.enum(["low", "medium", "high"]),
      message: z.string().min(4).max(240),
    }),
  ).max(12),
  suggestions: z.array(z.string().min(4).max(180)).max(8),
  publishReady: z.boolean(),
  source: z.string(),
});

export type PortfolioIntake = z.infer<typeof portfolioIntakeSchema>;
export type PortfolioBlueprintV2 = z.infer<typeof portfolioBlueprintSchemaV2>;
export type PortfolioValidation = z.infer<typeof portfolioValidationSchema>;
