import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { createSession, SESSION_COOKIE } from "@/lib/auth";

export async function POST(req: Request) {
  try {
    const { email, password } = await req.json();

    const [rows] = (await db.query(
      "SELECT * FROM Users WHERE email = ? AND password = ?",
      [email, password]
    )) as any;

    if (!rows.length)
      return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });

    const user = rows[0];

    const { sessionId, expires } = await createSession(user.user_id);

    const res = NextResponse.json({ success: true });
    res.cookies.set(SESSION_COOKIE, sessionId, {
      httpOnly: true,
      path: "/",
      expires,
    });

    return res;
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "DB error" }, { status: 500 });
  }
}
