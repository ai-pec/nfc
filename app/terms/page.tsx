const termsBlocks = [
  "Users are responsible for the accuracy of the information they publish through their hosted profile.",
  "Abuse, impersonation, or illegal content may result in account suspension or portfolio takedown.",
  "Platform changes, storage rules, and card fulfillment policies may be updated as the service evolves.",
];

export default function TermsPage() {
  return (
    <main className="section-shell page-hero flex-1">
      <section className="glass-panel rounded-[2rem] p-6 md:p-8">
        <span className="eyebrow inline-flex rounded-full px-3 py-1 text-xs font-semibold tracking-[0.18em] uppercase">
          Terms
        </span>
        <h1 className="mt-5 text-4xl font-semibold tracking-tight md:text-5xl">Basic platform terms and acceptable use</h1>
        <div className="mt-6 space-y-4">
          {termsBlocks.map((block) => (
            <article key={block} className="page-card px-5 py-4 text-sm leading-7 text-[var(--muted)]">
              {block}
            </article>
          ))}
        </div>
      </section>
    </main>
  );
}
