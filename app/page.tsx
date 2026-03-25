import Link from "next/link";
import { faqs, pricingPlans } from "@/lib/site-content";

const benefits = [
  "Tap once to open a hosted profile with contact actions, socials, and portfolio highlights.",
  "Update the profile any time instead of reprinting business cards whenever something changes.",
  "Separate public media from private vault files so sensitive documents stay controlled.",
];

const useCases = [
  { title: "Creators", copy: "Show reels, social proof, bookings, and brand links in one touch." },
  { title: "Consultants", copy: "Share case studies, WhatsApp, LinkedIn, and a polished intro page instantly." },
  { title: "Sales teams", copy: "Deploy a branded card program with centralized updates and admin oversight." },
];

const previewMetrics = {
  totalUsers: "500+",
  publishedPortfolios: "120+",
  paidOrders: "300+",
  newLeads: "24",
};

const featuredProfiles = [
  {
    name: "Pavitr Sharma",
    slug: "pavitr-sharma",
    headline: "Founder profile with premium contact actions and hosted portfolio sections.",
    company: "Tapfolio",
  },
  {
    name: "Riya Kapoor",
    slug: "riya-kapoor",
    headline: "Consulting-led profile with case study highlights and direct WhatsApp access.",
    company: "Independent",
  },
  {
    name: "Aarav Mehta",
    slug: "aarav-mehta",
    headline: "Creator card with social proof, bookings, and mobile-first identity design.",
    company: "Studio profile",
  },
];

export default function Home() {
  return (
    <main className="relative flex-1 overflow-hidden pb-4">
      <div className="grid-lines absolute inset-0 opacity-50" />
      <div className="hero-orb absolute left-[6%] top-36 h-52 w-52 rounded-full bg-[radial-gradient(circle,_rgba(243,200,175,0.95),_rgba(243,200,175,0))]" />
      <div className="hero-orb absolute right-[8%] top-36 h-64 w-64 rounded-full bg-[radial-gradient(circle,_rgba(188,90,45,0.18),_rgba(188,90,45,0))]" />

      <section className="section-shell page-hero relative">
        <div className="grid gap-8 lg:grid-cols-[1.08fr_0.92fr] lg:items-end">
          <div className="fade-up">
            <span className="eyebrow inline-flex rounded-full px-3 py-1 text-xs font-semibold tracking-[0.18em] uppercase">
              Smart digital visiting cards
            </span>
            <h1 className="mt-6 max-w-4xl text-5xl leading-[0.95] font-semibold tracking-tight md:text-7xl">
              A BharatTouch-style
              <span className="font-accent ml-3 text-[var(--brand)]">tap-to-share</span>
              <br />
              experience with a more premium web presence.
            </h1>
            <p className="mt-6 max-w-2xl text-lg leading-8 text-[var(--muted)] md:text-xl">
              Replace paper cards with NFC cards that open a modern profile, portfolio, social links, and lead-ready
              contact actions instantly on the phone.
            </p>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link
                href="/buy"
                className="rounded-full bg-[var(--brand)] px-6 py-3 text-center text-sm font-semibold text-white transition-colors hover:bg-[var(--brand-deep)]"
              >
                Buy your NFC card
              </Link>
              <Link
                href="/about"
                className="rounded-full border border-[var(--brand-strong)] bg-white/90 px-6 py-3 text-center text-sm font-semibold text-[var(--brand-deep)] transition-colors hover:bg-[var(--surface-strong)]"
              >
                See how it works
              </Link>
            </div>

            <div className="mt-10 grid gap-3 md:grid-cols-3">
              {[
                ["Users onboarded", previewMetrics.totalUsers],
                ["Published profiles", previewMetrics.publishedPortfolios],
                ["Paid orders", previewMetrics.paidOrders],
              ].map(([title, copy]) => (
                <div key={title} className="page-card px-4 py-4">
                  <p className="text-sm font-semibold text-[var(--foreground)]">{title}</p>
                  <p className="mt-2 text-sm text-[var(--muted)]">{copy}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="glass-panel fade-up-delay rounded-[2rem] p-5 md:p-6">
            <div className="rounded-[1.75rem] bg-[linear-gradient(180deg,rgba(255,255,255,0.92),rgba(255,243,235,0.95))] p-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-semibold tracking-[0.18em] uppercase text-[var(--brand-deep)]">
                    Live profile preview
                  </p>
                  <h2 className="mt-2 text-2xl font-semibold">Your card opens this kind of page</h2>
                </div>
                <div className="rounded-full bg-[rgba(36,91,69,0.12)] px-3 py-1 text-xs font-semibold text-[var(--success)]">
                  NFC ready
                </div>
              </div>

              <div className="mt-6 rounded-[1.75rem] bg-[var(--foreground)] p-5 text-white">
                <p className="text-sm uppercase tracking-[0.16em] text-white/64">Founder profile</p>
                <h3 className="mt-3 text-3xl font-semibold">Pavitr Sharma</h3>
                <p className="mt-2 max-w-sm text-sm leading-6 text-white/76">
                  Building a digital-first identity card that opens a professional profile, socials, and portfolio in
                  one touch.
                </p>
                <div className="mt-5 flex flex-wrap gap-2">
                  {["Save contact", "WhatsApp", "Website", "Instagram"].map((tag) => (
                    <span key={tag} className="rounded-full bg-white/12 px-3 py-2 text-xs font-semibold">
                      {tag}
                    </span>
                  ))}
                </div>
              </div>

              <div className="mt-4 space-y-3">
                {benefits.map((benefit) => (
                  <div key={benefit} className="page-card px-4 py-4 text-sm leading-6 text-[var(--muted)]">
                    {benefit}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="section-shell mt-16 grid gap-6 md:grid-cols-3">
        {useCases.map((item) => (
          <article key={item.title} className="glass-panel rounded-[1.75rem] p-6">
            <p className="text-sm font-semibold tracking-[0.16em] uppercase text-[var(--brand-deep)]">{item.title}</p>
            <p className="mt-4 text-base leading-7 text-[var(--muted)]">{item.copy}</p>
          </article>
        ))}
      </section>

      <section className="section-shell mt-16">
        <div className="glass-panel rounded-[2rem] p-6 md:p-8">
          <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
            <div>
              <span className="eyebrow inline-flex rounded-full px-3 py-1 text-xs font-semibold tracking-[0.18em] uppercase">
                Live portfolio sample set
              </span>
              <h2 className="mt-5 text-4xl font-semibold tracking-tight">Examples of how hosted profiles can look</h2>
            </div>
            <div className="page-card px-4 py-3 text-sm text-[var(--muted)]">New leads waiting: {previewMetrics.newLeads}</div>
          </div>

          <div className="mt-8 grid gap-4 md:grid-cols-3">
            {featuredProfiles.map((profile) => (
              <article key={profile.slug} className="page-card px-5 py-5">
                <p className="text-sm font-semibold tracking-[0.14em] uppercase text-[var(--brand-deep)]">
                  {profile.slug}
                </p>
                <h3 className="mt-3 text-2xl font-semibold">{profile.name}</h3>
                <p className="mt-2 text-sm leading-6 text-[var(--muted)]">{profile.headline ?? "Hosted NFC profile"}</p>
                <p className="mt-4 text-sm font-medium text-[var(--foreground)]">{profile.company ?? "Independent"}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="section-shell mt-16">
        <div className="glass-panel rounded-[2rem] p-6 md:p-8">
          <div className="max-w-2xl">
            <span className="eyebrow inline-flex rounded-full px-3 py-1 text-xs font-semibold tracking-[0.18em] uppercase">
              Pricing
            </span>
            <h2 className="mt-5 text-4xl font-semibold tracking-tight">Plans for individuals and teams</h2>
            <p className="mt-4 text-base leading-7 text-[var(--muted)]">
              The structure below gives the site the direct commercial feel you asked for, similar to digital business
              card brands, while keeping your product positioned as premium and scalable.
            </p>
          </div>

          <div className="mt-8 grid gap-4 lg:grid-cols-3">
            {pricingPlans.map((plan, index) => (
              <article
                key={plan.name}
                className={`rounded-[1.75rem] border p-6 ${
                  index === 1
                    ? "border-[var(--brand-strong)] bg-[var(--foreground)] text-white"
                    : "border-[var(--line)] bg-[rgba(255,251,247,0.84)]"
                }`}
              >
                <p
                  className={`text-sm font-semibold tracking-[0.14em] uppercase ${
                    index === 1 ? "text-white/68" : "text-[var(--brand-deep)]"
                  }`}
                >
                  {plan.name}
                </p>
                <p className="mt-4 text-4xl font-semibold">{plan.price}</p>
                <p className={`mt-4 text-sm leading-6 ${index === 1 ? "text-white/76" : "text-[var(--muted)]"}`}>
                  {plan.description}
                </p>
                <div className="mt-5 space-y-3">
                  {plan.features.map((feature) => (
                    <div key={feature} className={`text-sm ${index === 1 ? "text-white/88" : "text-[var(--muted)]"}`}>
                      {feature}
                    </div>
                  ))}
                </div>
                <Link
                  href="/buy"
                  className={`mt-6 inline-flex rounded-full px-5 py-3 text-sm font-semibold ${
                    index === 1
                      ? "bg-white text-[var(--foreground)]"
                      : "bg-[var(--brand)] text-white hover:bg-[var(--brand-deep)]"
                  }`}
                >
                  Choose {plan.name}
                </Link>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="section-shell mt-16 grid gap-6 lg:grid-cols-[1.05fr_0.95fr]">
        <div className="glass-panel rounded-[2rem] p-6 md:p-8">
          <span className="eyebrow inline-flex rounded-full px-3 py-1 text-xs font-semibold tracking-[0.18em] uppercase">
            Why it works
          </span>
          <div className="mt-6 space-y-4">
            {[
              "No app dependency for the receiver on supported devices.",
              "A stronger first impression than a plain link-in-bio page.",
              "Future-ready for AI-generated portfolios and subdomain hosting.",
            ].map((line) => (
              <div key={line} className="page-card px-5 py-4 text-sm leading-6 text-[var(--muted)]">
                {line}
              </div>
            ))}
          </div>
        </div>

        <div className="glass-panel rounded-[2rem] p-6 md:p-8">
          <span className="eyebrow inline-flex rounded-full px-3 py-1 text-xs font-semibold tracking-[0.18em] uppercase">
            Frequently asked
          </span>
          <div className="mt-6 space-y-4">
            {faqs.map((item) => (
              <article key={item.question} className="page-card px-5 py-4">
                <h3 className="text-base font-semibold">{item.question}</h3>
                <p className="mt-2 text-sm leading-6 text-[var(--muted)]">{item.answer}</p>
              </article>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
