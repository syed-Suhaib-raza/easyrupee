import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { cookies } from 'next/headers';

export async function GET() {
  try {
    const [rows] = await db.query(`
      SELECT 
        mb.bill_id,
        mb.amount,
        mb.due_date,
        mb.status_id,
        bs.status_name,
        mb.merchant_id,
        m.merchant_name
      FROM Merchant_Bills mb
      LEFT JOIN Bill_Status bs ON mb.status_id = bs.status_id
      LEFT JOIN Merchants m ON mb.merchant_id = m.merchant_id
      ORDER BY mb.due_date ASC
    `);

    return NextResponse.json(rows);
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "DB error" }, { status: 500 });
  }
}
export async function POST(req: Request) {
  const cookieStore = await cookies();
  const cookieWallet = cookieStore.get("walletId")?.value;

  try {
    const body = await req.json();
    const bill_id = Number(body?.bill_id);
    const amount = Number(body?.amount);
    const wallet_id_send = body?.wallet_id_send
      ? Number(body.wallet_id_send)
      : cookieWallet
      ? Number(cookieWallet)
      : null;

    if (!bill_id || !amount || amount <= 0 || !wallet_id_send) {
      return NextResponse.json(
        { error: "Missing or invalid bill_id / amount / wallet_id_send", debug: { bill_id, amount, wallet_id_send } },
        { status: 400 }
      );
    }

    const conn: any = typeof (db as any).getConnection === "function" ? await (db as any).getConnection() : null;
    if (!conn) {
      return NextResponse.json({ error: "DB connection helper not available (expected db.getConnection())" }, { status: 500 });
    }

    let stage = "start";
    try {
      await conn.beginTransaction();

      // 1) lock the bill row
      stage = "select-bill";
      const [billRows] = await conn.query(
        "SELECT bill_id, amount, status_id, merchant_id, user_id FROM Merchant_Bills WHERE bill_id = ? FOR UPDATE",
        [bill_id]
      );
      if (!Array.isArray(billRows) || billRows.length === 0) {
        await conn.rollback();
        return NextResponse.json({ error: "Bill not found", stage }, { status: 404 });
      }
      const bill = (billRows as any)[0];
      const outstanding = Number(bill.amount ?? 0);

      // validate outstanding
      stage = "validate-outstanding";
      if (outstanding <= 0) {
        await conn.rollback();
        return NextResponse.json({ error: "Bill already settled", stage }, { status: 400 });
      }
      if (amount > outstanding) {
        await conn.rollback();
        return NextResponse.json({ error: "Payment amount exceeds outstanding bill amount", stage }, { status: 400 });
      }

      // 2) lock payer wallet
      stage = "select-sender-wallet";
      const [sendRows] = await conn.query(
        "SELECT wallet_id, balance, user_id FROM Wallets WHERE wallet_id = ? FOR UPDATE",
        [wallet_id_send]
      );
      if (!Array.isArray(sendRows) || sendRows.length === 0) {
        await conn.rollback();
        return NextResponse.json({ error: "Sender wallet not found", stage }, { status: 404 });
      }
      const sender = (sendRows as any)[0];
      const senderBalance = Number(sender.balance ?? 0);

      stage = "validate-sender-balance";
      if (senderBalance < amount) {
        await conn.rollback();
        return NextResponse.json({ error: "Insufficient funds", stage }, { status: 400 });
      }

      // 3) find & lock merchant wallet (if merchant exists)
      stage = "select-merchant-wallet";
      let merchantWalletId: number | null = null;
      if (bill.merchant_id) {
        // CORRECT JOIN: Merchants.merchant_id -> Wallets.user_id
        const [mw] = await conn.query(
          `SELECT w.wallet_id
           FROM Merchants m
           INNER JOIN Wallets w ON w.user_id = m.merchant_id
           WHERE m.merchant_id = ?
           LIMIT 1 FOR UPDATE`,
          [bill.merchant_id]
        );
        if (Array.isArray(mw) && mw.length > 0) {
          merchantWalletId = (mw as any)[0].wallet_id;
        }
      }

      // 4) debit sender
      stage = "debit-sender";
      await conn.query("UPDATE Wallets SET balance = balance - ? WHERE wallet_id = ?", [amount, wallet_id_send]);

      // 5) credit merchant wallet (if exists)
      stage = "credit-merchant";
      if (merchantWalletId) {
        await conn.query("UPDATE Wallets SET balance = balance + ? WHERE wallet_id = ?", [amount, merchantWalletId]);
      }

      // 6) update bill
      stage = "update-bill";
      const newOutstanding = outstanding - amount;
      const newStatus = newOutstanding === 0 ? 1 : 3;
      await conn.query("UPDATE Merchant_Bills SET amount = ?, status_id = ? WHERE bill_id = ?", [newOutstanding, newStatus, bill_id]);

      // 7) insert transaction
      stage = "insert-transaction";
      const description = `Bill payment (bill:${bill_id})`;
      const [ins] = await conn.query(
        `INSERT INTO Transactions (amount, description, type_id, wallet_id_send, wallet_id_recv, created_at)
         VALUES (?, ?, ?, ?, ?, NOW())`,
        [amount, description, 1, wallet_id_send, merchantWalletId]
      );

      await conn.commit();

      const insertId = (ins as any).insertId ?? null;
      return NextResponse.json({
        success: true,
        transaction_id: insertId,
        bill_id,
        paid_amount: amount,
        new_outstanding: newOutstanding,
        new_status: newStatus,
        credited_wallet: merchantWalletId,
      });
    } catch (err: any) {
      try { await conn.rollback(); } catch (_) { /* ignore */ }
      console.error("Payment error at stage:", stage, err);
      const message = err?.message ?? "Payment failed";
      return NextResponse.json({ error: message, stage }, { status: 400 });
    } finally {
      try { conn.release?.(); } catch (_) { /* ignore */ }
    }
  } catch (err) {
    return NextResponse.json({ error: "Invalid request body", details: String(err) }, { status: 400 });
  }
}