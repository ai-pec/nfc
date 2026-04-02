"use client";

import { getAuthClient } from "@/lib/auth-client";

export function SignOutButton() {
  return (
    <button
      type="button"
      onClick={async () => {
        await fetch("/api/admin/session", {
          method: "DELETE",
        });
        await getAuthClient().auth.signOut();
        window.location.href = "/";
      }}
      className="rounded-full px-4 py-2 text-sm font-semibold transition-colors"
      style={{ backgroundColor: "white", color: "#16110d", border: "1px solid rgba(109,87,74,0.25)" }}
    >
      Sign out
    </button>
  );
}
