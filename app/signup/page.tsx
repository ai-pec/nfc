import { AuthForm } from "@/components/auth-form";
import { getAuthSession } from "@/lib/auth-server";
import { redirect } from "next/navigation";

type SignupPageProps = {
  searchParams?: Promise<{
    next?: string;
  }>;
};

export default async function SignupPage({ searchParams }: SignupPageProps) {
  const params = await searchParams;
  const nextPath = params?.next ?? "/onboarding";
  const session = await getAuthSession();

  if (session?.user) {
    redirect(nextPath);
  }

  return (
    <main className="section-shell page-hero flex-1">
      <section className="mx-auto max-w-2xl glass-panel rounded-[2rem] p-6 md:p-8">
        <span className="eyebrow inline-flex rounded-full px-3 py-1 text-xs font-semibold tracking-[0.18em] uppercase">
          Create account
        </span>
        <h1 className="mt-5 text-4xl font-semibold tracking-tight md:text-5xl">Start your NFC portfolio workspace</h1>
        <p className="mt-4 text-base leading-7 text-[var(--muted)]">
          Your account will create a synced app profile, reserve a hosted portfolio row, and unlock the AI-assisted
          setup flow.
        </p>
        <div className="mt-6">
          <AuthForm mode="signup" nextPath={nextPath} />
        </div>
      </section>
    </main>
  );
}
