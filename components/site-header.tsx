import Link from "next/link";

const navigation = [
  { href: "/", label: "Home" },
  { href: "/about", label: "About" },
  { href: "/buy", label: "Buy" },
  { href: "/contact", label: "Contact" },
];

export function SiteHeader() {
  return (
    <header className="section-shell relative z-20 pt-6 md:pt-8">
      <div className="glass-panel flex items-center justify-between rounded-full px-5 py-3">
        <Link href="/" className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-full bg-[var(--foreground)] text-sm font-semibold text-[var(--surface-strong)]">
            NFC
          </div>
          <div>
            <p className="text-sm font-semibold tracking-[0.18em] uppercase">Tapfolio</p>
            <p className="text-xs text-[var(--muted)]">Digital profile cards</p>
          </div>
        </Link>

        <nav className="hidden items-center gap-6 text-sm text-[var(--muted)] md:flex">
          {navigation.map((item) => (
            <Link key={item.href} href={item.href} className="transition-colors hover:text-[var(--foreground)]">
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-3">
          <Link
            href="/login"
            className="hidden rounded-full border border-[var(--line)] px-4 py-2 text-sm font-semibold md:inline-flex"
          >
            Sign in
          </Link>
          <Link
            href="/signup"
            className="rounded-full bg-[var(--brand)] px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-[var(--brand-deep)]"
          >
            Get started
          </Link>
        </div>
      </div>
    </header>
  );
}
