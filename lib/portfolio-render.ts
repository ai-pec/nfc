import "server-only";
import { portfolioBlueprintSchema, PORTFOLIO_INVARIANTS } from "@/lib/portfolio-ai";

export type PortfolioRecord = {
  uid: string;
  slug: string;
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
  website: string | null;
  photo_url?: string | null;
  gallery?: string[] | null;
  payment_qr_url?: string | null;
  upi_id?: string | null;
  theme: string | null;
  published: boolean | null;
  site_paused?: boolean | null;
  canvas: unknown;
};

export function extractBlueprint(portfolio: PortfolioRecord) {
  const canvas = portfolio.canvas;

  if (canvas && typeof canvas === "object" && "blueprint" in canvas) {
    const blueprint = (canvas as { blueprint?: unknown }).blueprint;
    const parsed = portfolioBlueprintSchema.safeParse(blueprint);

    if (parsed.success) {
      return parsed.data;
    }
  }

  return portfolioBlueprintSchema.parse({
    schema_version: "portfolio_schema_v2",
    source: "render-fallback",
    theme: portfolio.theme === "dark" ? "obsidian" : "linen",
    layout_template: "editorial_split",
    hero_variant: "identity_spotlight",
    visual_direction: {
      color_mood: "clean editorial",
      typography_style: "serif accent with modern sans",
      spacing_density: "balanced",
      surface_style: "glass",
      accent_strategy: "editorial-highlight",
      animation_profile: "subtle",
    },
    hero: {
      headline:
        portfolio.headline ||
        `${portfolio.name}${portfolio.designation ? ` | ${portfolio.designation}` : " | Digital profile"}`,
      subheadline:
        portfolio.about ||
        `A polished NFC portfolio for ${portfolio.name}${portfolio.company ? ` at ${portfolio.company}` : ""}.`,
      kicker: portfolio.company || "NFC profile",
      proofLine: [portfolio.designation, portfolio.company].filter(Boolean).join(" | ") || "Hosted identity page",
    },
    summary:
      portfolio.about ||
      `${portfolio.name} shares a concise, premium professional profile designed for quick taps and stronger first impressions.`,
    section_order: ["about", "contact", "trust"],
    sections: [
      {
        id: "about",
        type: "about",
        variant: "editorial-story",
        title: "About",
        eyebrow: "Profile",
        items: [portfolio.about || `${portfolio.name} uses an NFC profile to share work and contact details quickly.`],
      },
      {
        id: "contact",
        type: "contact",
        variant: "action-panel",
        title: "Contact",
        eyebrow: "Direct reach",
        items: [portfolio.email, portfolio.phone, portfolio.whatsapp, portfolio.website].filter(Boolean),
      },
      {
        id: "trust",
        type: "trust",
        variant: "credibility-stack",
        title: "Trust signals",
        eyebrow: "Why connect",
        items: [portfolio.company, portfolio.designation, "Mobile-first hosted profile"].filter(Boolean),
      },
    ],
    cta_bar: {
      primary: {
        action: portfolio.whatsapp ? "whatsapp" : portfolio.phone ? "call" : "email",
        label: portfolio.whatsapp ? "WhatsApp" : portfolio.phone ? "Call now" : "Email",
      },
      secondary: portfolio.website
        ? {
            action: "website",
            label: "Visit website",
          }
        : undefined,
    },
    media_slots: [
      { kind: "avatar", usage: "Primary identity image", required: false },
      { kind: "gallery", usage: "Support visuals", required: false },
    ],
    trust_elements: [portfolio.company, portfolio.designation, "Mobile-first hosted profile"].filter(Boolean),
    footer_style: "identity_minimal",
    invariants: PORTFOLIO_INVARIANTS,
  });
}
