import Link from "next/link";
import { AdminAccountActions } from "@/components/admin-account-actions";
import { requireAdmin } from "@/lib/auth-server";
import { getPortfolioPublicUrl } from "@/lib/portfolio-url";
import { getSiteMetrics } from "@/lib/supabase-queries";
import { supabaseAdmin } from "@/lib/supabase";

export default async function AdminPage() {
  const { session } = await requireAdmin();
  const metrics = await getSiteMetrics();
  const { data: accounts } = await supabaseAdmin
    .from("users")
    .select("uid, email, name, role, account_status, portfolios(uid, slug, published, site_paused)")
    .order("created_at", { ascending: false })
    .limit(8);
  const portfolioUids = (accounts ?? []).flatMap((account) => account.portfolios?.map((portfolio) => portfolio.uid) ?? []);
  const buildLookup = new Map<string, { status: string; requested_at: string | null }>();

  if (portfolioUids.length > 0) {
    const { data: builds, error: buildsError } = await supabaseAdmin
      .from("portfolio_builds")
      .select("portfolio_uid, status, requested_at")
      .in("portfolio_uid", portfolioUids)
      .order("requested_at", { ascending: false });

    if (!buildsError && builds) {
      builds.forEach((build) => {
        if (!buildLookup.has(build.portfolio_uid)) {
          buildLookup.set(build.portfolio_uid, {
            status: build.status,
            requested_at: build.requested_at,
          });
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
            This route is protected through your Supabase-backed app session and admin role checks, with pause and
            moderation controls ready to expand.
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
                  const portfolio = account.portfolios?.[0];

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
                        Build: {portfolio ? buildLookup.get(portfolio.uid)?.status ?? "not-run" : "not-ready"}
                      </p>
                      <AdminAccountActions uid={account.uid} sitePaused={Boolean(portfolio?.site_paused)} />
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
