import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET() {
  try {
    const [rows] = await db.query('SELECT * FROM Expenses ORDER BY date DESC LIMIT 200');
    return NextResponse.json(rows);
  } catch (err) {
    return NextResponse.json({ error: 'DB error' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  const body = await req.json();
  const { user_id, category_id, amount, description, date } = body;
  try {
    await db.query('INSERT INTO Expenses (user_id, category_id, amount, description, date) VALUES (?, ?, ?, ?, ?)', [user_id, category_id, amount, description, date]);
    return NextResponse.json({ message: 'Expense added' }, { status: 201 });
  } catch (err:any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
