import jwt from "jsonwebtoken";
import { cookies } from "next/headers";
import { getParticipantById } from "./db";
import { Participant } from "./types";

const JWT_SECRET = process.env.JWT_SECRET || (process.env.NODE_ENV === "production" ? "" : "shrieeek-dev-jwt-deterministic-secret-2026");
if (process.env.NODE_ENV === "production" && !process.env.JWT_SECRET) {
  throw new Error("JWT_SECRET environment variable is required in production. Set it in your .env.local file.");
}
const COOKIE_NAME = "shrieeek_session";
const ADMIN_COOKIE_NAME = "shrieeek_admin";

export function signToken(payload: object): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: "7d" });
}

export function verifyToken<T = any>(token: string): T | null {
  try {
    return jwt.verify(token, JWT_SECRET) as T;
  } catch {
    return null;
  }
}

export async function getCurrentParticipant(): Promise<Participant | null> {
  const cookieStore = cookies();
  const token = cookieStore.get(COOKIE_NAME)?.value;
  if (!token) return null;

  const decoded = verifyToken<{ participantId: string }>(token);
  if (!decoded || !decoded.participantId) return null;

  return await getParticipantById(decoded.participantId);
}

export async function isAdminAuthenticated(): Promise<boolean> {
  const cookieStore = cookies();
  const token = cookieStore.get(ADMIN_COOKIE_NAME)?.value;
  if (!token) return false;

  const decoded = verifyToken<{ role: string }>(token);
  return decoded?.role === "admin";
}

export { COOKIE_NAME, ADMIN_COOKIE_NAME };
