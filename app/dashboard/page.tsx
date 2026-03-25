import { PortfolioAiForm } from "@/components/portfolio-ai-form";
import { PortfolioPublishControls } from "@/components/portfolio-publish-controls";
import { SignOutButton } from "@/components/sign-out-button";
import { requireAuth, getCurrentAppUser } from "@/lib/auth-server";
import { getLatestPortfolioBuild } from "@/lib/portfolio-builds";
import { extractBlueprint } from "@/lib/portfolio-render";
import { getPortfolioPublicUrl } from "@/lib/portfolio-url";
import { supabaseAdmin } from "@/lib/supabase";

export default async function DashboardPage() {
  const session = await requireAuth();
  const appUser = await getCurrentAppUser();

  const { data: portfolio, error } = await supabaseAdmin
    .from("portfolios")
    .select("slug, name, headline, about, theme, published, site_paused, canvas, whatsapp, phone, email, website")
    .eq("uid", appUser?.uid ?? "")
    .maybeSingle();

  if (error) {
    throw error;
  }

  const latestBuild = portfolio && appUser?.uid ? await getLatestPortfolioBuild(appUser.uid) : null;

  const blueprint = portfolio ? extractBlueprint({
    uid: appUser?.uid ?? "",
    slug: portfolio.slug,
    name: portfolio.name,
    email: portfolio.email ?? session.user.email ?? null,
    phone: portfolio.phone ?? null,
    whatsapp: portfolio.whatsapp ?? null,
    instagram: null,
    linkedin: null,
    company: null,
    designation: null,
    headline: portfolio.headline ?? null,
    about: portfolio.about ?? null,
    website: portfolio.website ?? null,
    theme: portfolio.theme ?? null,
    published: portfolio.published ?? false,
    site_paused: portfolio.site_paused ?? false,
    canvas: portfolio.canvas,
  }) : null;

  return (
    <main className="section-shell page-hero flex-1">
      <section className="glass-panel rounded-[2rem] p-6 md:p-8">
        <div className="flex flex-col gap-4 border-b border-[var(--line)] pb-6 md:flex-row md:items-end md:justify-between">
          <div>
            <span className="eyebrow inline-flex rounded-full px-3 py-1 text-xs font-semibold tracking-[0.18em] uppercase">
              Dashboard
            </span>
            <h1 className="mt-4 text-4xl font-semibold tracking-tight md:text-5xl">
              Welcome back, {session.user.name ?? appUser?.name ?? "creator"}
            </h1>
            <p className="mt-3 text-base leading-7 text-[var(--muted)]">
              This is your control room for the hosted profile, AI portfolio generation, and future card-linked data.
            </p>
          </div>
          <SignOutButton />
        </div>

        <div className="mt-6 grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
          <section className="space-y-4">
            <article className="page-card px-5 py-4">
              <p className="text-sm font-semibold tracking-[0.14em] uppercase text-[var(--brand-deep)]">Account</p>
              <p className="mt-3 text-sm text-[var(--muted)]">{session.user.email}</p>
              <p className="mt-2 text-sm text-[var(--muted)]">Role: {appUser?.role ?? "user"}</p>
            </article>

            <article className="page-card px-5 py-4">
              <p className="text-sm font-semibold tracking-[0.14em] uppercase text-[var(--brand-deep)]">Portfolio</p>
              <h2 className="mt-3 text-2xl font-semibold">{portfolio?.name ?? "Profile draft"}</h2>
              <p className="mt-2 text-sm text-[var(--muted)]">Slug: {portfolio?.slug ?? "Not ready yet"}</p>
              <p className="mt-2 text-sm text-[var(--muted)]">Theme: {portfolio?.theme ?? "light"}</p>
              <p className="mt-2 text-sm text-[var(--muted)]">
                Status: {portfolio?.published ? "Published" : "Draft"} {portfolio?.site_paused ? "(Paused)" : ""}
              </p>
              <p className="mt-2 text-sm text-[var(--muted)]">Latest build: {latestBuild?.status ?? "No build yet"}</p>
              <div className="mt-5">
                <PortfolioPublishControls
                  published={Boolean(portfolio?.published)}
                  sitePaused={Boolean(portfolio?.site_paused)}
                />
              </div>
              {portfolio?.slug ? (
                <a
                  href={getPortfolioPublicUrl({ slug: portfolio.slug }) ?? `/p/${portfolio.slug}`}
                  target="_blank"
                  rel="noreferrer"
                  className="mt-4 inline-flex text-sm font-semibold text-[var(--brand-deep)]"
                >
                  Open public portfolio
                </a>
              ) : null}
            </article>
          </section>

          <section>
            <PortfolioAiForm defaultPrompt="Make it sleek, premium, mobile-first, and easy to trust within a few seconds." />
            <article className="page-card mt-6 px-5 py-5 text-sm leading-7 text-[var(--muted)]">
              Shared onboarding link: <span className="font-semibold text-[var(--foreground)]">/onboarding</span>
              <br />
              Send every signed-in user there first. That route saves their profile data, creates a build record, and
              then runs the AI portfolio generation flow.
            </article>
            {blueprint ? (
              <article className="page-card mt-6 px-5 py-5">
                <p className="text-sm font-semibold tracking-[0.14em] uppercase text-[var(--brand-deep)]">Latest generated direction</p>
                <h3 className="mt-3 text-2xl font-semibold">{blueprint.hero.headline}</h3>
                <p className="mt-2 text-sm leading-6 text-[var(--muted)]">{blueprint.summary}</p>
              </article>
            ) : null}
          </section>
        </div>
      </section>
    </main>
  );
}
