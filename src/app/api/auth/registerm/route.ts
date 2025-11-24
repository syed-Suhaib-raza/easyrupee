import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function POST(req: Request) {
  try {
    const { name, email, password, phone, category } = await req.json();

    if (!email || !password)
      return NextResponse.json({ error: "Email + password required" }, { status: 422 });

    const [existing] = await db.query(
      "SELECT user_id FROM Users WHERE email = ?",
      [email]
    ) as any;

    if (existing.length > 0)
      return NextResponse.json({ error: "Email already registered" }, { status: 409 });

    await db.query(
      "INSERT INTO Users (name, email, password, phone, created_at) VALUES (?, ?, ?, ?, NOW())",
      [name, email, password, phone]
    );
    const [id] = (await db.query("SELECT user_id FROM Users WHERE email = ?", [email])) as any;
    await db.query(
      "INSERT INTO Merchants (merchant_id, merchant_name, category_id, contact_info) VALUES (?, ?, ?, ?)",
      [id[0].user_id, name, category, phone]
    );

    return NextResponse.json({ message: "Registered successfully" });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "DB error" }, { status: 500 });
  }
}
