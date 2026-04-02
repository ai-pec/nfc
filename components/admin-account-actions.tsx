"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

type AdminAccountActionsProps = {
  uid: string;
  sitePaused: boolean;
  buildId?: string | null;
  adminReviewStatus?: string | null;
};

export function AdminAccountActions({ uid, sitePaused, buildId, adminReviewStatus }: AdminAccountActionsProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function toggleFreeze() {
    setLoading(true);
    const response = await fetch(`/api/admin/accounts/${uid}/toggle-freeze`, {
      method: "POST",
    });
    setLoading(false);

    if (!response.ok) {
      return;
    }

    router.refresh();
  }

  async function reviewBuild(action: "approved" | "rejected" | "needs_revision") {
    if (!buildId) {
      return;
    }

    setLoading(true);
    const response = await fetch(`/api/admin/builds/${buildId}/review`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ action }),
    });
    setLoading(false);

    if (!response.ok) {
      return;
    }

    router.refresh();
  }

  return (
    <div className="mt-3 flex flex-wrap gap-2">
      <button
        type="button"
        onClick={toggleFreeze}
        disabled={loading}
        className="rounded-full border border-[var(--line)] px-4 py-2 text-xs font-semibold disabled:opacity-60"
      >
        {loading ? "Updating..." : sitePaused ? "Unfreeze site" : "Freeze site"}
      </button>

      {buildId ? (
        <>
          <button
            type="button"
            onClick={() => reviewBuild("approved")}
            disabled={loading}
            className="rounded-full border border-[rgba(36,91,69,0.24)] bg-[rgba(36,91,69,0.08)] px-4 py-2 text-xs font-semibold text-[var(--success)] disabled:opacity-60"
          >
            Approve build
          </button>
          <button
            type="button"
            onClick={() => reviewBuild("needs_revision")}
            disabled={loading}
            className="rounded-full border border-[var(--line)] bg-white/70 px-4 py-2 text-xs font-semibold disabled:opacity-60"
          >
            Request revision
          </button>
          <button
            type="button"
            onClick={() => reviewBuild("rejected")}
            disabled={loading}
            className="rounded-full border border-[rgba(126,49,16,0.2)] bg-[rgba(126,49,16,0.08)] px-4 py-2 text-xs font-semibold text-[var(--brand-deep)] disabled:opacity-60"
          >
            Reject build
          </button>
        </>
      ) : null}

      {adminReviewStatus ? <span className="px-2 py-2 text-[11px] font-semibold uppercase tracking-[0.14em] text-[var(--muted)]">{adminReviewStatus}</span> : null}
    </div>
  );
}
