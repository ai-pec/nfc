"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

type AdminAccountActionsProps = {
  uid: string;
  sitePaused: boolean;
};

export function AdminAccountActions({ uid, sitePaused }: AdminAccountActionsProps) {
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

  return (
    <button
      type="button"
      onClick={toggleFreeze}
      disabled={loading}
      className="mt-3 rounded-full border border-[var(--line)] px-4 py-2 text-xs font-semibold disabled:opacity-60"
    >
      {loading ? "Updating..." : sitePaused ? "Unfreeze site" : "Freeze site"}
    </button>
  );
}
