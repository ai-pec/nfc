"use client";

import { FormEvent, useState } from "react";
import { resolveOAuthAppOrigin } from "@/lib/auth-cookie";
import { getAuthClient } from "@/lib/auth-client";

type AuthMode = "sign-in" | "sign-up" | "login" | "signup";

type AuthFormProps = {
  mode: AuthMode;
  nextPath?: string;
};

function GoogleIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
        fill="#4285F4"
      />
      <path
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
        fill="#34A853"
      />
      <path
        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
        fill="#FBBC05"
      />
      <path
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
        fill="#EA4335"
      />
    </svg>
  );
}

export function AuthForm({ mode, nextPath }: AuthFormProps) {
  const normalizedMode = mode === "login" ? "sign-in" : mode === "signup" ? "sign-up" : mode;
  const redirectPath = nextPath ?? (normalizedMode === "sign-in" ? "/dashboard" : "/onboarding");
  const [pending, setPending] = useState(false);
  const [googlePending, setGooglePending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);

  const isAnyPending = pending || googlePending;

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPending(true);
    setError(null);
    setInfo(null);

    const formData = new FormData(event.currentTarget);
    const email = String(formData.get("email") ?? "");
    const password = String(formData.get("password") ?? "");
    const name = String(formData.get("name") ?? "");

    try {
      const endpoint = normalizedMode === "sign-up" ? "/api/auth/sign-up" : "/api/auth/sign-in";
      const response = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password, name, nextPath: redirectPath }),
      });
      const result = await response.json();

      if (!response.ok) {
        setPending(false);
        setError(result.error ?? "Authentication failed");
        return;
      }

      if (normalizedMode === "sign-up" && result.needsEmailConfirmation) {
        setPending(false);
        setInfo("Account created. Please check your email and open the confirmation link to finish sign-in.");
        return;
      }

      window.location.assign(redirectPath);
    } catch {
      setPending(false);
      setError("Network error. Please check your connection and try again.");
    }
  }

  async function handleGoogleAuth() {
    setGooglePending(true);
    setError(null);
    setInfo(null);

    try {
      const callbackOrigin = resolveOAuthAppOrigin(window.location.origin);
      const callbackURL = `${callbackOrigin}/auth/callback?next=${encodeURIComponent(redirectPath)}&mode=${normalizedMode}`;

      const result = await getAuthClient().auth.signInWithOAuth({
        provider: "google",
        options: { redirectTo: callbackURL },
      });

      if (result.error) {
        setGooglePending(false);
        setError(result.error.message ?? "Google authentication failed.");
        return;
      }

      if (result.data?.url) {
        window.location.href = result.data.url;
      } else {
        setGooglePending(false);
        setError("Failed to initiate Google sign-in.");
      }
    } catch {
      setGooglePending(false);
      setError("Failed to connect to Google.");
    }
  }

  return (
    <form onSubmit={handleSubmit} className="page-card p-5 md:p-6">
      <div className="space-y-4">
        {normalizedMode === "sign-up" ? (
          <label className="block text-sm font-medium" style={{ color: "#16110d" }}>
            Full name
            <input
              name="name"
              required
              disabled={isAnyPending}
              className="mt-2 w-full rounded-2xl px-4 py-3 outline-none disabled:opacity-60"
              style={{ backgroundColor: "white", border: "1px solid rgba(109,87,74,0.18)" }}
            />
          </label>
        ) : null}

        <label className="block text-sm font-medium" style={{ color: "#16110d" }}>
          Email
          <input
            type="email"
            name="email"
            required
            disabled={isAnyPending}
            className="mt-2 w-full rounded-2xl px-4 py-3 outline-none disabled:opacity-60"
            style={{ backgroundColor: "white", border: "1px solid rgba(109,87,74,0.18)" }}
          />
        </label>

        <label className="block text-sm font-medium" style={{ color: "#16110d" }}>
          Password
          <input
            type="password"
            name="password"
            required
            minLength={8}
            disabled={isAnyPending}
            className="mt-2 w-full rounded-2xl px-4 py-3 outline-none disabled:opacity-60"
            style={{ backgroundColor: "white", border: "1px solid rgba(109,87,74,0.18)" }}
          />
        </label>
      </div>

      {error ? <p className="mt-4 text-sm" style={{ color: "#c53030" }}>{error}</p> : null}
      {info ? <p className="mt-4 text-sm" style={{ color: "#6f6259" }}>{info}</p> : null}

      <button
        type="submit"
        disabled={isAnyPending}
        className="mt-5 w-full rounded-full px-6 py-3 text-sm font-semibold disabled:opacity-60"
        style={{ backgroundColor: "#bc5a2d", color: "white" }}
      >
        {pending ? "Please wait..." : normalizedMode === "sign-up" ? "Create account" : "Sign in"}
      </button>

      <div className="relative my-4">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full" style={{ borderTop: "1px solid rgba(109,87,74,0.18)" }} />
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span style={{ backgroundColor: "white", padding: "0 8px", color: "#6f6259" }}>or continue with</span>
        </div>
      </div>

      <button
        type="button"
        disabled={isAnyPending}
        onClick={handleGoogleAuth}
        className="flex w-full items-center justify-center gap-3 rounded-full px-6 py-3 text-sm font-semibold disabled:opacity-60"
        style={{ backgroundColor: "white", color: "#16110d", border: "1px solid rgba(109,87,74,0.18)" }}
      >
        {googlePending ? (
          <>
            <span className="h-5 w-5 animate-spin rounded-full" style={{ border: "2px solid #ddd", borderTopColor: "#bc5a2d" }} />
            Connecting to Google...
          </>
        ) : (
          <>
            <GoogleIcon className="h-5 w-5" />
            {normalizedMode === "sign-up" ? "Sign up with Google" : "Sign in with Google"}
          </>
        )}
      </button>

      <p className="mt-4 text-center text-sm" style={{ color: "#6f6259" }}>
        {normalizedMode === "sign-up" ? (
          <>
            Already have an account?{" "}
            <a href="/login" style={{ color: "#7e3110", fontWeight: 500 }}>Sign in</a>
          </>
        ) : (
          <>
            Don&apos;t have an account?{" "}
            <a href="/signup" style={{ color: "#7e3110", fontWeight: 500 }}>Create one</a>
          </>
        )}
      </p>
    </form>
  );
}
