"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export function AdminLockButton() {
  const router = useRouter();
  const [pending, setPending] = useState(false);

  async function handleLock() {
    setPending(true);
    await fetch("/api/admin/session", {
      method: "DELETE",
    });
    setPending(false);
    router.refresh();
  }

  return (
    <button
      type="button"
      onClick={handleLock}
      disabled={pending}
      className="rounded-full border border-[var(--line)] bg-white/80 px-4 py-2 text-sm font-semibold transition-colors hover:bg-white disabled:opacity-60"
    >
      {pending ? "Locking..." : "Lock admin"}
    </button>
  );
}
