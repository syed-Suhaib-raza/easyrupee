import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

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