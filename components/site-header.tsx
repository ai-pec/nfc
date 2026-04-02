import Link from "next/link";
import { SignOutButton } from "@/components/sign-out-button";
import { hasAdminSession } from "@/lib/admin";
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
  const adminUnlocked = await hasAdminSession(appUser?.uid);

  return (
    <header className="section-shell relative z-20 pt-6 md:pt-8">
      <div className="glass-panel flex items-center justify-between rounded-[1.75rem] px-5 py-3 md:px-6">
        <Link href="/" className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-full bg-[#16110d] text-sm font-semibold tracking-[0.12em] text-[#fff7f1]">
            TF
          </div>
          <div>
            <p className="text-sm font-semibold tracking-[0.18em] uppercase text-[#16110d]">Tapfolio</p>
            <p className="text-xs text-[#6f6259]">NFC identity system</p>
          </div>
        </Link>

        <nav className="hidden items-center gap-6 text-sm font-medium text-[#6f6259] md:flex">
          {navigation.map((item) => (
            <Link key={item.href} href={item.href} className="transition-colors hover:text-[#16110d]">
              {item.label}
            </Link>
          ))}
          {isAuthenticated ? (
            <>
              <Link href="/dashboard" className="transition-colors hover:text-[#16110d]">
                Dashboard
              </Link>
              <Link href="/profile" className="transition-colors hover:text-[#16110d]">
                Profile
              </Link>
              {adminUnlocked ? (
                <Link href="/admin" className="transition-colors hover:text-[#16110d]">
                  Admin
                </Link>
              ) : null}
            </>
          ) : null}
        </nav>

        <div className="flex items-center gap-3">
          {isAuthenticated ? (
            <>
              <div className="hidden rounded-full border border-[rgba(109,87,74,0.18)] bg-white/70 px-4 py-2 text-right md:block">
                <p className="text-[11px] font-semibold tracking-[0.16em] uppercase text-[#7e3110]">
                  Signed in
                </p>
                <p className="text-sm font-semibold text-[#16110d]">
                  {session?.user.name ?? appUser?.name ?? "Workspace"}
                </p>
              </div>
              <SignOutButton />
            </>
          ) : (
            <>
              <Link
                href="/login"
                className="hidden rounded-full px-4 py-2 text-sm font-semibold md:inline-flex"
                style={{ backgroundColor: "white", color: "#16110d", border: "1px solid rgba(109,87,74,0.18)" }}
              >
                Sign in
              </Link>
              <Link
                href="/signup"
                className="rounded-full px-4 py-2 text-sm font-semibold transition-colors"
                style={{ backgroundColor: "#bc5a2d", color: "white" }}
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
