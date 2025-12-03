import { NextResponse } from "next/server";
import { cookies } from "next/headers";

export async function GET() {
  const cookieStore = await cookies();
  const walletId = cookieStore.get("walletId")?.value;

  if (!walletId) {
    return NextResponse.json({ wallet_id: null });
  }

  return NextResponse.json({ wallet_id: Number(walletId) });
}