// src/app/api/expenses/route.ts
import { NextResponse } from "next/server";
import { db } from "@/lib/db";

type PostBody = {
  wallet_id?: number | string | null;
  user_id?: number | string | null;
  category_id?: number | string | null;
  amount?: number | string | null;
  description?: string | null;
  date?: string | null;
};

export async function GET() {
  try {
    const [rows] = await db.query("SELECT * FROM Expenses ORDER BY date_recorded DESC LIMIT 200");
    return NextResponse.json(Array.isArray(rows) ? rows : []);
  } catch (err) {
    console.error("GET /api/expenses error", err);
    return NextResponse.json({ error: "DB error" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body: PostBody = await req.json();

    const { wallet_id, user_id: clientUserId, category_id, amount, description, date } = body;

    // Validate amount presence and numeric
    if (amount === undefined || amount === null || amount === "") {
      return NextResponse.json({ error: "Missing fields" }, { status: 400 });
    }
    const numericAmount = Number(amount);
    if (Number.isNaN(numericAmount)) {
      return NextResponse.json({ error: "Invalid amount" }, { status: 400 });
    }

    // Resolve user_id: prefer wallet -> user mapping (server side)
    let resolvedUserId: number | string | null = null;

    if (wallet_id) {
      const [walletRows]: any = await db.query("SELECT user_id FROM Wallets WHERE wallet_id = ? LIMIT 1", [wallet_id]);
      if (Array.isArray(walletRows) && walletRows.length > 0) {
        resolvedUserId = walletRows[0].user_id;
      } else {
        return NextResponse.json({ error: "Invalid wallet_id (no owner found)" }, { status: 400 });
      }
    } else if (clientUserId) {
      // If client provided user_id, verify it exists (optional, less trusted)
      const [userRows]: any = await db.query("SELECT user_id FROM Users WHERE user_id = ? LIMIT 1", [clientUserId]);
      if (Array.isArray(userRows) && userRows.length > 0) {
        resolvedUserId = userRows[0].user_id;
      } else {
        return NextResponse.json({ error: "Invalid user_id" }, { status: 400 });
      }
    } else {
      return NextResponse.json({ error: "Missing fields" }, { status: 400 });
    }

    // Insert into Expenses table. Adjust columns to match your schema.
    // Based on your screenshots the columns are: user_id, expense_category_id, amount, description, date_recorded
    await db.query(
      "INSERT INTO Expenses (user_id, expense_category_id, amount, description, date_recorded) VALUES (?, ?, ?, ?, ?)",
      [resolvedUserId, category_id ?? null, numericAmount, description ?? null, date ?? null]
    );

    return NextResponse.json({ message: "Expense added" }, { status: 201 });
  } catch (err: any) {
    console.error("POST /api/expenses error", err);
    // For DB-level FK errors, surface a friendly message
    if (err?.code === "ER_NO_REFERENCED_ROW_2" || err?.errno === 1452) {
      return NextResponse.json({ error: "Foreign key constraint failed" }, { status: 400 });
    }
    return NextResponse.json({ error: err?.message || "DB error" }, { status: 500 });
  }
}