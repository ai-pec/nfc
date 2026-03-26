import Link from "next/link";
import { SignOutButton } from "@/components/sign-out-button";
import { getAuthSession, getCurrentAppUser } from "@/lib/auth-server";

const navigation = [
  { href: "/", label: "Home" },
  { href: "/about", label: "About" },
  { href: "/buy", label: "Buy" },
  { href: "/contact", label: "Contact" },
];

export async function SiteHeader() {
  const session = await getAuthSession();
  const appUser = session ? await getCurrentAppUser() : null;
  const isAuthenticated = Boolean(session?.user);

  return (
    <header className="section-shell relative z-20 pt-6 md:pt-8">
      <div className="glass-panel flex items-center justify-between rounded-[1.75rem] px-5 py-3 md:px-6">
        <Link href="/" className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-full bg-[var(--foreground)] text-sm font-semibold tracking-[0.12em] text-[var(--surface-strong)]">
            TF
          </div>
          <div>
            <p className="text-sm font-semibold tracking-[0.18em] uppercase">Tapfolio</p>
            <p className="text-xs text-[var(--muted)]">NFC identity system</p>
          </div>
        </Link>

        <nav className="hidden items-center gap-6 text-sm font-medium text-[var(--muted)] md:flex">
          {navigation.map((item) => (
            <Link key={item.href} href={item.href} className="transition-colors hover:text-[var(--foreground)]">
              {item.label}
            </Link>
          ))}
          {isAuthenticated ? (
            <>
              <Link href="/dashboard" className="transition-colors hover:text-[var(--foreground)]">
                Dashboard
              </Link>
              <Link href="/profile" className="transition-colors hover:text-[var(--foreground)]">
                Profile
              </Link>
              {appUser?.role === "admin" ? (
                <Link href="/admin" className="transition-colors hover:text-[var(--foreground)]">
                  Admin
                </Link>
              ) : null}
            </>
          ) : null}
        </nav>

        <div className="flex items-center gap-3">
          {isAuthenticated ? (
            <>
              <div className="hidden rounded-full border border-[var(--line)] bg-white/70 px-4 py-2 text-right md:block">
                <p className="text-[11px] font-semibold tracking-[0.16em] uppercase text-[var(--brand-deep)]">
                  Signed in
                </p>
                <p className="text-sm font-semibold text-[var(--foreground)]">
                  {session?.user.name ?? appUser?.name ?? "Workspace"}
                </p>
              </div>
              <SignOutButton />
            </>
          ) : (
            <>
              <Link
                href="/login"
                className="hidden rounded-full border border-[var(--line)] px-4 py-2 text-sm font-semibold md:inline-flex"
              >
                Sign in
              </Link>
              <Link
                href="/signup"
                className="rounded-full bg-[var(--foreground)] px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-[var(--brand-deep)]"
              >
                Create account
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
