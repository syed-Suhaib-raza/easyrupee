import { db } from "@/lib/db";
import { cookies as nextCookies } from "next/headers";

export const SESSION_COOKIE = "sessionId";
export const SESSION_DAYS = 1;


export async function createSession(userId: number) {
  const expires = new Date(Date.now() + SESSION_DAYS * 86400000);

  await db.query(
    "INSERT INTO Session (UserID, Expires) VALUES (?, ?)",
    [userId, expires]
  );

  const [rows] = (await db.query(
    `SELECT SessionID FROM Session
     WHERE UserID = ?
     ORDER BY Created DESC
     LIMIT 1`,
    [userId]
  )) as any;

  return { sessionId: rows[0].SessionID, expires };
}


export async function destroySession(sessionId: string, res: any) {
  await db.query("DELETE FROM Session WHERE SessionID = ?", [sessionId]);

  res.cookies.set(SESSION_COOKIE, "", {
    httpOnly: true,
    expires: new Date(0),
    path: "/",
  });
}


export async function getUserFromSessionCookie() {
  try {
    const cookies = await nextCookies();
    const sessionId = cookies.get(SESSION_COOKIE)?.value;

    if (!sessionId) return null;

    const [rows] = (await db.query(
      `SELECT u.*
       FROM Session s
       JOIN Users u ON u.user_id = s.UserID
       WHERE s.SessionID = ?
       AND s.Expires > NOW()`,
      [sessionId]
    )) as any;

    return rows.length ? rows[0] : null;
  } catch (err) {
    console.error("getUserFromSessionCookie error:", err);
    return null;
  }
}
