import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function proxy(request: NextRequest) {
  const maintenanceMode = process.env.MAINTENANCE_MODE === "true";
  const { pathname } = request.nextUrl;

  // Toujours autoriser la page maintenance
  if (pathname === "/maintenance") {
    return NextResponse.next();
  }

  // Autoriser les fichiers Next.js et fichiers publics
  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/api") ||
    pathname.includes(".")
  ) {
    return NextResponse.next();
  }

  // Redirection lorsque la maintenance est activée
  if (maintenanceMode) {
    return NextResponse.redirect(
      new URL("/maintenance", request.url)
    );
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};