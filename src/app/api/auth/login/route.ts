import { NextRequest, NextResponse } from "next/server";
import { getParticipantByPhone } from "@/lib/db";
import { signToken, COOKIE_NAME } from "@/lib/auth";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { phoneNumber, password } = body;

    if (!phoneNumber || !password) {
      return NextResponse.json(
        { error: "Phone number and password are required." },
        { status: 400 }
      );
    }

    const cleanPhone = String(phoneNumber).trim().replace(/\s+/g, "");
    const cleanPass = String(password).trim();

    // Check if phone number is in pre-registered roster
    const participant = await getParticipantByPhone(cleanPhone);
    if (!participant) {
      return NextResponse.json(
        {
          error: "Phone number not registered. Please contact the event organizers at the registration desk.",
        },
        { status: 401 }
      );
    }

    // Password must be the first 5 characters of the phone number
    const expectedPassword = cleanPhone.slice(0, 5);
    if (cleanPass !== expectedPassword) {
      return NextResponse.json(
        { error: "Invalid password. Your password is the first 5 digits of your phone number." },
        { status: 401 }
      );
    }

    const token = signToken({
      participantId: participant.id,
      phone: participant.phone_number,
    });

    const response = NextResponse.json({
      success: true,
      participant,
      hasCharacter: Boolean(participant.character_id),
    });

    response.cookies.set({
      name: COOKIE_NAME,
      value: token,
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24 * 7, // 7 days
    });

    return response;
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Login failed" }, { status: 500 });
  }
}
