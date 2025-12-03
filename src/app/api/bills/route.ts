import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

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