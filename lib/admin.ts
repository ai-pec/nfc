const FALLBACK_ADMIN_EMAILS = ["pavitr.4444@gmail.com"];

export const ADMIN_EMAILS = (
  process.env.ADMIN_EMAILS?.split(",").map((value) => value.trim().toLowerCase()) ??
  FALLBACK_ADMIN_EMAILS
).filter(Boolean);

export function isAdminEmail(email: string | null | undefined) {
  if (!email) {
    return false;
  }

  return ADMIN_EMAILS.includes(email.trim().toLowerCase());
}
