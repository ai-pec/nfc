const replacementPoints = [
  "Replacement requests should be accepted for damaged, defective, or incorrectly printed cards.",
  "Users should submit an order ID, issue photo, and delivery details before a replacement is approved.",
  "Lost cards can be reissued as paid replacements, while hosted profile data should remain editable.",
];

export default function ReplacementPolicyPage() {
  return (
    <main className="section-shell page-hero flex-1">
      <section className="glass-panel rounded-[2rem] p-6 md:p-8">
        <span className="eyebrow inline-flex rounded-full px-3 py-1 text-xs font-semibold tracking-[0.18em] uppercase">
          Replacement policy
        </span>
        <h1 className="mt-5 text-4xl font-semibold tracking-tight md:text-5xl">Replacement rules for faulty or lost cards</h1>
        <div className="mt-6 space-y-4">
          {replacementPoints.map((point) => (
            <article key={point} className="page-card px-5 py-4 text-sm leading-7 text-[var(--muted)]">
              {point}
            </article>
          ))}
        </div>
      </section>
    </main>
  );
}
