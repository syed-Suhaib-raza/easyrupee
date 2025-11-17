import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET() {
  try {
    const [rows] = await db.query('SELECT * FROM Transactions ORDER BY created_at DESC LIMIT 100');
    return NextResponse.json(rows);
  } catch (err) {
    return NextResponse.json({ error: 'DB error' }, { status: 500 });
  }
}
