const returnPoints = [
  "Returns are accepted within 7 days of delivery for unused physical cards in original condition.",
  "Custom-printed or already activated cards should be considered non-returnable unless there is a manufacturing issue.",
  "Refunds should be processed only after product inspection and order verification.",
];

export default function ReturnPolicyPage() {
  return (
    <main className="section-shell page-hero flex-1">
      <section className="glass-panel rounded-[2rem] p-6 md:p-8">
        <span className="eyebrow inline-flex rounded-full px-3 py-1 text-xs font-semibold tracking-[0.18em] uppercase">
          Return policy
        </span>
        <h1 className="mt-5 text-4xl font-semibold tracking-tight md:text-5xl">Return rules for physical NFC cards</h1>
        <div className="mt-6 space-y-4">
          {returnPoints.map((point) => (
            <article key={point} className="page-card px-5 py-4 text-sm leading-7 text-[var(--muted)]">
              {point}
            </article>
          ))}
        </div>
      </section>
    </main>
  );
}
