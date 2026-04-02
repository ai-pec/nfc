"use client";

import { useState } from "react";

type GeneratedBlueprint = {
  theme: string;
  layout_template: string;
  hero: {
    headline: string;
    subheadline: string;
  };
  summary: string;
  sections: Array<{
    id: string;
    type: string;
    variant: string;
    title: string;
    items: string[];
  }>;
  cta_bar: {
    primary: {
      action: string;
      label: string;
    };
  };
  source: string;
};

type PortfolioAiFormProps = {
  defaultPrompt: string;
};

export function PortfolioAiForm({ defaultPrompt }: PortfolioAiFormProps) {
  const [prompt, setPrompt] = useState(defaultPrompt);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [blueprint, setBlueprint] = useState<GeneratedBlueprint | null>(null);
  const [buildMeta, setBuildMeta] = useState<{ id: string; status: string; publicUrl: string | null } | null>(null);

  async function handleGenerate() {
    setLoading(true);
    setError(null);

    const response = await fetch("/api/ai/generate-portfolio", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ stylePrompt: prompt }),
    });

    const data = await response.json();
    setLoading(false);

    if (!response.ok) {
      setError(data.error ?? "Generation failed");
      return;
    }

    setBuildMeta({
      id: data.build?.id ?? "unknown",
      status: data.build?.status ?? "completed",
      publicUrl: data.publicUrl ?? null,
    });
    setBlueprint(data.blueprint);
  }

  return (
    <div className="page-card p-5 md:p-6">
      <div className="rounded-2xl border border-[var(--line)] bg-white/60 px-4 py-4">
        <p className="text-sm font-semibold tracking-[0.14em] uppercase text-[var(--brand-deep)]">Always kept constant</p>
        <div className="mt-3 space-y-2 text-sm text-[var(--muted)]">
          <p>Mobile-first structure with hero, trust layer, contact actions, and footer identity.</p>
          <p>No raw HTML, no scripts, no made-up achievements, and no broken accessibility contrast.</p>
          <p>WhatsApp, call, email, and website actions stay prioritized when those fields exist.</p>
        </div>
      </div>

      <label className="text-sm font-medium">
        Tell the AI how the portfolio should feel
        <textarea
          value={prompt}
          onChange={(event) => setPrompt(event.target.value)}
          className="mt-2 min-h-32 w-full rounded-2xl border border-[var(--line)] bg-white px-4 py-3 outline-none"
        />
      </label>

      <button
        type="button"
        onClick={handleGenerate}
        disabled={loading}
        className="mt-5 rounded-full bg-[var(--brand)] px-6 py-3 text-sm font-semibold text-white hover:bg-[var(--brand-deep)] disabled:opacity-60"
      >
        {loading ? "Generating..." : "Generate portfolio blueprint"}
      </button>

      {error ? <p className="mt-4 text-sm text-[var(--brand-deep)]">{error}</p> : null}

      {buildMeta ? (
        <div className="mt-4 page-card px-4 py-4 text-sm leading-6 text-[var(--muted)]">
          Build ID: <span className="font-semibold text-[var(--foreground)]">{buildMeta.id}</span>
          <br />
          Status: <span className="font-semibold text-[var(--foreground)]">{buildMeta.status}</span>
          <br />
          Public URL:{" "}
          {buildMeta.publicUrl ? (
            <a href={buildMeta.publicUrl} target="_blank" rel="noreferrer" className="font-semibold text-[var(--brand-deep)]">
              {buildMeta.publicUrl}
            </a>
          ) : (
            "Will appear after publishing"
          )}
        </div>
      ) : null}

      {blueprint ? (
        <div className="mt-6 space-y-4">
          <div className="page-card px-5 py-4">
            <p className="text-sm font-semibold tracking-[0.14em] uppercase text-[var(--brand-deep)]">
              {blueprint.theme} / {blueprint.layout_template}
            </p>
            <h3 className="mt-2 text-2xl font-semibold">{blueprint.hero.headline}</h3>
            <p className="mt-2 text-sm leading-6 text-[var(--muted)]">{blueprint.summary}</p>
            <p className="mt-3 text-xs uppercase tracking-[0.14em] text-[var(--muted)]">Source: {blueprint.source}</p>
          </div>

          <div className="grid gap-3 md:grid-cols-2">
            {blueprint.sections.map((section) => (
              <article key={`${section.type}-${section.title}`} className="page-card px-4 py-4">
                <h4 className="text-base font-semibold">{section.title}</h4>
                <div className="mt-2 space-y-2 text-sm text-[var(--muted)]">
                  {section.items.map((item) => (
                    <p key={item}>{item}</p>
                  ))}
                </div>
              </article>
            ))}
          </div>
        </div>
      ) : null}
    </div>
  );
}
