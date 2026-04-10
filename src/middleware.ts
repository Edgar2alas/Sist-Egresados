import { NextRequest, NextResponse } from "next/server";
import { verifyToken } from "@/lib/auth";

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // 1. Rutas de API: solo verificar sesión, el handler maneja la autorización
  if (pathname.startsWith("/api/")) {
    if (pathname.startsWith("/api/auth/login")) return NextResponse.next();

    const token   = req.cookies.get("eg_token")?.value;
    const session = token ? await verifyToken(token) : null;

    if (!session)
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });

    const headers = new Headers(req.headers);
    headers.set("x-uid",  String(session.idUsuario));
    headers.set("x-rol",  session.rol);
    headers.set("x-egid", String(session.idEgresado ?? ""));
    return NextResponse.next({ request: { headers } });
  }

  const publicRoutes = ["/activar-cuenta", "/recuperar-password"];
  if (publicRoutes.includes(pathname)) {
    return NextResponse.next();
  }

  // 2. Login: si ya tiene sesión redirigir al destino
  if (pathname === "/login") {
    const token = req.cookies.get("eg_token")?.value;
    if (token) {
      const s = await verifyToken(token);
      if (s) {
        return NextResponse.redirect(
          new URL(s.rol === "admin" ? "/dashboard" : "/mi-perfil", req.url)
        );
      }
    }
    return NextResponse.next();
  }

  // 3. Todas las demás rutas: verificar sesión
  const token   = req.cookies.get("eg_token")?.value;
  const session = token ? await verifyToken(token) : null;

  if (!session)
    return NextResponse.redirect(new URL("/login", req.url));

  // 4. Rutas exclusivas de ADMIN
  const adminRoutes = ["/dashboard", "/egresados", "/usuarios", "/reportes"];
  if (adminRoutes.some(r => pathname.startsWith(r)) && session.rol !== "admin") {
    return NextResponse.redirect(new URL("/mi-perfil", req.url));
  }

  // 5. Rutas exclusivas de EGRESADO
  const egresadoRoutes = ["/mi-perfil", "/editar-perfil", "/registro-inicial", "/experiencia"];
  if (egresadoRoutes.some(r => pathname.startsWith(r)) && session.rol !== "egresado") {
    return NextResponse.redirect(new URL("/dashboard", req.url));
  }

  // 6. Pasar con headers de sesión
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
