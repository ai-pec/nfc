import Link from "next/link";
import { AuthForm } from "@/components/auth-form";

type SignInPageProps = {
  searchParams?: Promise<{
    next?: string;
  }>;
};

export default async function SignInPage({ searchParams }: SignInPageProps) {
  const params = await searchParams;
  const nextPath = params?.next ?? "/dashboard";

  return (
    <main className="section-shell page-hero flex-1">
      <section className="glass-panel mx-auto max-w-4xl rounded-[2rem] p-6 md:p-8">
        <span className="eyebrow inline-flex rounded-full px-3 py-1 text-xs font-semibold tracking-[0.18em] uppercase">
          Account access
        </span>
        <div className="mt-5 grid gap-8 lg:grid-cols-[0.9fr_1.1fr]">
          <div>
            <h1 className="text-4xl font-semibold tracking-tight md:text-5xl">Sign in to manage your NFC profile</h1>
            <p className="mt-5 text-base leading-7 text-[var(--muted)]">
              Once authenticated, users can edit their profile flow and admins can access protected moderation tools.
            </p>
            <p className="mt-4 text-sm text-[var(--muted)]">
              Need an account?{" "}
              <Link href="/auth/sign-up" className="font-semibold text-[var(--brand-deep)]">
                Create one here
              </Link>
            </p>
          </div>

          <AuthForm mode="sign-in" nextPath={nextPath} />
        </div>
      </section>
    </main>
  );
}
