export default function ContactPage() {
  return (
    <main className="section-shell page-hero flex-1">
      <section className="glass-panel rounded-[2rem] p-6 md:p-8">
        <span className="eyebrow inline-flex rounded-full px-3 py-1 text-xs font-semibold tracking-[0.18em] uppercase">
          Contact
        </span>
        <div className="mt-5 grid gap-8 lg:grid-cols-[0.9fr_1.1fr]">
          <div>
            <h1 className="text-4xl font-semibold tracking-tight md:text-5xl">Talk to us about your NFC card setup</h1>
            <p className="mt-5 max-w-xl text-base leading-7 text-[var(--muted)]">
              Use this page for sales inquiries, support questions, bulk card orders, or help with replacing and
              returning products.
            </p>

            <div className="mt-6 space-y-4">
              {[
                ["Email", "support@tapfolio.site"],
                ["Sales", "sales@tapfolio.site"],
                ["WhatsApp", "+91 90000 00000"],
              ].map(([label, value]) => (
                <div key={label} className="page-card px-5 py-4">
                  <p className="text-sm font-semibold text-[var(--brand-deep)]">{label}</p>
                  <p className="mt-2 text-sm text-[var(--muted)]">{value}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="page-card p-5 md:p-6">
            <div className="grid gap-4 md:grid-cols-2">
              <label className="text-sm font-medium">
                Name
                <input className="mt-2 w-full rounded-2xl border border-[var(--line)] bg-white px-4 py-3 outline-none" />
              </label>
              <label className="text-sm font-medium">
                Email
                <input className="mt-2 w-full rounded-2xl border border-[var(--line)] bg-white px-4 py-3 outline-none" />
              </label>
            </div>
            <label className="mt-4 block text-sm font-medium">
              Message
              <textarea className="mt-2 min-h-36 w-full rounded-2xl border border-[var(--line)] bg-white px-4 py-3 outline-none" />
            </label>
            <button className="mt-5 rounded-full bg-[var(--brand)] px-6 py-3 text-sm font-semibold text-white hover:bg-[var(--brand-deep)]">
              Send inquiry
            </button>
          </div>
        </div>
      </section>
    </main>
  );
}
