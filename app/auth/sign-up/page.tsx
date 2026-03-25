import Link from "next/link";
import { AuthForm } from "@/components/auth-form";
import { getAuthSession } from "@/lib/auth-server";
import { redirect } from "next/navigation";

type SignUpPageProps = {
  searchParams?: Promise<{
    next?: string;
  }>;
};

export default async function SignUpPage({ searchParams }: SignUpPageProps) {
  const params = await searchParams;
  const nextPath = params?.next ?? "/onboarding";
  const session = await getAuthSession();

  if (session?.user) {
    redirect(nextPath);
  }

  return (
    <main className="section-shell page-hero flex-1">
      <section className="glass-panel mx-auto max-w-4xl rounded-[2rem] p-6 md:p-8">
        <span className="eyebrow inline-flex rounded-full px-3 py-1 text-xs font-semibold tracking-[0.18em] uppercase">
          Create account
        </span>
        <div className="mt-5 grid gap-8 lg:grid-cols-[0.9fr_1.1fr]">
          <div>
            <h1 className="text-4xl font-semibold tracking-tight md:text-5xl">Start your hosted NFC portfolio</h1>
            <p className="mt-5 text-base leading-7 text-[var(--muted)]">
              Sign-up now creates the auth identity and also seeds your core portfolio record so onboarding can continue
              directly into the claim flow.
            </p>
            <p className="mt-4 text-sm text-[var(--muted)]">
              Already registered?{" "}
              <Link href="/auth/sign-in" className="font-semibold text-[var(--brand-deep)]">
                Sign in instead
              </Link>
            </p>
          </div>

          <AuthForm mode="sign-up" nextPath={nextPath} />
        </div>
      </section>
    </main>
  );
}
