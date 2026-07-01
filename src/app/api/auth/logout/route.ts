import { NextRequest, NextResponse } from "next/server";
import { clearBuyerCookie } from "@/lib/buyerSession";

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => ({}));
  const { username } = body;
  if (!username) return NextResponse.json({ error: "username required" }, { status: 400 });

  const response = NextResponse.json({ success: true });
  clearBuyerCookie(response, username);
  return response;
}
