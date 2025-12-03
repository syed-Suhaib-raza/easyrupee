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

export async function POST(req: Request) {
  try {
    const cookieStore = await cookies();
    const walletIdSendStr = cookieStore.get("walletId")?.value;
    if (!walletIdSendStr) {
      return NextResponse.json({ error: "Missing walletId cookie" }, { status: 400 });
    }
    const walletIdSend = Number(walletIdSendStr);

    const body = await req.json();
    const { amount, description = null, type_id, wallet_recv } = body;

    if (!amount || Number(amount) <= 0 || !type_id || !wallet_recv) {
      return NextResponse.json({ error: "Missing/invalid fields" }, { status: 400 });
    }

    // get a connection from pool
    const conn = await (db as any).getConnection(); // adjust to your pool API
    try {
      // We'll use an OUT param; mysql2/promise returns results slightly differently
      const [rows] = await conn.query(
        "CALL transfer_funds(?, ?, ?, ?, ?, @out_id)",
        [walletIdSend, Number(wallet_recv), amount, Number(type_id), description]
      );
      // read OUT param
      const [[out]] = await conn.query("SELECT @out_id as inserted_id");
      const insertedId = out?.inserted_id ?? null;

      conn.release();
      return NextResponse.json({
        id: insertedId,
        amount,
        description,
        type_id,
        wallet_id_send: walletIdSend,
        wallet_id_recv: wallet_recv
      });
    } catch (err: any) {
      conn.release();
      // The SIGNAL'd message from the SP is usually in err.message
      return NextResponse.json({ error: err?.message ?? "Transfer failed" }, { status: 400 });
    }
  } catch (err) {
    return NextResponse.json({ error: "Bad request" }, { status: 400 });
  }
}