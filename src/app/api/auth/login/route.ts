import { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { usuario } from "@/lib/schema";
import { eq } from "drizzle-orm";
import { verifyPassword, signToken, setSession } from "@/lib/auth";
import { loginSchema } from "@/lib/validations";
import { ok, err } from "@/lib/utils";

export async function POST(req: NextRequest) {
  try {
    const body   = await req.json();
    const parsed = loginSchema.safeParse(body);
    if (!parsed.success) return err(parsed.error.errors[0].message);

    const { correo, password } = parsed.data;
    const [u] = await db.select().from(usuario).where(eq(usuario.correo, correo)).limit(1);

    if (!u)                    return err("Correo o contraseña incorrectos", 401);
    if (u.estado !== "activo") return err(`Tu cuenta está ${u.estado}.`, 403);

    const valid = await verifyPassword(password, u.passwordHash);
    if (!valid) return err("Correo o contraseña incorrectos", 401);

    const token = await signToken({
      idUsuario:  u.id,
      correo:     u.correo,
      rol:        u.rol,
      idEgresado: u.idEgresado,
    });
    setSession(token);

    return ok({ rol: u.rol, idEgresado: u.idEgresado });
  } catch (e) {
    console.error(e);
    return err("Error interno del servidor", 500);
  }
}
