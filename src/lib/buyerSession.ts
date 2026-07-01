import { NextResponse } from "next/server";

export function cookieName(username: string): string {
  return `chatfi_buyer_${username}`;
}

export function setBuyerCookie(response: NextResponse, username: string, token: string) {
  response.cookies.set(cookieName(username), token, {
    httpOnly: true,
    secure: true,
    sameSite: "lax",
    path: "/",
    maxAge: 30 * 24 * 60 * 60, // 30 days
  });
}

export function clearBuyerCookie(response: NextResponse, username: string) {
  response.cookies.set(cookieName(username), "", {
    httpOnly: true,
    secure: true,
    sameSite: "lax",
    path: "/",
    maxAge: 0,
  });
}
