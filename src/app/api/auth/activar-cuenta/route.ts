import { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { usuario } from "@/lib/schema";
import { eq } from "drizzle-orm";
import { hashPassword, signToken, setSession } from "@/lib/auth";
import { ok, err } from "@/lib/utils";
import { z } from "zod";

const schema = z.object({
  idUsuario:         z.number().int().positive(),
  nuevaPassword:     z.string()
    .min(8, "Mínimo 8 caracteres")
    .regex(/[A-Z]/, "Debe contener al menos una mayúscula")
    .regex(/[a-z]/, "Debe contener al menos una minúscula")
    .regex(/[0-9]/, "Debe contener al menos un número"),
  confirmarPassword: z.string(),
}).refine(d => d.nuevaPassword === d.confirmarPassword, {
  message: "Las contraseñas no coinciden",
  path: ["confirmarPassword"],
});

export async function POST(req: NextRequest) {
  try {
    const parsed = schema.safeParse(await req.json());
    if (!parsed.success) return err(parsed.error.errors[0].message);

    const { idUsuario, nuevaPassword } = parsed.data;

    const [u] = await db.select().from(usuario).where(eq(usuario.id, idUsuario)).limit(1);
    if (!u) return err("Usuario no encontrado", 404);
    if (!u.primerLogin) return err("Esta cuenta ya fue activada", 400);

    if (!u.correoVerificado && !u.celularVerificado) {
      return err("Debes verificar al menos un método de contacto primero", 400);
    }

    if (u.ci && nuevaPassword === u.ci) {
      return err("Tu nueva contraseña no puede ser tu CI");
    }

    const hash = await hashPassword(nuevaPassword);
    await db.update(usuario)
      .set({ passwordHash: hash, primerLogin: false })
      .where(eq(usuario.id, idUsuario));

    const token = await signToken({
      idUsuario:         u.id,
      correo:            u.correo,
      rol:               u.rol as "admin" | "egresado",
      idEgresado:        u.idEgresado ?? null,
      ci:                u.ci ?? null,
      correoVerificado:  u.correoVerificado,
      celularVerificado: u.celularVerificado,
    });
    setSession(token);

    return ok({ redirigir: u.rol === "admin" ? "/dashboard" : "/mi-perfil" });
  } catch (e) {
    console.error("[activar-cuenta]", e);
    return err("Error interno", 500);
  }
}