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
  const walletIdSend = cookieStore.get("walletId")?.value;

  if (!walletIdSend) {
    return NextResponse.json(
      { error: "Missing walletId cookie" },
      { status: 400 }
    );
  }

  try {
    const body = await request.json();
    const { amount, description, type_id, wallet_recv } = body;

    // Basic validation
    if (!amount || !type_id || !wallet_recv) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Insert into MariaDB
    const [result] = await db.query(
      `
      INSERT INTO Transactions (
        amount,
        description,
        type_id,
        wallet_id_send,
        wallet_id_recv
      ) VALUES (?, ?, ?, ?, ?)
      `,
      [amount, description, type_id, walletIdSend, wallet_recv]
    );

    return NextResponse.json({
      id: (result as any).insertId,
      amount,
      description,
      type_id,
      wallet_id_send: walletIdSend,
      wallet_id_recv: wallet_recv,
    });
  } catch (err) {
    console.log(err);
    return NextResponse.json(
      { error: "Database error" },
      { status: 500 }
    );
  }
}