const values = [
  "A premium first impression without forcing users into an app install.",
  "Editable hosted profiles so your card stays relevant long after printing.",
  "A secure path for future private documents, admin controls, and portfolio hosting.",
];

export default function AboutPage() {
  return (
    <main className="section-shell page-hero flex-1">
      <section className="glass-panel rounded-[2rem] p-6 md:p-8">
        <span className="eyebrow inline-flex rounded-full px-3 py-1 text-xs font-semibold tracking-[0.18em] uppercase">
          About Tapfolio
        </span>
        <div className="mt-5 grid gap-8 lg:grid-cols-[1.05fr_0.95fr]">
          <div>
            <h1 className="max-w-3xl text-4xl font-semibold tracking-tight md:text-5xl">
              A smarter digital identity card for modern networking.
            </h1>
            <p className="mt-5 max-w-2xl text-base leading-7 text-[var(--muted)]">
              The idea is simple: one NFC card, one clean tap, and a polished profile opens instantly. Instead of
              handing out paper cards or multiple links, you share a single branded experience that can evolve with
              your work.
            </p>
            <p className="mt-4 max-w-2xl text-base leading-7 text-[var(--muted)]">
              The platform direction follows the strongest ideas from NFC digital business card brands, while adding a
              more ambitious product layer for hosted portfolios, admin controls, and secure document sharing.
            </p>
          </div>

          <div className="space-y-4">
            {values.map((item) => (
              <article key={item} className="page-card px-5 py-5 text-sm leading-6 text-[var(--muted)]">
                {item}
              </article>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
