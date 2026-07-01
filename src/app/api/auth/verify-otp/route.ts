import { NextRequest, NextResponse } from "next/server";
import { setBuyerCookie } from "@/lib/buyerSession";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { username, email, code } = body;
    if (!username) return NextResponse.json({ error: "username required" }, { status: 400 });

    const res = await fetch(`https://pay.chatfi.pro/api/store/${username}/auth/verify-otp`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, code }),
    });
    const data = await res.json();

    if (!res.ok || !data.token) {
      return NextResponse.json(data, { status: res.status });
    }

    const response = NextResponse.json({ success: true, email: data.email });
    setBuyerCookie(response, username, data.token);
    return response;
  } catch (e: any) {
    return NextResponse.json({ error: e.message || "Failed" }, { status: 500 });
  }
}
