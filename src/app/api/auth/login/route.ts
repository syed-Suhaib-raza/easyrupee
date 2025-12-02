import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { createSession, SESSION_COOKIE, SESSION_NAME, SESSION_USER_ID, SESSION_WALLET_ID } from "@/lib/auth";

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
    const [rows2] = (await db.query(
      "SELECT * FROM Wallets WHERE user_id = ? LIMIT 1",
      [user.user_id]
    )) as any;

    const wallet = rows2.length ? rows2[0] : null;

    const { sessionId, expires } = await createSession(user.user_id);

    const res = NextResponse.json({ success: true });
    res.cookies.set(SESSION_COOKIE, sessionId, {
      path: "/",
      expires,
    });
    res.cookies.set(SESSION_NAME, user.name);
    res.cookies.set(SESSION_USER_ID, String(user.user_id));
    if (wallet) {
      res.cookies.set(SESSION_WALLET_ID, String(wallet.wallet_id));
    }

    return res;
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "DB error" }, { status: 500 });
  }
}
