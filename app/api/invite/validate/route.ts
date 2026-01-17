import { NextRequest, NextResponse } from "next/server";

function getInviteCodes(): string[] {
  const raw = process.env.INVITE_CODES;
  if (!raw) return [];
  return raw
    .split(",")
    .map((c) => c.trim())
    .filter(Boolean);
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => null);
    const code = typeof body?.code === "string" ? body.code.trim() : "";

    if (!code) {
      return NextResponse.json(
        { valid: false, error: "Invite code is required." },
        { status: 400 },
      );
    }

    const inviteCodes = getInviteCodes();
    if (inviteCodes.length === 0) {
      return NextResponse.json(
        { valid: false, error: "Invite-only sign up is not configured." },
        { status: 503 },
      );
    }

    const isValid = inviteCodes.some(
      (c) => c.localeCompare(code, undefined, { sensitivity: "base" }) === 0,
    );

    if (!isValid) {
      return NextResponse.json(
        { valid: false, error: "Invalid invite code." },
        { status: 401 },
      );
    }

    return NextResponse.json({ valid: true });
  } catch {
    return NextResponse.json(
      { valid: false, error: "Something went wrong." },
      { status: 500 },
    );
  }
}


