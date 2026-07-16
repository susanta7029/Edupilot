import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";

export async function middleware(req: NextRequest) {
  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET || "edu-pilot-super-secret-key-12345" });
  const { pathname } = req.nextUrl;

  // Define public paths
  const isAuthPage = pathname.startsWith("/login") || pathname.startsWith("/signup") || pathname.startsWith("/forgot-password");
  const isApiAuth = pathname.startsWith("/api/auth");
  const isLandingPage = pathname === "/";
  const isPublicAsset = pathname.startsWith("/_next") || pathname.startsWith("/static") || pathname.includes(".");

  if (isAuthPage) {
    if (token) {
      // Redirect logged-in users away from login/signup
      if (token.role === "ADMIN") {
        return NextResponse.redirect(new URL("/admin", req.url));
      }
      return NextResponse.redirect(new URL("/student", req.url));
    }
    return NextResponse.next();
  }

  // Protect student dashboard
  if (pathname.startsWith("/student")) {
    if (!token) {
      return NextResponse.redirect(new URL("/login?callbackUrl=" + encodeURIComponent(pathname), req.url));
    }
    if (token.role !== "STUDENT" && token.role !== "ADMIN") {
      return NextResponse.redirect(new URL("/login", req.url));
    }
  }

  // Protect admin dashboard
  if (pathname.startsWith("/admin")) {
    if (!token) {
      return NextResponse.redirect(new URL("/login?callbackUrl=" + encodeURIComponent(pathname), req.url));
    }
    if (token.role !== "ADMIN") {
      // Students cannot access admin dashboard
      return NextResponse.redirect(new URL("/student", req.url));
    }
  }

  // Protect internal api routes
  if (pathname.startsWith("/api/student") || pathname.startsWith("/api/ai")) {
    if (!token) {
      return new NextResponse(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { "Content-Type": "application/json" },
      });
    }
  }

  if (pathname.startsWith("/api/admin")) {
    if (!token || token.role !== "ADMIN") {
      return new NextResponse(JSON.stringify({ error: "Forbidden" }), {
        status: 403,
        headers: { "Content-Type": "application/json" },
      });
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/student/:path*",
    "/admin/:path*",
    "/login",
    "/signup",
    "/forgot-password",
    "/api/student/:path*",
    "/api/admin/:path*",
    "/api/ai/:path*",
  ],
};
