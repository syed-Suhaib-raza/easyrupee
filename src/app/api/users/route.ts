import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { UserRow } from '@/lib/db';
import { cookies } from 'next/headers';
import { SessionRow } from '@/lib/db';

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const email = searchParams.get('email');
    const password = searchParams.get('password');
    const [rows] = (await db.query(
      'SELECT * FROM Users WHERE email = ? AND password = ?',
      [email, password]
    )) as unknown as [UserRow[], any];
    if (Array.isArray(rows) && rows.length > 0) {
      const r = rows;
      const id = r[0].user_id;
      const expire = new Date(Date.now() + 24 * 60 * 60 * 1000);
      await db.query('INSERT INTO Sessions (UserID, Expires) Values (?, ?)', [id, expire]);
      const [rows2] = (await db.query(
        'SELECT * FROM Sessions WHERE UserID = ? AND Expires = ?',
        [id, expire]
      )) as unknown as [SessionRow[], any];
      const sessionId = rows2[0].SessionID;
      const dashboardUrl = new URL('/dashboard', req.url);
      const res = NextResponse.redirect(dashboardUrl, 302);
      res.cookies.set('sessionId', sessionId.toString(), { httpOnly: true, expires: expire });
      return res;
    }
    return NextResponse.json({ success: false }, { status: 401 });
  } catch (err) {
    return NextResponse.json({ error: 'DB error' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  const body = await req.json();
  const { name, email, password, phone } = body;
  try {
    await db.query('INSERT INTO Users (name, email, password, phone) VALUES (?, ?, ?, ?)', [name, email, password, phone]);
    return NextResponse.json({ message: 'User created' }, { status: 201 });
  } catch (err:any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
