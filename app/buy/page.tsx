import Link from "next/link";
import { pricingPlans } from "@/lib/site-content";

export default function BuyPage() {
  return (
    <main className="section-shell page-hero flex-1">
      <section className="glass-panel rounded-[2rem] p-6 md:p-8">
        <span className="eyebrow inline-flex rounded-full px-3 py-1 text-xs font-semibold tracking-[0.18em] uppercase">
          Buy NFC card
        </span>
        <h1 className="mt-5 max-w-3xl text-4xl font-semibold tracking-tight md:text-5xl">
          Choose the card setup that fits your personal brand or team rollout.
        </h1>
        <p className="mt-4 max-w-2xl text-base leading-7 text-[var(--muted)]">
          This page is designed as your direct purchase funnel. Once payments are wired, the selected plan can start the
          claim flow and profile setup automatically.
        </p>

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
              <p className={`text-sm font-semibold tracking-[0.14em] uppercase ${index === 1 ? "text-white/70" : "text-[var(--brand-deep)]"}`}>
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
                href="/contact"
                className={`mt-6 inline-flex rounded-full px-5 py-3 text-sm font-semibold ${
                  index === 1
                    ? "bg-white text-[var(--foreground)]"
                    : "bg-[var(--brand)] text-white hover:bg-[var(--brand-deep)]"
                }`}
              >
                Start with {plan.name}
              </Link>
            </article>
          ))}
        </div>
      </section>
    </main>
  );
}
