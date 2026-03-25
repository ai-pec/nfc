import Link from "next/link";
import { notFound } from "next/navigation";
import { extractBlueprint } from "@/lib/portfolio-render";
import { supabaseAdmin } from "@/lib/supabase";

type PortfolioPageProps = {
  params: Promise<{
    slug: string;
  }>;
};

export default async function PortfolioPage({ params }: PortfolioPageProps) {
  const { slug } = await params;

  const { data: portfolio, error } = await supabaseAdmin
    .from("portfolios")
    .select(
      "uid, slug, name, email, phone, whatsapp, instagram, linkedin, company, designation, headline, about, website, payment_qr_url, upi_id, theme, published, site_paused, canvas",
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

  const contactActions = [
    portfolio.whatsapp ? { label: blueprint.hero.primaryCtaLabel, href: `https://wa.me/${portfolio.whatsapp.replace(/\D/g, "")}` } : null,
    portfolio.phone ? { label: "Call", href: `tel:${portfolio.phone}` } : null,
    portfolio.email ? { label: "Email", href: `mailto:${portfolio.email}` } : null,
    portfolio.website ? { label: blueprint.hero.secondaryCtaLabel, href: portfolio.website } : null,
  ].filter(Boolean) as Array<{ label: string; href: string }>;

  return (
    <main className="section-shell page-hero flex-1 pb-12">
      <section className="glass-panel rounded-[2rem] p-6 md:p-8">
        <div className="grid gap-8 lg:grid-cols-[1.08fr_0.92fr]">
          <div>
            <span className="eyebrow inline-flex rounded-full px-3 py-1 text-xs font-semibold tracking-[0.18em] uppercase">
              NFC profile
            </span>
            <h1 className="mt-6 text-5xl font-semibold leading-[0.98] tracking-tight md:text-6xl">
              {blueprint.hero.headline}
            </h1>
            <p className="mt-5 max-w-2xl text-lg leading-8 text-[var(--muted)]">{blueprint.hero.subheadline}</p>

            <div className="mt-7 flex flex-wrap gap-3">
              {contactActions.map((action) => (
                <a
                  key={`${action.label}-${action.href}`}
                  href={action.href}
                  target={action.href.startsWith("http") ? "_blank" : undefined}
                  rel={action.href.startsWith("http") ? "noreferrer" : undefined}
                  className="rounded-full bg-[var(--brand)] px-5 py-3 text-sm font-semibold text-white transition-colors hover:bg-[var(--brand-deep)]"
                >
                  {action.label}
                </a>
              ))}
            </div>

            <div className="mt-8 page-card px-5 py-5">
              <p className="text-sm font-semibold tracking-[0.14em] uppercase text-[var(--brand-deep)]">Summary</p>
              <p className="mt-3 text-sm leading-7 text-[var(--muted)]">{blueprint.summary}</p>
            </div>
          </div>

          <div className="page-card p-5 md:p-6">
            <p className="text-sm font-semibold tracking-[0.14em] uppercase text-[var(--brand-deep)]">Profile identity</p>
            <h2 className="mt-3 text-3xl font-semibold">{portfolio.name}</h2>
            <p className="mt-2 text-sm text-[var(--muted)]">{portfolio.designation ?? "Hosted digital profile"}</p>
            <p className="mt-2 text-sm text-[var(--muted)]">{portfolio.company ?? "Independent"}</p>
            <div className="mt-5 space-y-2 text-sm text-[var(--muted)]">
              {portfolio.email ? <p>{portfolio.email}</p> : null}
              {portfolio.phone ? <p>{portfolio.phone}</p> : null}
              {portfolio.website ? <p>{portfolio.website}</p> : null}
            </div>
          </div>
        </div>

        <div className="mt-8 grid gap-4 lg:grid-cols-2">
          {blueprint.sections.map((section) => (
            <article key={`${section.type}-${section.title}`} className="page-card px-5 py-5">
              <p className="text-sm font-semibold tracking-[0.14em] uppercase text-[var(--brand-deep)]">{section.title}</p>
              <div className="mt-4 space-y-3 text-sm leading-7 text-[var(--muted)]">
                {section.items.map((item) => (
                  <p key={item}>{item}</p>
                ))}
              </div>
            </article>
          ))}
        </div>

        <footer className="mt-8 page-card flex flex-col gap-3 px-5 py-5 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-sm font-semibold">{portfolio.name}</p>
            <p className="mt-1 text-sm text-[var(--muted)]">Powered by Tapfolio NFC identity</p>
          </div>
          <Link href="/" className="text-sm font-semibold text-[var(--brand-deep)]">
            Create your own card
          </Link>
        </footer>
      </section>
    </main>
  );
}
