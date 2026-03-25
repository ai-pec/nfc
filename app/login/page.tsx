import { AuthForm } from "@/components/auth-form";

type LoginPageProps = {
  searchParams?: Promise<{
    next?: string;
  }>;
};

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const params = await searchParams;
  const nextPath = params?.next ?? "/dashboard";

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
        <div className="mt-6">
          <AuthForm mode="login" nextPath={nextPath} />
        </div>
      </section>
    </main>
  );
}
