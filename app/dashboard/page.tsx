import { OnboardingForm } from "@/components/onboarding-form";
import { PortfolioAiForm } from "@/components/portfolio-ai-form";
import { PortfolioPublishControls } from "@/components/portfolio-publish-controls";
import { SignOutButton } from "@/components/sign-out-button";
import { requireAuth, getCurrentAppUser } from "@/lib/auth-server";
import { getOnboardingDefaults } from "@/lib/portfolio-defaults";
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
  const needsOnboarding = !appUser?.profile_completed;
  const publicUrl = portfolio?.slug ? getPortfolioPublicUrl({ slug: portfolio.slug }) : null;
  const workspaceStats = [
    {
      label: "Workspace status",
      value: needsOnboarding ? "Onboarding pending" : "Ready",
      detail: needsOnboarding ? "Your first submission will set up the hosted profile." : "Your profile system is active.",
    },
    {
      label: "Portfolio state",
      value: portfolio?.published ? (portfolio.site_paused ? "Frozen" : "Published") : "Draft",
      detail: portfolio?.published ? "Public visitors can access your hosted card page." : "Publish when you are satisfied with the generated profile.",
    },
    {
      label: "Latest build",
      value: latestBuild?.status ?? "Not started",
      detail: latestBuild?.requested_at
        ? `Requested ${new Date(latestBuild.requested_at).toLocaleDateString("en-IN", {
            day: "numeric",
            month: "short",
            year: "numeric",
          })}`
        : "A new build will be created from onboarding or AI generation.",
    },
  ];

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
      <section className="glass-panel overflow-hidden rounded-[2rem] p-6 md:p-8">
        <div className="grid gap-6 border-b border-[var(--line)] pb-8 lg:grid-cols-[1.1fr_0.9fr] lg:items-end">
          <div>
            <span className="eyebrow inline-flex rounded-full px-3 py-1 text-xs font-semibold tracking-[0.18em] uppercase">
              Workspace
            </span>
            <h1 className="mt-5 max-w-4xl text-4xl font-semibold tracking-tight md:text-6xl">
              {needsOnboarding ? "Set up your NFC identity workspace." : `Welcome back, ${session.user.name ?? appUser?.name ?? "creator"}.`}
            </h1>
            <p className="mt-4 max-w-2xl text-base leading-7 text-[var(--muted)] md:text-lg">
              Manage the hosted profile linked to your NFC card, control publish status, and generate a more polished
              portfolio presentation from one professional control room.
            </p>
          </div>

          <div className="grid gap-3 sm:grid-cols-[1fr_auto]">
            <div className="page-card px-5 py-4">
              <p className="text-xs font-semibold tracking-[0.16em] uppercase text-[var(--brand-deep)]">Account</p>
              <p className="mt-3 text-lg font-semibold">{appUser?.name ?? session.user.name ?? "Workspace owner"}</p>
              <p className="mt-1 text-sm text-[var(--muted)]">{session.user.email}</p>
              <p className="mt-3 text-xs uppercase tracking-[0.16em] text-[var(--muted)]">Role: {appUser?.role ?? "user"}</p>
            </div>
            <div className="flex items-start justify-end">
              <SignOutButton />
            </div>
          </div>
        </div>

        <div className="mt-6 grid gap-4 md:grid-cols-3">
          {workspaceStats.map((item) => (
            <article key={item.label} className="page-card px-5 py-5">
              <p className="text-xs font-semibold tracking-[0.16em] uppercase text-[var(--brand-deep)]">{item.label}</p>
              <h2 className="mt-3 text-2xl font-semibold">{item.value}</h2>
              <p className="mt-3 text-sm leading-6 text-[var(--muted)]">{item.detail}</p>
            </article>
          ))}
        </div>

        <div className="mt-8 grid gap-6 lg:grid-cols-[0.92fr_1.08fr]">
          <section className="space-y-4">
            <article className="page-card px-5 py-5">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-xs font-semibold tracking-[0.16em] uppercase text-[var(--brand-deep)]">Portfolio command</p>
                  <h2 className="mt-3 text-3xl font-semibold">{portfolio?.name ?? "Profile draft"}</h2>
                </div>
                <div className="rounded-full bg-[rgba(36,91,69,0.1)] px-3 py-2 text-xs font-semibold text-[var(--success)]">
                  {portfolio?.published ? (portfolio.site_paused ? "Frozen" : "Live") : "Draft"}
                </div>
              </div>

              <div className="mt-5 grid gap-3 text-sm text-[var(--muted)]">
                <div className="page-card px-4 py-3">
                  <span className="font-semibold text-[var(--foreground)]">Slug:</span> {portfolio?.slug ?? "Not ready yet"}
                </div>
                <div className="page-card px-4 py-3">
                  <span className="font-semibold text-[var(--foreground)]">Theme:</span> {portfolio?.theme ?? "light"}
                </div>
                <div className="page-card px-4 py-3">
                  <span className="font-semibold text-[var(--foreground)]">Latest build:</span> {latestBuild?.status ?? "No build yet"}
                </div>
              </div>

              <div className="mt-5">
                <PortfolioPublishControls
                  published={Boolean(portfolio?.published)}
                  sitePaused={Boolean(portfolio?.site_paused)}
                />
              </div>

              <div className="mt-5 grid gap-3">
                <a
                  href={publicUrl ?? "#"}
                  target="_blank"
                  rel="noreferrer"
                  className={`inline-flex rounded-full border px-5 py-3 text-sm font-semibold transition-colors ${
                    publicUrl
                      ? "border-[var(--brand-strong)] bg-white text-[var(--brand-deep)] hover:bg-[var(--surface-strong)]"
                      : "cursor-not-allowed border-[var(--line)] bg-white/50 text-[var(--muted)]"
                  }`}
                >
                  Open public portfolio
                </a>
                <a
                  href="/profile"
                  className="inline-flex rounded-full border border-[var(--line)] bg-white/70 px-5 py-3 text-sm font-semibold text-[var(--foreground)] transition-colors hover:bg-white"
                >
                  Review profile summary
                </a>
              </div>
            </article>

            <article className="page-card px-5 py-5">
              <p className="text-xs font-semibold tracking-[0.16em] uppercase text-[var(--brand-deep)]">Publishing notes</p>
              <div className="mt-4 space-y-3 text-sm leading-6 text-[var(--muted)]">
                <p>Your NFC card should always point to the same hosted portfolio link.</p>
                <p>Freeze the site if you need to pause public access without deleting portfolio data.</p>
                <p>Each new AI generation creates a tracked build entry before the public site is updated.</p>
              </div>
            </article>
          </section>

          <section>
            {needsOnboarding ? (
              <div className="space-y-4">
                <article className="rounded-[1.75rem] border border-[var(--brand-strong)] bg-[linear-gradient(180deg,rgba(126,49,16,0.08),rgba(255,248,242,0.92))] px-6 py-6">
                  <p className="text-xs font-semibold tracking-[0.16em] uppercase text-[var(--brand-deep)]">First-time setup</p>
                  <h2 className="mt-3 text-3xl font-semibold tracking-tight">Complete your onboarding once.</h2>
                  <p className="mt-3 max-w-2xl text-sm leading-7 text-[var(--muted)]">
                    As soon as you submit this form, your NFC card profile details, uploaded assets, and first AI
                    portfolio build will be created directly from this workspace.
                  </p>
                  <div className="mt-5 grid gap-3 md:grid-cols-3">
                    {[
                      "Fill in profile details",
                      "Upload gallery and documents",
                      "Generate and publish the hosted site",
                    ].map((step) => (
                      <div key={step} className="rounded-[1.25rem] border border-[var(--line)] bg-white/80 px-4 py-4 text-sm font-medium text-[var(--foreground)]">
                        {step}
                      </div>
                    ))}
                  </div>
                </article>
                <OnboardingForm
                  defaults={getOnboardingDefaults({
                    sessionName: session.user.name,
                    appUserName: appUser?.name,
                    portfolio,
                  })}
                />
              </div>
            ) : (
              <>
                <PortfolioAiForm defaultPrompt="Make it sleek, premium, mobile-first, and easy to trust within a few seconds." />
                <article className="page-card mt-6 px-5 py-5 text-sm leading-7 text-[var(--muted)]">
                  <p className="text-xs font-semibold tracking-[0.16em] uppercase text-[var(--brand-deep)]">Operator note</p>
                  <p className="mt-3">
                    Shared onboarding link: <span className="font-semibold text-[var(--foreground)]">/onboarding</span>
                  </p>
                  <p className="mt-2">
                    Send every signed-in user there first. That route saves profile data, creates a build record, and
                    then runs the AI portfolio generation flow.
                  </p>
                </article>
                {blueprint ? (
                  <article className="page-card mt-6 px-5 py-5">
                    <p className="text-xs font-semibold tracking-[0.16em] uppercase text-[var(--brand-deep)]">Latest generated direction</p>
                    <h3 className="mt-3 text-3xl font-semibold tracking-tight">{blueprint.hero.headline}</h3>
                    <p className="mt-3 text-sm leading-7 text-[var(--muted)]">{blueprint.summary}</p>
                  </article>
                ) : null}
              </>
            )}
          </section>
        </div>
      </section>
    </main>
  );
}
