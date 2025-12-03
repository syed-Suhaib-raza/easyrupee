import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { db } from "@/lib/db";

/** Shape of a row returned from the Loans table */
type LoanRow = {
  loan_id: number;
  principal: number | string | null;
  interest_rate?: number | string | null;
  start_date?: string | null;
  end_date?: string | null;
  status_id?: number | string | null;
  user_id?: number | string | null;
};

function asNumber(v: number | string | null | undefined): number {
  if (v === null || v === undefined) return 0;
  const n = typeof v === "number" ? v : parseFloat(String(v));
  return Number.isFinite(n) ? n : 0;
}

export async function GET() {
  try {
    const cookieStore = await cookies();
    const userId = cookieStore.get("userId")?.value;

    if (!userId) {
      return NextResponse.json({ message: "Not logged in" }, { status: 401 });
    }

    // many mysql libraries return [rows, fields], so assert the shape
    const result = (await db.query(
      `SELECT loan_id, principal, interest_rate, start_date, end_date, status_id
       FROM Loans
       WHERE user_id = ?
       ORDER BY loan_id DESC`,
      [userId]
    )) as unknown;

    // Normalize rows to LoanRow[]
    // If your db.query already returns rows directly, adjust this line.
    const rows = (Array.isArray(result) && Array.isArray((result as any)[0]))
      ? ((result as any)[0] as LoanRow[])
      : ((result as any) as LoanRow[]);

    // convert principal & status_id to numbers for the client (optional)
    const loans = rows.map((r) => ({
      ...r,
      principal: asNumber(r.principal),
      interest_rate: r.interest_rate != null ? asNumber(r.interest_rate) : null,
      status_id: r.status_id != null ? Number(r.status_id) : null,
    }));

    return NextResponse.json({ loans });
  } catch (err) {
    console.error("GET /api/loans", err);
    return NextResponse.json({ message: "Server error" }, { status: 500 });
  }
}

// POST — record payment + update loan principal + deduct from wallet
export async function POST(req: Request) {
  let txStarted = false;
  try {
    const cookieStore = await cookies();
    const userId = cookieStore.get("userId")?.value;
    const walletId = cookieStore.get("walletId")?.value;

    if (!userId || !walletId) {
      return NextResponse.json({ message: "Not logged in" }, { status: 401 });
    }

    const body = await req.json().catch(() => ({}));
    const loan_id = Number(body?.loan_id);
    const amount_paid = Number(body?.amount_paid);

    if (!loan_id || !amount_paid || amount_paid <= 0) {
      return NextResponse.json({ message: "Invalid amount" }, { status: 400 });
    }

    /** Fetch the loan */
    const loanResult = (await db.query(
      `SELECT * FROM Loans WHERE loan_id = ? AND user_id = ?`,
      [loan_id, userId]
    )) as any;

    const loan = Array.isArray(loanResult[0]) ? loanResult[0][0] : loanResult[0];

    if (!loan) {
      return NextResponse.json({ message: "Loan not found" }, { status: 404 });
    }

    const outstanding = Number(loan.principal);

    if (amount_paid > outstanding) {
      return NextResponse.json(
        { message: "Payment exceeds outstanding amount" },
        { status: 400 }
      );
    }

    // Start transaction
    await db.query("START TRANSACTION");
    txStarted = true;

    // Insert into Loan_Payments
    await db.query(
      `INSERT INTO Loan_Payments (loan_id, amount_paid, payment_date)
       VALUES (?, ?, CURDATE())`,
      [loan_id, amount_paid]
    );

    // Update loan remaining principal
    const newPrincipal = parseFloat((outstanding - amount_paid).toFixed(2));
    const paidOffStatusId = 2;

    await db.query(
      `UPDATE Loans
       SET principal = ?, status_id = ?
       WHERE loan_id = ?`,
      [
        newPrincipal,
        newPrincipal <= 0 ? paidOffStatusId : loan.status_id,
        loan_id,
      ]
    );

    // ⭐ NEW: Deduct from wallet balance
    await db.query(
      `UPDATE Wallets
       SET balance = balance - ?
       WHERE wallet_id = ?`,
      [amount_paid, walletId]
    );

    await db.query("COMMIT");
    txStarted = false;

    return NextResponse.json({ message: "Payment recorded" });
  } catch (err) {
    console.error("POST /api/loans error:", err);
    if (txStarted) {
      await db.query("ROLLBACK");
    }
    return NextResponse.json({ message: "Server error" }, { status: 500 });
  }
}