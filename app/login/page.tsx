import { AuthForm } from "@/components/auth-form";
import { getAuthSession } from "@/lib/auth-server";
import { redirect } from "next/navigation";

type LoginPageProps = {
  searchParams?: Promise<{
    next?: string;
    error?: string;
  }>;
};

const errorMessages: Record<string, string> = {
  auth_failed: "Authentication failed. Please try again.",
  verification_failed: "Email verification failed. Please request a new link.",
  session_expired: "Your session has expired. Please sign in again.",
  user_not_found: "No account found with this email. Please create a new account first.",
};

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const params = await searchParams;
  const nextPath = params?.next ?? "/dashboard";
  const errorCode = params?.error;
  const session = await getAuthSession();

  if (session?.user) {
    redirect(nextPath);
  }

  return (
    <main className="section-shell page-hero flex-1">
      <section className="mx-auto max-w-2xl glass-panel rounded-[2rem] p-6 md:p-8">
        <span className="eyebrow inline-flex rounded-full px-3 py-1 text-xs font-semibold tracking-[0.18em] uppercase">
          Sign in
        </span>
        <h1 className="mt-5 text-4xl font-semibold tracking-tight md:text-5xl">Access your NFC profile workspace</h1>
        <p className="mt-4 text-base leading-7 text-[var(--muted)]">
          Sign in to manage your hosted profile, update your portfolio, and use the AI studio.
        </p>
        {errorCode && errorMessages[errorCode] ? (
          <div className="mt-4 rounded-xl bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
            {errorMessages[errorCode]}
          </div>
        ) : null}
        <div className="mt-6">
          <AuthForm mode="login" nextPath={nextPath} />
        </div>
      </section>
    </main>
  );
}
