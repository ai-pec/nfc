"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { supabaseConfig } from "@/lib/supabase-config";
import { authClient } from "@/lib/auth-client";

type AuthMode = "sign-in" | "sign-up" | "login" | "signup";

type AuthFormProps = {
  mode: AuthMode;
  nextPath?: string;
};

export function AuthForm({ mode, nextPath }: AuthFormProps) {
  const normalizedMode = mode === "login" ? "sign-in" : mode === "signup" ? "sign-up" : mode;
  const router = useRouter();
  const redirectPath = nextPath ?? (normalizedMode === "sign-in" ? "/dashboard" : "/onboarding");
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPending(true);
    setError(null);
    setInfo(null);

    const formData = new FormData(event.currentTarget);
    const email = String(formData.get("email") ?? "");
    const password = String(formData.get("password") ?? "");
    const name = String(formData.get("name") ?? "");

    const result =
      normalizedMode === "sign-up"
        ? await authClient.auth.signUp({
            email,
            password,
            options: {
              data: {
                name,
                full_name: name,
              },
              emailRedirectTo: `${window.location.origin}/auth/callback?next=${encodeURIComponent(redirectPath)}`,
            },
          })
        : await authClient.auth.signInWithPassword({
            email,
            password,
          });

    setPending(false);

    if (result.error) {
      setError(result.error.message ?? "Authentication failed");
      return;
    }

    if (normalizedMode === "sign-up" && !result.data.session) {
      setInfo("Account created. Please check your email and open the confirmation link to finish sign-in.");
      return;
    }

    router.replace(redirectPath);
    router.refresh();
  }

  async function handleGoogleAuth() {
    setPending(true);
    setError(null);
    setInfo(null);

    const origin = window.location.origin;
    const callbackURL = `${origin}/auth/callback?next=${encodeURIComponent(redirectPath)}`;

    const result = await authClient.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: callbackURL,
        queryParams: {
          access_type: "offline",
          prompt: "consent",
        },
      },
    });

    if (result.error) {
      setPending(false);
      setError(result.error.message ?? "Google authentication failed");
      return;
    }

    const expectedPrefix = `${supabaseConfig.url}/auth/v1/authorize`;
    if (result.data?.url && !result.data.url.startsWith(expectedPrefix)) {
      setPending(false);
      setError("Google authentication URL is invalid. Check Supabase project settings.");
    }
  }

  return (
    <form onSubmit={handleSubmit} className="page-card p-5 md:p-6">
      <div className="space-y-4">
        {normalizedMode === "sign-up" ? (
          <label className="block text-sm font-medium">
            Full name
            <input
              name="name"
              required
              className="mt-2 w-full rounded-2xl border border-[var(--line)] bg-white px-4 py-3 outline-none"
            />
          </label>
        ) : null}

        <label className="block text-sm font-medium">
          Email
          <input
            type="email"
            name="email"
            required
            className="mt-2 w-full rounded-2xl border border-[var(--line)] bg-white px-4 py-3 outline-none"
          />
        </label>

        <label className="block text-sm font-medium">
          Password
          <input
            type="password"
            name="password"
            required
            minLength={8}
            className="mt-2 w-full rounded-2xl border border-[var(--line)] bg-white px-4 py-3 outline-none"
          />
        </label>
      </div>

      {error ? <p className="mt-4 text-sm text-[var(--brand-deep)]">{error}</p> : null}
      {info ? <p className="mt-4 text-sm text-[var(--muted)]">{info}</p> : null}

      <button
        type="submit"
        disabled={pending}
        className="mt-5 rounded-full bg-[var(--brand)] px-6 py-3 text-sm font-semibold text-white hover:bg-[var(--brand-deep)] disabled:opacity-60"
      >
        {pending ? "Please wait..." : normalizedMode === "sign-up" ? "Create account" : "Sign in"}
      </button>

      <button
        type="button"
        disabled={pending}
        onClick={handleGoogleAuth}
        className="mt-3 rounded-full border border-[var(--line)] bg-white px-6 py-3 text-sm font-semibold text-[var(--foreground)] hover:bg-white/80 disabled:opacity-60"
      >
        {pending
          ? "Please wait..."
          : normalizedMode === "sign-up"
            ? "Sign up with Google"
            : "Sign in with Google"}
      </button>
    </form>
  );
}
