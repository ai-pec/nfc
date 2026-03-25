const steps = [
  {
    title: "Core identity",
    detail: "Name is required. Date of birth helps branch the onboarding experience without slowing the user down.",
  },
  {
    title: "Adaptive profile path",
    detail: "Adults get profession-focused prompts. Younger users see education, hobbies, and student-first sections.",
  },
  {
    title: "Social and contact",
    detail: "Phone, WhatsApp, GitHub, Instagram, and LinkedIn stay optional but structured for clean rendering.",
  },
  {
    title: "Media and vault",
    detail: "Public photos and private documents split into separate storage policies from day one.",
  },
  {
    title: "AI personalization",
    detail: "A final prompt captures the aesthetic direction for future schema-driven portfolio generation.",
  },
];

export default function OnboardingPage() {
  return (
    <main className="section-shell flex-1 py-8 md:py-12">
      <section className="glass-panel rounded-[2rem] p-6 md:p-8">
        <span className="eyebrow inline-flex rounded-full px-3 py-1 text-xs font-semibold tracking-[0.18em] uppercase">
          Claim flow preview
        </span>
        <div className="mt-5 grid gap-8 lg:grid-cols-[0.88fr_1.12fr]">
          <div>
            <h1 className="max-w-xl text-4xl leading-tight font-semibold md:text-5xl">
              Guided onboarding designed for fast NFC claims and polished portfolio setup.
            </h1>
            <p className="mt-4 max-w-xl text-base leading-7 text-[var(--muted)]">
              This route mirrors the architecture document: minimal friction up front, smart branching, and room for
              AI-assisted styling after the essentials are captured.
            </p>
          </div>

          <div className="grid gap-4">
            {steps.map((step, index) => (
              <article
                key={step.title}
                className="rounded-[1.5rem] border border-[var(--line)] bg-[rgba(255,251,247,0.82)] px-5 py-5"
              >
                <div className="flex items-start gap-4">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[var(--brand-soft)] font-semibold text-[var(--brand-deep)]">
                    {index + 1}
                  </div>
                  <div>
                    <h2 className="text-xl font-semibold">{step.title}</h2>
                    <p className="mt-2 text-sm leading-6 text-[var(--muted)]">{step.detail}</p>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
