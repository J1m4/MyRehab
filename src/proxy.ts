import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

export default withAuth(
  function middleware(req) {
    const token = req.nextauth.token;
    const path = req.nextUrl.pathname;

    if (path.startsWith("/dashboard/therapist") && token?.role !== "THERAPIST") {
      return NextResponse.redirect(new URL("/dashboard/client", req.url));
    }

    if (path.startsWith("/dashboard/client") && token?.role !== "CLIENT") {
      return NextResponse.redirect(new URL("/dashboard/therapist", req.url));
    }
  },
  {
    callbacks: {
      authorized: ({ token }) => !!token,
    },
  }
);

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/messages/:path*",
    "/account/:path*",
    "/workout/:path*",
    "/timers/:path*",
  ],
};
