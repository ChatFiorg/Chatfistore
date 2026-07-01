import { NextRequest, NextResponse } from "next/server";
import { cookieName } from "@/lib/buyerSession";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const username = searchParams.get("username");
  if (!username) return NextResponse.json({ error: "username required" }, { status: 400 });

  const token = req.cookies.get(cookieName(username))?.value;
  if (!token) return NextResponse.json({ error: "Not logged in" }, { status: 401 });

  try {
    const res = await fetch(`https://pay.chatfi.pro/api/store/${username}/auth/me`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const data = await res.json();
    return NextResponse.json(data, { status: res.status });
  } catch (e: any) {
    return NextResponse.json({ error: e.message || "Failed" }, { status: 500 });
  }
}
