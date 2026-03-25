import Link from "next/link";

const productLinks = [
  { href: "/about", label: "About us" },
  { href: "/buy", label: "Buy card" },
  { href: "/contact", label: "Contact us" },
  { href: "/onboarding", label: "Claim flow" },
];

const policyLinks = [
  { href: "/return-policy", label: "Return policy" },
  { href: "/replacement-policy", label: "Replacement policy" },
  { href: "/privacy-policy", label: "Privacy policy" },
  { href: "/terms", label: "Terms" },
];

export function SiteFooter() {
  return (
    <footer className="section-shell mt-16 pb-10">
      <div className="glass-panel rounded-[2rem] px-6 py-8 md:px-8">
        <div className="grid gap-8 md:grid-cols-[1.2fr_0.8fr_0.8fr]">
          <div>
            <p className="text-sm font-semibold tracking-[0.18em] uppercase text-[var(--brand-deep)]">Tapfolio</p>
            <h2 className="mt-4 max-w-md text-3xl font-semibold leading-tight">
              NFC cards that open a profile, portfolio, and contact flow in one touch.
            </h2>
            <p className="mt-4 max-w-xl text-sm leading-7 text-[var(--muted)]">
              Built for founders, creators, consultants, and teams who want a cleaner replacement for paper cards and
              scattered profile links.
            </p>
          </div>

          <div>
            <p className="text-sm font-semibold tracking-[0.14em] uppercase text-[var(--brand-deep)]">Pages</p>
            <div className="mt-4 flex flex-col gap-3 text-sm text-[var(--muted)]">
              {productLinks.map((link) => (
                <Link key={link.href} href={link.href} className="transition-colors hover:text-[var(--foreground)]">
                  {link.label}
                </Link>
              ))}
            </div>
          </div>

          <div>
            <p className="text-sm font-semibold tracking-[0.14em] uppercase text-[var(--brand-deep)]">Policies</p>
            <div className="mt-4 flex flex-col gap-3 text-sm text-[var(--muted)]">
              {policyLinks.map((link) => (
                <Link key={link.href} href={link.href} className="transition-colors hover:text-[var(--foreground)]">
                  {link.label}
                </Link>
              ))}
              <Link href="/admin" className="pt-3 text-xs uppercase tracking-[0.16em] text-[var(--muted)]/80">
                Admin access
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
