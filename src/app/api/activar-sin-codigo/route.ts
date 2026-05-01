import { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { usuario } from "@/lib/schema";
import { eq } from "drizzle-orm";
import { getSession, signToken, setSession, hashPassword } from "@/lib/auth";
import { ok, err } from "@/lib/utils";
import { z } from "zod";

const schema = z.object({
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
    const session = await getSession();
    if (!session) return err("No autorizado", 401);

    const parsed = schema.safeParse(await req.json());
    if (!parsed.success) return err(parsed.error.errors[0].message);

    const { nuevaPassword } = parsed.data;

    const [u] = await db.select().from(usuario)
      .where(eq(usuario.id, session.idUsuario)).limit(1);

    if (!u) return err("Usuario no encontrado", 404);
    if (!u.primerLogin) return err("Esta cuenta ya fue activada.", 400);

    // Debe tener al menos un contacto verificado para llegar aquí
    if (!u.correoVerificado && !u.celularVerificado) {
      return err("Debes verificar un método de contacto primero.", 400);
    }

    // No permitir que sea igual al CI
    if (nuevaPassword === u.ci) {
      return err("Tu contraseña no puede ser tu número de CI.");
    }

    const hash = await hashPassword(nuevaPassword);
    await db.update(usuario)
      .set({ passwordHash: hash, primerLogin: false })
      .where(eq(usuario.id, u.id));

    // Refrescar sesión con primerLogin actualizado
    const token = await signToken({
      idUsuario:         u.id,
      ci:                u.ci ?? "",
      correo:            u.correo,
      rol:               u.rol,
      idEgresado:        u.idEgresado,
      correoVerificado:  u.correoVerificado,
      celularVerificado: u.celularVerificado,
    });
    setSession(token);

    return ok({ redirigir: u.rol === "admin" ? "/dashboard" : "/mi-perfil" });
  } catch (e) {
    console.error("[activar-sin-codigo]", e);
    return err("Error al activar la cuenta", 500);
  }
}