import { NextResponse, type NextRequest } from "next/server";
import { getCurrentAppUser, requireAuth } from "@/lib/auth-server";
import {
  createAdminSessionValue,
  getAdminCookieMaxAgeSeconds,
  getAdminCookieName,
  verifyAdminPassword,
} from "@/lib/admin";

export async function POST(request: NextRequest) {
  await requireAuth();
  const appUser = await getCurrentAppUser();

  if (!appUser?.uid) {
    return NextResponse.json({ error: "App user not found" }, { status: 404 });
  }

  const body = await request.json();
  const password = typeof body.password === "string" ? body.password : "";

  if (!verifyAdminPassword(password)) {
    return NextResponse.json({ error: "Incorrect admin password" }, { status: 401 });
  }

  const response = NextResponse.json({ ok: true });
  response.cookies.set(getAdminCookieName(), createAdminSessionValue(appUser.uid), {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: getAdminCookieMaxAgeSeconds(),
  });

  return response;
}

export async function DELETE() {
  const response = NextResponse.json({ ok: true });
  response.cookies.set(getAdminCookieName(), "", {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 0,
  });
  return response;
}
