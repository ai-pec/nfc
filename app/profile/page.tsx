import Link from "next/link";
import { requireAuth, getCurrentAppUser } from "@/lib/auth-server";
import { extractBlueprint } from "@/lib/portfolio-render";
import { getPortfolioPublicUrl } from "@/lib/portfolio-url";
import { supabaseAdmin } from "@/lib/supabase";

export default async function ProfilePage() {
  const session = await requireAuth();
  const appUser = await getCurrentAppUser();

  const { data: portfolio, error } = await supabaseAdmin
    .from("portfolios")
    .select(
      "uid, slug, name, email, phone, whatsapp, instagram, linkedin, company, designation, headline, about, website, theme, published, site_paused, canvas",
    )
    .eq("uid", appUser?.uid ?? "")
    .maybeSingle();

  if (error) {
    throw error;
  }

  if (!portfolio) {
    return (
      <main className="section-shell page-hero flex-1">
        <section className="glass-panel rounded-[2rem] p-6 md:p-8">
          <h1 className="text-4xl font-semibold tracking-tight md:text-5xl">Profile not ready yet</h1>
          <p className="mt-4 text-base leading-7 text-[var(--muted)]">
            Your account exists, but the portfolio row has not been prepared yet.
          </p>
        </section>
      </main>
    );
  }

  const blueprint = extractBlueprint(portfolio);
  const publicUrl = getPortfolioPublicUrl({ slug: portfolio.slug });
  const highlights = [
    {
      label: "Portfolio URL",
      value: publicUrl ? "Ready" : "Pending",
      detail: publicUrl ?? "Publish the portfolio to expose the public link.",
    },
    {
      label: "Publishing",
      value: portfolio.published ? "Published" : "Draft",
      detail: portfolio.published ? "The hosted page is currently available to visitors." : "The hosted page is still private.",
    },
    {
      label: "Availability",
      value: portfolio.site_paused ? "Frozen" : "Live",
      detail: portfolio.site_paused ? "Public access is currently paused by dashboard controls." : "The page is available when published.",
    },
  ];

  return (
    <main className="section-shell page-hero flex-1">
      <section className="glass-panel overflow-hidden rounded-[2rem] p-6 md:p-8">
        <span className="eyebrow inline-flex rounded-full px-3 py-1 text-xs font-semibold tracking-[0.18em] uppercase">
          My profile
        </span>
        <div className="mt-5 grid gap-6 lg:grid-cols-[1.05fr_0.95fr] lg:items-end">
          <div>
            <h1 className="text-4xl font-semibold tracking-tight md:text-6xl">{portfolio.name}</h1>
            <p className="mt-4 max-w-2xl text-base leading-7 text-[var(--muted)] md:text-lg">{blueprint.summary}</p>
          </div>
          <div className="rounded-[1.75rem] border border-[var(--brand-strong)] bg-[linear-gradient(180deg,rgba(126,49,16,0.08),rgba(255,248,242,0.92))] px-6 py-6">
            <p className="text-xs font-semibold tracking-[0.16em] uppercase text-[var(--brand-deep)]">Identity summary</p>
            <p className="mt-3 text-lg font-semibold">{session.user.email}</p>
            <p className="mt-2 text-sm leading-6 text-[var(--muted)]">
              This internal profile page helps you review what the system is currently presenting through your hosted
              NFC portfolio.
            </p>
            {publicUrl ? (
              <Link
                href={publicUrl}
                target="_blank"
                className="mt-5 inline-flex rounded-full bg-[var(--brand)] px-5 py-3 text-sm font-semibold text-white transition-colors hover:bg-[var(--brand-deep)]"
              >
                Open live portfolio
              </Link>
            ) : null}
          </div>
        </div>

        <div className="mt-8 grid gap-4 md:grid-cols-3">
          {highlights.map((item) => (
            <article key={item.label} className="page-card px-5 py-5">
              <p className="text-xs font-semibold tracking-[0.16em] uppercase text-[var(--brand-deep)]">{item.label}</p>
              <h2 className="mt-3 text-2xl font-semibold">{item.value}</h2>
              <p className="mt-3 text-sm leading-6 text-[var(--muted)]">{item.detail}</p>
            </article>
          ))}
        </div>

        <div className="mt-8 grid gap-4 md:grid-cols-2">
          <article className="page-card px-5 py-5 text-sm leading-7 text-[var(--muted)]">
            <p className="text-xs font-semibold tracking-[0.16em] uppercase text-[var(--brand-deep)]">Public URL</p>
            <p className="mt-3 break-all">
              {publicUrl ? (
                <Link href={publicUrl} target="_blank" className="font-semibold text-[var(--brand-deep)]">
                  {publicUrl}
                </Link>
              ) : (
                "Not available yet"
              )}
            </p>
          </article>
          <article className="page-card px-5 py-5 text-sm leading-7 text-[var(--muted)]">
            <p className="text-xs font-semibold tracking-[0.16em] uppercase text-[var(--brand-deep)]">Profile summary</p>
            <p className="mt-3">
              {portfolio.headline ?? "Headline will appear here once your profile content is fully prepared."}
            </p>
          </article>
        </div>

        <div className="mt-8 grid gap-4 md:grid-cols-2">
          {blueprint.sections.map((section) => (
            <article key={`${section.type}-${section.title}`} className="page-card px-5 py-5">
              <p className="text-xs font-semibold tracking-[0.16em] uppercase text-[var(--brand-deep)]">{section.title}</p>
              <div className="mt-4 space-y-3 text-sm leading-6 text-[var(--muted)]">
                {section.items.map((item) => (
                  <p key={item}>{item}</p>
                ))}
              </div>
            </article>
          ))}
        </div>
      </section>
    </main>
  );
}
