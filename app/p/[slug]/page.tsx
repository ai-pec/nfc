import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { PortfolioModeFrame } from "@/components/portfolio-mode-frame";
import { extractBlueprint } from "@/lib/portfolio-render";
import { supabaseAdmin } from "@/lib/supabase";

type PortfolioPageProps = {
  params: Promise<{
    slug: string;
  }>;
};

function buildInitials(name: string) {
  return name
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");
}

function normalizeUrl(value: string) {
  const trimmed = value.trim();

  if (!trimmed || /\s/.test(trimmed)) {
    return null;
  }

  const candidate =
    trimmed.startsWith("http://") || trimmed.startsWith("https://") || trimmed.startsWith("mailto:") || trimmed.startsWith("tel:")
      ? trimmed
      : `https://${trimmed}`;

  try {
    const parsed = new URL(candidate);

    if (parsed.protocol === "http:" || parsed.protocol === "https:") {
      return parsed.hostname ? parsed.toString() : null;
    }

    if (parsed.protocol === "mailto:") {
      return parsed.pathname.includes("@") ? candidate : null;
    }

    if (parsed.protocol === "tel:") {
      return parsed.pathname.replace(/[+\d().\-\s]/g, "").length === 0 ? candidate : null;
    }

    return null;
  } catch {
    return null;
  }
}

function renderSection(section: { id: string; type: string; title: string; eyebrow?: string; items: string[]; variant: string }) {
  if (section.type === "services" || section.type === "trust" || section.type === "gallery") {
    return (
      <article key={section.id} className="portfolio-card rounded-[1.75rem] px-5 py-5 md:px-6 md:py-6">
        <p className="text-xs font-semibold tracking-[0.18em] uppercase portfolio-muted">{section.eyebrow || section.variant}</p>
        <h3 className="mt-3 text-2xl font-semibold tracking-tight">{section.title}</h3>
        <div className="mt-5 flex flex-wrap gap-3">
          {section.items.map((item) => (
            <span key={item} className="portfolio-chip rounded-full px-4 py-2 text-sm font-medium">
              {item}
            </span>
          ))}
        </div>
      </article>
    );
  }

  if (section.type === "contact" || section.type === "cta") {
    return (
      <article key={section.id} className="portfolio-card rounded-[1.75rem] px-5 py-5 md:px-6 md:py-6">
        <p className="text-xs font-semibold tracking-[0.18em] uppercase portfolio-muted">{section.eyebrow || section.variant}</p>
        <h3 className="mt-3 text-2xl font-semibold tracking-tight">{section.title}</h3>
        <div className="mt-5 grid gap-3">
          {section.items.map((item) => (
            <div key={item} className="portfolio-card-strong rounded-[1.1rem] px-4 py-4 text-sm portfolio-muted">
              {item}
            </div>
          ))}
        </div>
      </article>
    );
  }

  return (
    <article key={section.id} className="portfolio-card rounded-[1.75rem] px-5 py-5 md:px-6 md:py-6">
      <p className="text-xs font-semibold tracking-[0.18em] uppercase portfolio-muted">{section.eyebrow || section.variant}</p>
      <h3 className="mt-3 text-2xl font-semibold tracking-tight">{section.title}</h3>
      <div className="mt-5 space-y-4">
        {section.items.map((item, index) => (
          <div key={`${section.id}-${index + 1}`} className="flex gap-4">
            <div className="mt-2 h-2.5 w-2.5 shrink-0 rounded-full bg-[var(--portfolio-accent)]" />
            <p className="text-sm leading-7 portfolio-muted">{item}</p>
          </div>
        ))}
      </div>
    </article>
  );
}

export default async function PortfolioPage({ params }: PortfolioPageProps) {
  const { slug } = await params;

  const { data: portfolio, error } = await supabaseAdmin
    .from("portfolios")
    .select(
      "uid, slug, name, email, phone, whatsapp, instagram, linkedin, company, designation, headline, about, website, payment_qr_url, upi_id, photo_url, gallery, address, meeting_link, theme, published, site_paused, canvas",
    )
    .eq("slug", slug)
    .eq("published", true)
    .single();

  if (error || !portfolio) {
    notFound();
  }

  if (portfolio.site_paused) {
    return (
      <main className="section-shell page-hero flex-1">
        <section className="glass-panel mx-auto max-w-3xl rounded-[2rem] p-6 md:p-8">
          <span className="eyebrow inline-flex rounded-full px-3 py-1 text-xs font-semibold tracking-[0.18em] uppercase">
            Temporarily unavailable
          </span>
          <h1 className="mt-5 text-4xl font-semibold tracking-tight md:text-5xl">This portfolio is currently paused</h1>
          <p className="mt-4 text-base leading-7 text-[var(--muted)]">
            The profile owner has temporarily hidden this hosted portfolio. Please try again later.
          </p>
        </section>
      </main>
    );
  }

  const blueprint = extractBlueprint(portfolio);
  const meetingHrefSource = portfolio.meeting_link ?? portfolio.website;
  const actionUrlMap = {
    whatsapp: portfolio.whatsapp ? `https://wa.me/${portfolio.whatsapp.replace(/\D/g, "")}` : null,
    call: portfolio.phone ? `tel:${portfolio.phone}` : null,
    email: portfolio.email ? `mailto:${portfolio.email}` : null,
    website: portfolio.website ? normalizeUrl(portfolio.website) : null,
    meeting: meetingHrefSource ? normalizeUrl(meetingHrefSource) : null,
  } satisfies Record<string, string | null | undefined>;

  const orderedSections = blueprint.section_order
    .map((sectionId) => blueprint.sections.find((section) => section.id === sectionId))
    .filter((section): section is (typeof blueprint.sections)[number] => Boolean(section));

  const contactActions = [
    {
      label: blueprint.cta_bar.primary.label,
      href: actionUrlMap[blueprint.cta_bar.primary.action],
      tone: "primary" as const,
    },
    blueprint.cta_bar.secondary
      ? {
          label: blueprint.cta_bar.secondary.label,
          href: actionUrlMap[blueprint.cta_bar.secondary.action],
          tone: "secondary" as const,
        }
      : null,
    portfolio.phone ? { label: "Call", href: `tel:${portfolio.phone}`, tone: "secondary" as const } : null,
    portfolio.email ? { label: "Email", href: `mailto:${portfolio.email}`, tone: "secondary" as const } : null,
  ].filter((item): item is { label: string; href: string; tone: "primary" | "secondary" } => Boolean(item?.href));

  const highlights = [portfolio.designation, portfolio.company, ...blueprint.trust_elements].filter(Boolean).slice(0, 5);
  const gallery = (portfolio.gallery ?? []).filter(Boolean).slice(0, 3);
  const defaultMode = blueprint.theme === "obsidian" ? "dark" : "light";

  return (
    <main className="section-shell page-hero flex-1 pb-12">
      <PortfolioModeFrame defaultMode={defaultMode}>
        <section className="portfolio-panel relative overflow-hidden rounded-[2.4rem] p-5 md:p-8">
          <div className="portfolio-grid-pattern pointer-events-none absolute inset-0 opacity-20" />

          <div className="relative grid gap-6 lg:grid-cols-[1.08fr_0.92fr]">
            <div className="space-y-6">
              <div className="flex flex-wrap items-center gap-3">
                <span className="portfolio-chip inline-flex rounded-full px-3 py-1 text-xs font-semibold tracking-[0.18em] uppercase">
                  NFC portfolio
                </span>
                <span className="portfolio-muted text-sm">{blueprint.hero.kicker}</span>
              </div>

              <div>
                <h1 className="max-w-4xl text-5xl font-semibold leading-[0.95] tracking-tight md:text-7xl">
                  {blueprint.hero.headline}
                </h1>
                <p className="mt-5 max-w-2xl text-base leading-8 portfolio-muted md:text-lg">{blueprint.hero.subheadline}</p>
              </div>

              <div className="flex flex-wrap gap-3">
                {contactActions.map((action) => (
                  <a
                    key={`${action.label}-${action.href}`}
                    href={action.href}
                    target={action.href.startsWith("http") ? "_blank" : undefined}
                    rel={action.href.startsWith("http") ? "noreferrer" : undefined}
                    className={`rounded-full px-5 py-3 text-sm font-semibold transition-transform hover:-translate-y-0.5 ${
                      action.tone === "primary" ? "portfolio-button-primary" : "portfolio-button-secondary"
                    }`}
                  >
                    {action.label}
                  </a>
                ))}
              </div>

              <div className="portfolio-card rounded-[1.8rem] p-6 md:p-7">
                <p className="text-xs font-semibold tracking-[0.18em] uppercase portfolio-muted">Profile snapshot</p>
                <p className="mt-4 max-w-3xl text-base leading-8 portfolio-muted">{blueprint.summary}</p>
                <div className="mt-6 flex flex-wrap gap-3">
                  {highlights.map((item) => (
                    <span key={item} className="portfolio-chip rounded-full px-4 py-2 text-sm font-medium">
                      {item}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            <div className="space-y-5">
              <article className="portfolio-card-strong rounded-[2rem] p-6 md:p-7">
                <div className="flex items-start gap-4">
                  {portfolio.photo_url ? (
                    <Image
                      src={portfolio.photo_url}
                      alt={portfolio.name}
                      width={80}
                      height={80}
                      className="h-20 w-20 rounded-[1.4rem] object-cover"
                      unoptimized
                    />
                  ) : (
                    <div className="flex h-20 w-20 items-center justify-center rounded-[1.4rem] bg-[var(--portfolio-accent)] text-2xl font-semibold text-white">
                      {buildInitials(portfolio.name)}
                    </div>
                  )}
                  <div className="min-w-0">
                    <p className="text-2xl font-semibold tracking-tight">{portfolio.name}</p>
                    <p className="mt-2 text-sm portfolio-muted">{portfolio.designation ?? "Hosted professional profile"}</p>
                    <p className="mt-1 text-sm portfolio-muted">{portfolio.company ?? "Independent"}</p>
                  </div>
                </div>

                <div className="mt-6 rounded-[1.35rem] border border-[var(--portfolio-line)] px-4 py-4">
                  <p className="text-xs font-semibold tracking-[0.16em] uppercase portfolio-muted">Proof line</p>
                  <p className="mt-3 text-sm leading-7 portfolio-muted">{blueprint.hero.proofLine}</p>
                </div>

                <div className="mt-6 grid gap-3">
                  {portfolio.phone ? <div className="portfolio-card rounded-[1.1rem] px-4 py-3 text-sm portfolio-muted">{portfolio.phone}</div> : null}
                  {portfolio.email ? <div className="portfolio-card rounded-[1.1rem] px-4 py-3 text-sm portfolio-muted">{portfolio.email}</div> : null}
                  {portfolio.website ? <div className="portfolio-card rounded-[1.1rem] px-4 py-3 text-sm portfolio-muted">{portfolio.website}</div> : null}
                  {portfolio.address ? <div className="portfolio-card rounded-[1.1rem] px-4 py-3 text-sm portfolio-muted">{portfolio.address}</div> : null}
                </div>
              </article>

              {gallery.length > 0 ? (
                <article className="portfolio-card rounded-[2rem] p-4">
                  <p className="px-2 text-xs font-semibold tracking-[0.18em] uppercase portfolio-muted">Selected visuals</p>
                  <div className="mt-4 grid gap-3 sm:grid-cols-3">
                    {gallery.map((imageUrl: string, index: number) => (
                      <div key={`${imageUrl}-${index + 1}`} className="overflow-hidden rounded-[1.25rem]">
                        <Image
                          src={imageUrl}
                          alt={`${portfolio.name} visual ${index + 1}`}
                          width={480}
                          height={288}
                          className="h-36 w-full object-cover"
                          unoptimized
                        />
                      </div>
                    ))}
                  </div>
                </article>
              ) : null}
            </div>
          </div>

          <div className="relative mt-8 grid gap-4 lg:grid-cols-[1.1fr_0.9fr]">
            <div className="space-y-4">
              {orderedSections.map((section) => renderSection(section))}
            </div>

            <aside className="space-y-4">
              <article className="portfolio-card rounded-[1.8rem] p-6">
                <p className="text-xs font-semibold tracking-[0.18em] uppercase portfolio-muted">Direct actions</p>
                <div className="mt-5 grid gap-3">
                  {contactActions.map((action) => (
                    <a
                      key={`rail-${action.label}-${action.href}`}
                      href={action.href}
                      target={action.href.startsWith("http") ? "_blank" : undefined}
                      rel={action.href.startsWith("http") ? "noreferrer" : undefined}
                      className={`rounded-[1.1rem] px-4 py-4 text-sm font-semibold transition-colors ${
                        action.tone === "primary" ? "portfolio-button-primary" : "portfolio-button-secondary"
                      }`}
                    >
                      {action.label}
                    </a>
                  ))}
                </div>
              </article>

              <article className="portfolio-card rounded-[1.8rem] p-6">
                <p className="text-xs font-semibold tracking-[0.18em] uppercase portfolio-muted">Why this page works</p>
                <div className="mt-5 space-y-3">
                  {blueprint.trust_elements.map((item) => (
                    <div key={item} className="portfolio-card-strong rounded-[1rem] px-4 py-4 text-sm portfolio-muted">
                      {item}
                    </div>
                  ))}
                </div>
              </article>
            </aside>
          </div>

          <footer className="relative mt-8 flex flex-col gap-4 rounded-[1.8rem] border border-[var(--portfolio-line)] px-5 py-5 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="text-lg font-semibold">{portfolio.name}</p>
              <p className="mt-1 text-sm portfolio-muted">Tapfolio hosted NFC identity page</p>
            </div>
            <div className="flex flex-wrap gap-3">
              {portfolio.linkedin && normalizeUrl(portfolio.linkedin) ? (
                <a href={normalizeUrl(portfolio.linkedin) ?? undefined} target="_blank" rel="noreferrer" className="portfolio-button-secondary rounded-full px-4 py-2 text-sm font-semibold">
                  LinkedIn
                </a>
              ) : null}
              {portfolio.instagram && normalizeUrl(portfolio.instagram) ? (
                <a href={normalizeUrl(portfolio.instagram) ?? undefined} target="_blank" rel="noreferrer" className="portfolio-button-secondary rounded-full px-4 py-2 text-sm font-semibold">
                  Instagram
                </a>
              ) : null}
              <Link href="/" className="portfolio-button-secondary rounded-full px-4 py-2 text-sm font-semibold">
                Create your own card
              </Link>
            </div>
          </footer>
        </section>
      </PortfolioModeFrame>
    </main>
  );
}
