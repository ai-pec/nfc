"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

type PortfolioPublishControlsProps = {
  published: boolean;
  sitePaused: boolean;
};

export function PortfolioPublishControls({ published, sitePaused }: PortfolioPublishControlsProps) {
  const router = useRouter();
  const [loading, setLoading] = useState<"publish" | "pause" | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function post(url: string, loadingKey: "publish" | "pause") {
    setLoading(loadingKey);
    setError(null);

    const response = await fetch(url, {
      method: "POST",
    });

    setLoading(null);

    if (!response.ok) {
      const data = await response.json().catch(() => null);
      setError(data?.error ?? "Action failed");
      return;
    }

    router.refresh();
  }

  return (
    <div>
      <div className="flex flex-wrap gap-3">
        <button
          type="button"
          onClick={() => post("/api/portfolio/publish", "publish")}
          disabled={loading !== null}
          className="rounded-full bg-[var(--brand)] px-5 py-3 text-sm font-semibold text-white disabled:opacity-60"
        >
          {loading === "publish" ? "Saving..." : published ? "Update published site" : "Publish portfolio"}
        </button>

        <button
          type="button"
          onClick={() => post("/api/portfolio/toggle-pause", "pause")}
          disabled={loading !== null || !published}
          className="rounded-full border border-[var(--line)] px-5 py-3 text-sm font-semibold disabled:opacity-60"
        >
          {loading === "pause" ? "Updating..." : sitePaused ? "Resume site" : "Pause site"}
        </button>
      </div>

      {error ? <p className="mt-3 text-sm text-[var(--brand-deep)]">{error}</p> : null}
    </div>
  );
}
