import Link from "next/link";
import { AdminUnlockForm } from "@/components/admin-unlock-form";
import { AdminAccountActions } from "@/components/admin-account-actions";
import { AdminLockButton } from "@/components/admin-lock-button";
import { hasAdminSession } from "@/lib/admin";
import { getCurrentAppUser, requireAuth } from "@/lib/auth-server";
import { getPortfolioPublicUrl } from "@/lib/portfolio-url";
import { getSiteMetrics } from "@/lib/supabase-queries";
import { supabaseAdmin } from "@/lib/supabase";

type AdminPortfolioRelation =
  | {
      uid: string;
      slug: string | null;
      published: boolean | null;
      site_paused: boolean | null;
    }
  | {
      uid: string;
      slug: string | null;
      published: boolean | null;
      site_paused: boolean | null;
    }[]
  | null
  | undefined;

function pickPortfolio(relation: AdminPortfolioRelation) {
  if (Array.isArray(relation)) {
    return relation[0] ?? null;
  }

  return relation ?? null;
}

export default async function AdminPage() {
  const session = await requireAuth();
  const appUser = await getCurrentAppUser();
  const adminUnlocked = await hasAdminSession(appUser?.uid);

  if (!adminUnlocked) {
    return (
      <main className="section-shell page-hero flex-1">
        <section className="glass-panel mx-auto max-w-3xl rounded-[2rem] p-6 md:p-8">
          <span className="eyebrow inline-flex rounded-full px-3 py-1 text-xs font-semibold tracking-[0.18em] uppercase">
            Restricted area
          </span>
          <h1 className="mt-5 text-4xl font-semibold tracking-tight md:text-5xl">Unlock the admin workspace</h1>
          <p className="mt-4 max-w-2xl text-base leading-7 text-[var(--muted)]">
            The admin panel is protected by a separate operations password. It is no longer tied to any specific user
            account or email allowlist.
          </p>
          <div className="mt-6">
            <AdminUnlockForm />
          </div>
        </section>
      </main>
    );
  }

  const metrics = await getSiteMetrics();
  const { data: accounts } = await supabaseAdmin
    .from("users")
    .select("uid, email, name, role, account_status, portfolios(uid, slug, published, site_paused)")
    .order("created_at", { ascending: false })
    .limit(8);
  const portfolioUids = (accounts ?? []).flatMap((account) => {
    const portfolio = pickPortfolio(account.portfolios as AdminPortfolioRelation);
    return portfolio?.uid ? [portfolio.uid] : [];
  });
  const buildLookup = new Map<string, { id: string; status: string; requested_at: string | null }>();

  if (portfolioUids.length > 0) {
    const { data: builds, error: buildsError } = await supabaseAdmin
      .from("portfolio_builds")
      .select("id, portfolio_uid, status, requested_at")
      .in("portfolio_uid", portfolioUids)
      .order("requested_at", { ascending: false });

    if (!buildsError && builds) {
      builds.forEach((build) => {
        if (!buildLookup.has(build.portfolio_uid)) {
          buildLookup.set(build.portfolio_uid, {
            id: build.id,
            status: build.status,
            requested_at: build.requested_at,
          });
        }
      });
    }
  }

  const buildIds = Array.from(buildLookup.values()).map((build) => build.id);
  const adminReviewLookup = new Map<string, string>();

  if (buildIds.length > 0) {
    const { data: reviews, error: reviewsError } = await supabaseAdmin
      .from("portfolio_reviews")
      .select("build_id, status, reviewer_type, created_at")
      .eq("reviewer_type", "admin")
      .in("build_id", buildIds)
      .order("created_at", { ascending: false });

    if (!reviewsError && reviews) {
      reviews.forEach((review) => {
        if (!adminReviewLookup.has(review.build_id)) {
          adminReviewLookup.set(review.build_id, review.status);
        }
      });
    }
  }

  return (
    <main className="section-shell page-hero flex-1">
      <section className="mx-auto max-w-3xl glass-panel rounded-[2rem] p-6 md:p-8">
        <span className="eyebrow inline-flex rounded-full px-3 py-1 text-xs font-semibold tracking-[0.18em] uppercase">
          Restricted area
        </span>
        <h1 className="mt-5 text-4xl font-semibold tracking-tight md:text-5xl">Admin access is intentionally low-profile</h1>
        <p className="mt-5 text-base leading-7 text-[var(--muted)]">
          This route is kept out of the main navigation because most customers should never need it. It is meant only
          for secure support workflows like editing accounts, pausing hosted sites, replacing broken portfolio data, and
          deleting accounts after verification.
        </p>

        <div className="mt-6 space-y-4">
          <div className="flex justify-end">
            <AdminLockButton />
          </div>
          <article className="page-card px-5 py-4 text-sm leading-7 text-[var(--muted)]">
            Signed in as admin: <span className="font-semibold text-[var(--foreground)]">{session.user.email}</span>
          </article>
          <article className="page-card grid gap-3 px-5 py-4 text-sm text-[var(--muted)] md:grid-cols-2">
            <div>Total users: <span className="font-semibold text-[var(--foreground)]">{metrics.totalUsers}</span></div>
            <div>Published portfolios: <span className="font-semibold text-[var(--foreground)]">{metrics.publishedPortfolios}</span></div>
            <div>Paid orders: <span className="font-semibold text-[var(--foreground)]">{metrics.paidOrders}</span></div>
            <div>New contact requests: <span className="font-semibold text-[var(--foreground)]">{metrics.newLeads}</span></div>
          </article>
          <article className="page-card px-5 py-4 text-sm leading-7 text-[var(--muted)]">
            This route is protected through your Supabase-backed app session plus the separate admin password unlock,
            with pause and moderation controls ready to expand.
          </article>
          <article className="page-card px-5 py-4 text-sm leading-7 text-[var(--muted)]">
            Run the SQL in <span className="font-semibold text-[var(--foreground)]">docs/supabase-admin-migration.sql</span>
            to add admin roles, account pause status, and audit logs onto your current schema.
          </article>
          <article className="page-card px-5 py-4">
            <p className="text-sm font-semibold tracking-[0.14em] uppercase text-[var(--brand-deep)]">Recent accounts</p>
            <div className="mt-4 space-y-3 text-sm text-[var(--muted)]">
              {(accounts ?? []).map((account) => (
                (() => {
                  const portfolio = pickPortfolio(account.portfolios as AdminPortfolioRelation);
                  const latestBuild = portfolio ? buildLookup.get(portfolio.uid) : null;

                  return (
                    <div key={account.uid} className="rounded-2xl border border-[var(--line)] bg-white/70 px-4 py-3">
                      <p className="font-semibold text-[var(--foreground)]">{account.name ?? "Unnamed user"}</p>
                      <p className="mt-1">{account.email}</p>
                      <p className="mt-1 break-all text-xs">
                        {portfolio?.slug ? (
                          <Link
                            href={getPortfolioPublicUrl({ slug: portfolio.slug }) ?? "#"}
                            target="_blank"
                            className="font-medium text-[var(--brand-deep)]"
                          >
                            {getPortfolioPublicUrl({ slug: portfolio.slug })}
                          </Link>
                        ) : (
                          "Portfolio URL not generated yet"
                        )}
                      </p>
                      <p className="mt-1 uppercase tracking-[0.14em] text-xs">
                        {account.role} / {account.account_status}
                      </p>
                      <p className="mt-1 uppercase tracking-[0.14em] text-xs">
                        {portfolio?.published ? "Published" : "Draft"} / {portfolio?.site_paused ? "Frozen" : "Live"}
                      </p>
                      <p className="mt-1 uppercase tracking-[0.14em] text-xs">
                        Build: {latestBuild?.status ?? "not-ready"}
                      </p>
                      <AdminAccountActions
                        uid={account.uid}
                        sitePaused={Boolean(portfolio?.site_paused)}
                        buildId={latestBuild?.id ?? null}
                        adminReviewStatus={latestBuild ? adminReviewLookup.get(latestBuild.id) ?? null : null}
                      />
                    </div>
                  );
                })()
              ))}
            </div>
          </article>
        </div>
      </section>
    </main>
  );
}
