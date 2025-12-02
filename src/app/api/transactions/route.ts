import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { cookies } from 'next/headers';

export async function GET() {
  const cookieStore = await cookies();
  const walletId = cookieStore.get('walletId')?.value;

  if (!walletId) {
    return NextResponse.json({ error: 'No wallet ID found in cookies' }, { status: 400 });
  }
  try {
    const [rows] = await db.query('SELECT * FROM Transactions WHERE wallet_id_send=? OR wallet_id_recv=? ORDER BY created_at DESC LIMIT 20',[walletId, walletId]);
    return NextResponse.json(rows);
  } catch (err) {
    return NextResponse.json({ error: 'DB error' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const cookieStore = await cookies();
  const walletId = cookieStore.get('walletId')?.value;
  try {
    const { amount, description, type, wallet_recv } = await request.json();
    const [result] = await db.query(
      'INSERT INTO Transactions (amount, type, description, wallet_send, wallet_recv) VALUES (?, ?, ?, ?, ?)',
      [amount, type, description, walletId, wallet_recv]
    );
    return NextResponse.json({ id: (result as any).insertId, amount, type, description });
  } catch (err) {
    return NextResponse.json({ error: 'DB error' }, { status: 500 });
  }
}
