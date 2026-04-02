"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";

export function AdminUnlockForm() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPending(true);
    setError(null);

    const response = await fetch("/api/admin/session", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ password }),
    });

    const data = await response.json();
    setPending(false);

    if (!response.ok) {
      setError(data.error ?? "Unable to unlock admin access");
      return;
    }

    setPassword("");
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="page-card px-5 py-5 md:px-6">
      <p className="text-xs font-semibold tracking-[0.16em] uppercase text-[var(--brand-deep)]">Admin unlock</p>
      <h2 className="mt-3 text-3xl font-semibold tracking-tight">Enter the operations password</h2>
      <p className="mt-3 text-sm leading-7 text-[var(--muted)]">
        Admin access is no longer attached to any user account. A separate password is required each time you unlock
        the moderation workspace.
      </p>

      <label className="mt-5 block text-sm font-medium">
        Admin password
        <input
          type="password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          required
          className="mt-2 w-full rounded-2xl border border-[var(--line)] bg-white px-4 py-3 outline-none"
        />
      </label>

      {error ? <p className="mt-4 text-sm text-[var(--brand-deep)]">{error}</p> : null}

      <button
        type="submit"
        disabled={pending}
        className="mt-5 rounded-full bg-[var(--brand)] px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-[var(--brand-deep)] disabled:opacity-60"
      >
        {pending ? "Unlocking..." : "Unlock admin workspace"}
      </button>
    </form>
  );
}
