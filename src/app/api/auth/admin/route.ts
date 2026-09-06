import { NextRequest, NextResponse } from "next/server";
import { getEventConfig } from "@/lib/db";
import { signToken, ADMIN_COOKIE_NAME } from "@/lib/auth";

export async function POST(req: NextRequest) {
  try {
    const { password } = await req.json();
    const config = await getEventConfig();
    const expectedPassword = process.env.ADMIN_PASSWORD || config?.admin_password_hash || "admin123";

    if (!password || password.trim() !== expectedPassword.trim()) {
      return NextResponse.json({ error: "Invalid admin passphrase." }, { status: 401 });
    }

    const token = signToken({ role: "admin" });
    const response = NextResponse.json({ success: true });

    response.cookies.set({
      name: ADMIN_COOKIE_NAME,
      value: token,
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24, // 24 hours
    });

    return response;
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
