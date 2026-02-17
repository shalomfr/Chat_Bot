import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// Simple in-memory rate limiter
const rateLimitMap = new Map<string, { count: number; resetTime: number }>();

function isRateLimited(key: string, maxRequests: number, windowMs: number): boolean {
  const now = Date.now();
  const entry = rateLimitMap.get(key);

  if (!entry || now > entry.resetTime) {
    rateLimitMap.set(key, { count: 1, resetTime: now + windowMs });
    return false;
  }

  entry.count++;
  return entry.count > maxRequests;
}

// Clean up old entries every 5 minutes
if (typeof setInterval !== "undefined") {
  setInterval(() => {
    const now = Date.now();
    for (const [key, entry] of rateLimitMap) {
      if (now > entry.resetTime) rateLimitMap.delete(key);
    }
  }, 5 * 60 * 1000);
}

export function middleware(req: NextRequest) {
  const { nextUrl } = req;
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";

  // Check if user has auth token (simple JWT check)
  const token = req.cookies.get('authjs.session-token') || req.cookies.get('__Secure-authjs.session-token');
  const isLoggedIn = !!token;

  // Public routes - no auth check needed
  if (
    nextUrl.pathname === "/" ||
    nextUrl.pathname === "/login" ||
    nextUrl.pathname === "/register" ||
    nextUrl.pathname.startsWith("/api/auth") ||
    nextUrl.pathname.startsWith("/api/widget")
  ) {
    return NextResponse.next();
  }

  // Rate limiting for registration
  if (nextUrl.pathname === "/api/auth/register" && req.method === "POST") {
    if (isRateLimited(`register:${ip}`, 5, 60 * 1000)) {
      return NextResponse.json({ error: "יותר מדי בקשות. נסה שוב בעוד דקה." }, { status: 429 });
    }
  }

  // CORS for widget and chat API
  if (nextUrl.pathname.startsWith("/api/chat")) {
    if (req.method === "OPTIONS") {
      return new NextResponse(null, {
        status: 200,
        headers: {
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
          "Access-Control-Allow-Headers": "Content-Type",
        },
      });
    }
    // Rate limit chat: 20 requests per minute per IP
    if (req.method === "POST" && isRateLimited(`chat:${ip}`, 20, 60 * 1000)) {
      return new NextResponse("יותר מדי הודעות. נסה שוב בעוד דקה.", {
        status: 429,
        headers: { "Access-Control-Allow-Origin": "*" },
      });
    }
    return NextResponse.next();
  }

  // Protect dashboard routes
  if (nextUrl.pathname.startsWith("/dashboard") && !isLoggedIn) {
    return NextResponse.redirect(new URL("/login", nextUrl));
  }

  // Protect API routes (except auth and widget)
  if (nextUrl.pathname.startsWith("/api/") && !isLoggedIn) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Redirect logged-in users away from auth pages
  if (nextUrl.pathname === "/login" && isLoggedIn) {
    return NextResponse.redirect(new URL("/dashboard", nextUrl));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|widget/|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
