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

  return (
    <main className="section-shell page-hero flex-1">
      <section className="glass-panel rounded-[2rem] p-6 md:p-8">
        <span className="eyebrow inline-flex rounded-full px-3 py-1 text-xs font-semibold tracking-[0.18em] uppercase">
          My profile
        </span>
        <h1 className="mt-5 text-4xl font-semibold tracking-tight md:text-5xl">{portfolio.name}</h1>
        <p className="mt-4 max-w-2xl text-base leading-7 text-[var(--muted)]">
          {blueprint.summary}
        </p>

        <div className="mt-6 grid gap-4 md:grid-cols-2">
          <article className="page-card px-5 py-4 text-sm leading-7 text-[var(--muted)]">
            Signed in as <span className="font-semibold text-[var(--foreground)]">{session.user.email}</span>
            <br />
            Public URL:{" "}
            {publicUrl ? (
              <Link href={publicUrl} target="_blank" className="font-semibold text-[var(--brand-deep)]">
                {publicUrl}
              </Link>
            ) : (
              "Not available yet"
            )}
          </article>
          <article className="page-card px-5 py-4 text-sm leading-7 text-[var(--muted)]">
            Status: <span className="font-semibold text-[var(--foreground)]">{portfolio.published ? "Published" : "Draft"}</span>
            <br />
            Availability:{" "}
            <span className="font-semibold text-[var(--foreground)]">{portfolio.site_paused ? "Frozen" : "Live"}</span>
          </article>
        </div>

        <div className="mt-6 grid gap-4 md:grid-cols-2">
          {blueprint.sections.map((section) => (
            <article key={`${section.type}-${section.title}`} className="page-card px-5 py-5">
              <p className="text-sm font-semibold tracking-[0.14em] uppercase text-[var(--brand-deep)]">{section.title}</p>
              <div className="mt-3 space-y-2 text-sm leading-6 text-[var(--muted)]">
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
