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
    theme: portfolio.theme === "dark" ? "dark" : "light",
    hero: {
      headline:
        portfolio.headline ||
        `${portfolio.name}${portfolio.designation ? ` | ${portfolio.designation}` : " | Digital profile"}`,
      subheadline:
        portfolio.about ||
        `A polished NFC portfolio for ${portfolio.name}${portfolio.company ? ` at ${portfolio.company}` : ""}.`,
      primaryCtaLabel: portfolio.whatsapp ? "WhatsApp" : portfolio.phone ? "Call now" : "Contact",
      secondaryCtaLabel: portfolio.website ? "Visit website" : "Email",
    },
    summary:
      portfolio.about ||
      `${portfolio.name} shares a concise, premium professional profile designed for quick taps and stronger first impressions.`,
    sections: [
      {
        type: "about",
        title: "About",
        items: [portfolio.about || `${portfolio.name} uses an NFC profile to share work and contact details quickly.`],
      },
      {
        type: "contact",
        title: "Contact",
        items: [portfolio.email, portfolio.phone, portfolio.whatsapp, portfolio.website].filter(Boolean),
      },
    ],
    invariants: PORTFOLIO_INVARIANTS,
    source: "render-fallback",
  });
}
