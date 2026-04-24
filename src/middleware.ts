// src/middleware.ts
import { NextRequest, NextResponse } from "next/server";
import { verifyToken } from "@/lib/auth";

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // 1. API: verificar sesión, handler maneja autorización
  if (pathname.startsWith("/api/")) {
    if (
          pathname.startsWith("/api/auth/login") ||
          pathname.startsWith("/api/egresados/destacados") ||
          pathname.startsWith("/api/egresados/directorio-publico")
        ) return NextResponse.next();

    const token   = req.cookies.get("eg_token")?.value;
    const session = token ? await verifyToken(token) : null;
    if (!session) return NextResponse.json({ error: "No autorizado" }, { status: 401 });

    const headers = new Headers(req.headers);
    headers.set("x-uid",  String(session.idUsuario));
    headers.set("x-rol",  session.rol);
    headers.set("x-egid", String(session.idEgresado ?? ""));
    return NextResponse.next({ request: { headers } });
  }

  // 2. Rutas públicas sin autenticación
  const publicRoutes = ["/activar-cuenta", "/recuperar-password", "/directorio", "/login"];
  if (publicRoutes.includes(pathname)) return NextResponse.next();

  // 3. Login: redirigir si ya tiene sesión
  if (pathname === "/login") {
    const token = req.cookies.get("eg_token")?.value;
    if (token) {
      const s = await verifyToken(token);
      if (s) return NextResponse.redirect(
        new URL(s.rol === "admin" ? "/dashboard" : "/mi-perfil", req.url)
      );
    }
    return NextResponse.next();
  }

  // 4. Verificar sesión para todo lo demás
  const token   = req.cookies.get("eg_token")?.value;
  const session = token ? await verifyToken(token) : null;
  if (!session) return NextResponse.redirect(new URL("/login", req.url));

  // 5. Rutas exclusivas de ADMIN
  const adminRoutes = ["/dashboard", "/egresados", "/usuarios", "/reportes", "/verificaciones", "/postgrados"];
  if (adminRoutes.some(r => pathname.startsWith(r)) && session.rol !== "admin") {
    return NextResponse.redirect(new URL("/mi-perfil", req.url));
  }

  // 6. Rutas exclusivas de EGRESADO
  const egresadoRoutes = ["/mi-perfil", "/editar-perfil", "/registro-inicial", "/experiencia"];
  if (egresadoRoutes.some(r => pathname.startsWith(r)) && session.rol !== "egresado") {
    return NextResponse.redirect(new URL("/dashboard", req.url));
  }

  // 7. Pasar con headers de sesión
  const headers = new Headers(req.headers);
  headers.set("x-uid",  String(session.idUsuario));
  headers.set("x-rol",  session.rol);
  headers.set("x-egid", String(session.idEgresado ?? ""));
  return NextResponse.next({ request: { headers } });
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.png$|.*\\.jpg$|.*\\.svg$).*)",
  ],
};
