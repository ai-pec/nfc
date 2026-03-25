"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { authClient } from "@/lib/auth-client";

export default function AuthCallbackPage() {
  const router = useRouter();

  useEffect(() => {
    let cancelled = false;

    async function finishSignIn() {
      const params = new URLSearchParams(window.location.search);
      const code = params.get("code");
      const tokenHash = params.get("token_hash");
      const authType = params.get("type");
      const nextPath = params.get("next") || "/dashboard";

      const recoveryPath = `/auth/sign-in?next=${encodeURIComponent(nextPath)}`;

      if (!code && !(tokenHash && authType)) {
        router.replace(recoveryPath);
        return;
      }

      const { error } = code
        ? await authClient.auth.exchangeCodeForSession(code)
        : await authClient.auth.verifyOtp({
            token_hash: tokenHash!,
            type: authType as "signup" | "recovery" | "email_change" | "invite" | "magiclink",
          });

      if (cancelled) {
        return;
      }

      if (error) {
        router.replace(recoveryPath);
        return;
      }

      router.replace(nextPath);
      router.refresh();
    }

    finishSignIn().catch(() => {
      if (!cancelled) {
        router.replace("/login");
      }
    });

    return () => {
      cancelled = true;
    };
  }, [router]);

  return (
    <main className="section-shell page-hero flex-1">
      <section className="mx-auto max-w-2xl glass-panel rounded-[2rem] p-6 md:p-8">
        <h1 className="text-3xl font-semibold tracking-tight md:text-4xl">Completing sign-in...</h1>
        <p className="mt-4 text-base leading-7 text-[var(--muted)]">
          Please wait while we finish your Google authentication.
        </p>
      </section>
    </main>
  );
}
