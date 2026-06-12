import { getSessionCookie } from "better-auth/cookies";
import { type NextRequest, NextResponse } from "next/server";

import { ADMIN_LOGIN_PATH, adminRedirectPath } from "@/lib/admin-redirect";

export function proxy(request: NextRequest) {
  const { pathname, search } = request.nextUrl;
  const hasSessionCookie = Boolean(getSessionCookie(request.headers));
  const isLogin = pathname === ADMIN_LOGIN_PATH;

  if (isLogin && hasSessionCookie) {
    const redirectTo = adminRedirectPath(
      request.nextUrl.searchParams.get("redirectTo")
    );
    return NextResponse.redirect(new URL(redirectTo, request.url));
  }

  if (!(isLogin || hasSessionCookie)) {
    const loginUrl = new URL(ADMIN_LOGIN_PATH, request.url);
    loginUrl.searchParams.set("redirectTo", `${pathname}${search}`);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*"],
};
