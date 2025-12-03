import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { db } from "@/lib/db";

export async function GET(req: NextRequest) {
  try {
    const cookieStore = await cookies();
    const userId = cookieStore.get("userId")?.value;
    if (!userId) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    const [rows]: any = await db.query(
      `SELECT user_id, name, email, phone, password, created_at
       FROM Users WHERE user_id = ? LIMIT 1`,
      [userId]
    );

    if (!rows || rows.length === 0) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    return NextResponse.json(rows[0]);
  } catch (err) {
    console.error("GET /api/profile error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const cookieStore = await cookies();
    const userId = cookieStore.get("userId")?.value;

    if (!userId) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    const body = await req.json();
    const updates: string[] = [];
    const params: any[] = [];

    if (typeof body.name === "string") {
      updates.push("name = ?");
      params.push(body.name.trim());
    }

    if (typeof body.email === "string") {
      updates.push("email = ?");
      params.push(body.email.trim());
    }

    // PLAIN PASSWORD STORAGE (as you requested)
    if (typeof body.password === "string") {
      updates.push("password = ?");
      params.push(body.password);
    }

    if (typeof body.phone === "string") {
      const phone = body.phone.trim();
      if (phone === "") {
        updates.push("phone = NULL");
      } else {
        updates.push("phone = ?");
        params.push(phone);
      }
    }

    if (updates.length === 0) {
      return NextResponse.json({ error: "No valid fields to update" }, { status: 400 });
    }

    const sql = `UPDATE Users SET ${updates.join(", ")} WHERE user_id = ?`;
    params.push(userId);

    await db.query(sql, params);

    const [rowsAfter]: any = await db.query(
      `SELECT user_id, name, email, phone, password, created_at
       FROM Users WHERE user_id = ? LIMIT 1`,
      [userId]
    );

    return NextResponse.json(rowsAfter[0]);
  } catch (err: any) {
    console.error("PUT /api/profile error:", err);
    if (err.code === "ER_DUP_ENTRY") {
      return NextResponse.json({ error: "Email already in use" }, { status: 409 });
    }
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}