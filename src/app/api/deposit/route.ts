import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { cookies } from 'next/headers';
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
    const {amount} = body;

    // Insert into MariaDB
    const [result] = await db.query(
      `
      UPDATE Wallets SET balance = balance + ? WHERE wallet_id = ?
      `,
      [amount, walletIdSend]
    );

    return NextResponse.json({
      id: (result as any).insertId,
      amount,
      wallet_id_send: walletIdSend,
    });
  } catch (err) {
    console.log(err);
    return NextResponse.json(
      { error: "Database error" },
      { status: 500 }
    );
  }
}