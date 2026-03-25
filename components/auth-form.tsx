"use client";

import { FormEvent, useState } from "react";
import { authClient } from "@/lib/auth-client";

type AuthMode = "sign-in" | "sign-up" | "login" | "signup";

type AuthFormProps = {
  mode: AuthMode;
  nextPath?: string;
};

export function AuthForm({ mode, nextPath }: AuthFormProps) {
  const normalizedMode = mode === "login" ? "sign-in" : mode === "signup" ? "sign-up" : mode;
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

    const endpoint = normalizedMode === "sign-up" ? "/api/auth/sign-up" : "/api/auth/sign-in";
    const response = await fetch(endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email,
        password,
        name,
        nextPath: redirectPath,
      }),
    });
    const result = await response.json();

    setPending(false);

    if (!response.ok) {
      setError(result.error ?? "Authentication failed");
      return;
    }

    if (normalizedMode === "sign-up" && result.needsEmailConfirmation) {
      setInfo("Account created. Please check your email and open the confirmation link to finish sign-in.");
      return;
    }

    window.location.assign(redirectPath);
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

    if (result.data?.url) {
      window.location.assign(result.data.url);
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
