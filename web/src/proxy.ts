import { NextResponse, type NextRequest } from "next/server";
import { SESSION_COOKIE, signInHref } from "@/lib/session";

// Browsing is open to everyone; only publishing a bet sends a guest to sign in up front.
// This checks the cookie optimistically; the API checks the session itself on every call.
export function proxy(req: NextRequest) {
  if (req.cookies.has(SESSION_COOKIE)) return NextResponse.next();
  return NextResponse.redirect(new URL(signInHref(req.nextUrl.pathname + req.nextUrl.search), req.url));
}

export const config = {
  matcher: ["/new/:path*"],
};
