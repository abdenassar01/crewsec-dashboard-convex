/* eslint-disable @typescript-eslint/no-unused-vars */
import { getSessionCookie } from "better-auth/cookies";
//import { createAuth } from "./convex/auth";
import { NextRequest, NextResponse } from "next/server";
import { betterFetch } from "@better-fetch/fetch";
import { createAuth } from "@convex/auth";

type Session = ReturnType<typeof createAuth>["$Infer"]["Session"];

const getSession = async (request: NextRequest) => {
  const { data: session } = await betterFetch<Session>(
    "/api/auth/get-session",
    {
      baseURL: request.nextUrl.origin,
      headers: {
        cookie: request.headers.get("cookie") ?? "",
        origin: request.nextUrl.origin,
      },
    },
  );
  return session;
};


const signInRoutes = ["/login", "/reset-password"];

// Just check cookie, recommended approach
export default async function middleware(request: NextRequest) {
  const sessionCookie = getSessionCookie(request);
  // Uncomment to fetch the session (not recommended)
  const session = await getSession(request);

  console.log("Middleware session cookie", { sessionCookie });
  console.log("Middleware session", { session });

  const isSignInRoute = signInRoutes.includes(request.nextUrl.pathname);

  if (isSignInRoute && !session) {
    return NextResponse.next();
  }

  if (!isSignInRoute && !session) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  if (sessionCookie && isSignInRoute) {
    return NextResponse.redirect(
      new URL("/dashboard", request.url),
    );
  }

  if (sessionCookie && request.nextUrl.pathname === "/") {
    return NextResponse.redirect(
      new URL("/dashboard", request.url),
    );
  }

  return NextResponse.next();
}

export const config = {
  // Run middleware on all routes except static assets and api routes
  matcher: ["/((?!.*\\..*|_next|api/auth).*)", "/", "/trpc(.*)"],
};