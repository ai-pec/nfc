const privacyBlocks = [
  "Profile details such as name, links, and uploaded media are collected to build and host the user profile.",
  "Private documents should be stored separately and exposed only with time-limited signed URLs.",
  "Admin actions, account edits, and destructive moderation actions should be logged for auditing.",
];

export default function PrivacyPolicyPage() {
  return (
    <main className="section-shell page-hero flex-1">
      <section className="glass-panel rounded-[2rem] p-6 md:p-8">
        <span className="eyebrow inline-flex rounded-full px-3 py-1 text-xs font-semibold tracking-[0.18em] uppercase">
          Privacy policy
        </span>
        <h1 className="mt-5 text-4xl font-semibold tracking-tight md:text-5xl">How profile and NFC data should be handled</h1>
        <div className="mt-6 space-y-4">
          {privacyBlocks.map((block) => (
            <article key={block} className="page-card px-5 py-4 text-sm leading-7 text-[var(--muted)]">
              {block}
            </article>
          ))}
        </div>
      </section>
    </main>
  );
}
