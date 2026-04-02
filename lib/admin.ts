import "server-only";
import { createHmac, randomUUID, scryptSync, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";

const ADMIN_COOKIE_NAME = "tapfolio_admin_session";
const ADMIN_SESSION_TTL_MS = 1000 * 60 * 60 * 8;

function getAdminPasswordSalt() {
  const value = process.env.ADMIN_PASSWORD_SALT;

  if (!value) {
    throw new Error("Missing ADMIN_PASSWORD_SALT");
  }

  return value;
}

function getAdminPasswordHash() {
  const value = process.env.ADMIN_PASSWORD_HASH;

  if (!value) {
    throw new Error("Missing ADMIN_PASSWORD_HASH");
  }

  return value;
}

function getAdminSessionSecret() {
  const value = process.env.ADMIN_SESSION_SECRET;

  if (!value) {
    throw new Error("Missing ADMIN_SESSION_SECRET");
  }

  return value;
}

function signAdminPayload(payload: string) {
  return createHmac("sha256", getAdminSessionSecret()).update(payload).digest("hex");
}

export function verifyAdminPassword(password: string) {
  const derivedHash = scryptSync(password, getAdminPasswordSalt(), 64).toString("hex");
  const expectedHash = getAdminPasswordHash();

  if (derivedHash.length !== expectedHash.length) {
    return false;
  }

  return timingSafeEqual(Buffer.from(derivedHash, "hex"), Buffer.from(expectedHash, "hex"));
}

export function createAdminSessionValue(userId: string) {
  const expiresAt = Date.now() + ADMIN_SESSION_TTL_MS;
  const nonce = randomUUID();
  const payload = `${userId}.${expiresAt}.${nonce}`;
  const signature = signAdminPayload(payload);
  return `${payload}.${signature}`;
}

export function verifyAdminSessionValue(value: string | undefined, userId: string) {
  if (!value) {
    return false;
  }

  const parts = value.split(".");

  if (parts.length < 4) {
    return false;
  }

  const [cookieUserId, expiresAtRaw, ...rest] = parts;
  const signature = rest.pop();
  const nonce = rest.join(".");

  if (!signature || cookieUserId !== userId) {
    return false;
  }

  const payload = `${cookieUserId}.${expiresAtRaw}.${nonce}`;
  const expectedSignature = signAdminPayload(payload);

  if (expectedSignature.length !== signature.length) {
    return false;
  }

  const expiresAt = Number(expiresAtRaw);

  if (!Number.isFinite(expiresAt) || expiresAt < Date.now()) {
    return false;
  }

  return timingSafeEqual(Buffer.from(expectedSignature), Buffer.from(signature));
}

export async function hasAdminSession(userId: string | null | undefined) {
  if (!userId) {
    return false;
  }

  const cookieStore = await cookies();
  const value = cookieStore.get(ADMIN_COOKIE_NAME)?.value;
  return verifyAdminSessionValue(value, userId);
}

export function getAdminCookieName() {
  return ADMIN_COOKIE_NAME;
}

export function getAdminCookieMaxAgeSeconds() {
  return Math.floor(ADMIN_SESSION_TTL_MS / 1000);
}
