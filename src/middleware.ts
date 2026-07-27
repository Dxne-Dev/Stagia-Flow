import { getToken } from "next-auth/jwt";
import { NextResponse } from "next/server";

import type { NextRequest } from "next/server";

export default async function middleware(request: NextRequest) {
  const token = await getToken({
    req: request,
    secret: process.env.NEXTAUTH_SECRET,
  });
  const isInternSpace = request.nextUrl.pathname.startsWith("/stagiaire");
  const allowed =
    token &&
    ((isInternSpace && token.role === "INTERN") ||
      (!isInternSpace && token.role === "COMPANY_ADMIN"));

  if (!allowed) {
    const signInUrl = new URL("/connexion", request.url);
    signInUrl.searchParams.set("callbackUrl", request.nextUrl.pathname);
    return NextResponse.redirect(signInUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/entreprise/:path*", "/stagiaire/:path*"],
};
