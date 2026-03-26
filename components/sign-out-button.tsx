"use client";

import { authClient } from "@/lib/auth-client";

export function SignOutButton() {
  return (
    <button
      type="button"
      onClick={async () => {
        await authClient.auth.signOut();
        window.location.href = "/";
      }}
      className="rounded-full border border-[var(--line)] bg-white/80 px-4 py-2 text-sm font-semibold transition-colors hover:bg-white"
    >
      Sign out
    </button>
  );
}
