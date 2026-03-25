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
      const nextPath = params.get("next") || "/dashboard";

      if (!code) {
        router.replace(`/login?next=${encodeURIComponent(nextPath)}`);
        return;
      }

      const { error } = await authClient.auth.exchangeCodeForSession(code);

      if (cancelled) {
        return;
      }

      if (error) {
        router.replace(`/login?next=${encodeURIComponent(nextPath)}`);
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
