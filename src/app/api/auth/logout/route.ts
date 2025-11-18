import { NextResponse } from "next/server";
import { destroySession, SESSION_COOKIE } from "@/lib/auth";

export async function POST(req: Request) {
  const cookieHeader = req.headers.get("cookie") || "";
  const cookies = Object.fromEntries(
    cookieHeader.split(";").map((c) => {
      const [k, ...v] = c.trim().split("=");
      return [k, v.join("=")];
    })
  );

  const sessionId = cookies[SESSION_COOKIE];
  const res = NextResponse.json({ success: true });

  if (sessionId) await destroySession(sessionId, res);

  return res;
}
