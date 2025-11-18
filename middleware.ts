import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(req: NextRequest) {
  const protectedPaths = ["/dashboard"];
  if (!protectedPaths.some((p) => req.nextUrl.pathname.startsWith(p)))
    return NextResponse.next();

  const session = req.cookies.get("sessionId")?.value;

  if (!session) {
    const login = new URL("/login", req.url);
    return NextResponse.redirect(login);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/:path*"],
};
