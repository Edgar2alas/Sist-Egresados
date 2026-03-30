import { SignJWT, jwtVerify } from "jose";
import bcrypt from "bcryptjs";
import { cookies } from "next/headers";

const SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET ?? "dev_secret_cambia_en_produccion_32chars!!"
);
const COOKIE = "eg_token";

export interface Session {
  idUsuario:  number;
  correo:     string;
  rol:        "admin" | "egresado";
  idEgresado: number | null;
}

// Contraseñas
export const hashPassword   = (p: string) => bcrypt.hash(p, 12);
export const verifyPassword = (p: string, h: string) => bcrypt.compare(p, h);

// JWT
export async function signToken(s: Session): Promise<string> {
  return new SignJWT({ ...s })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("8h")
    .sign(SECRET);
}

export async function verifyToken(token: string): Promise<Session | null> {
  try {
    const { payload } = await jwtVerify(token, SECRET);
    return payload as unknown as Session;
  } catch { return null; }
}

// Sesión desde cookie
export async function getSession(): Promise<Session | null> {
  const token = cookies().get(COOKIE)?.value;
  if (!token) return null;
  return verifyToken(token);
}

export function setSession(token: string) {
  cookies().set(COOKIE, token, {
    httpOnly: true,
    secure:   process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge:   60 * 60 * 8,   // 8 horas
    path:     "/",
  });
}

export function clearSession() {
  cookies().delete(COOKIE);
}
