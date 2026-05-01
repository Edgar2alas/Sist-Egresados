import { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { usuario } from "@/lib/schema";
import { eq } from "drizzle-orm";
import { validarToken, consumirToken } from "@/lib/tokens";
import { hashPassword, signToken, setSession, getSession } from "@/lib/auth";
import { ok, err } from "@/lib/utils";
import { z } from "zod";

const schema = z.object({
  codigo:            z.string().length(6, "El código debe tener 6 dígitos"),
  nuevaPassword:     z.string()
    .min(8, "Mínimo 8 caracteres")
    .regex(/[A-Z]/, "Debe contener al menos una mayúscula")
    .regex(/[a-z]/, "Debe contener al menos una minúscula")
    .regex(/[0-9]/, "Debe contener al menos un número"),
  confirmarPassword: z.string(),
  tipo:              z.enum(["primer_login", "reset_password"]),
  // Para reset_password desde la pantalla pública (sin sesión)
  ci:                z.string().optional(),
  // Para elegir canal cuando tiene ambos
  canal:             z.enum(["correo", "celular"]).optional(),
}).refine(d => d.nuevaPassword === d.confirmarPassword, {
  message: "Las contraseñas no coinciden",
  path: ["confirmarPassword"],
});

export async function POST(req: NextRequest) {
  try {
    const parsed = schema.safeParse(await req.json());
    if (!parsed.success) return err(parsed.error.errors[0].message);

    const { codigo, nuevaPassword, tipo, ci: ciParam } = parsed.data;

    // Obtener usuario — por sesión o por CI (reset)
    let u: any;
    if (tipo === "primer_login") {
      const session = await getSession();
      if (!session) return err("No autorizado", 401);
      const [found] = await db.select().from(usuario).where(eq(usuario.id, session.idUsuario)).limit(1);
      u = found;
    } else {
      if (!ciParam) return err("CI requerido para reset");
      const [found] = await db.select().from(usuario).where(eq(usuario.ci, ciParam)).limit(1);
      u = found;
    }

    if (!u) return err("Usuario no encontrado", 404);
    if (u.estado !== "activo") return err("Cuenta inactiva", 403);

    const { valido, error } = await validarToken({ idUsuario: u.id, codigo, tipo });
    if (!valido) return err(error ?? "Código inválido");

    // No permitir que la nueva contraseña sea el CI
    if (nuevaPassword === u.ci) {
      return err("Tu nueva contraseña no puede ser tu número de CI.");
    }

    const hash = await hashPassword(nuevaPassword);
    await db.update(usuario)
      .set({ passwordHash: hash, primerLogin: false })
      .where(eq(usuario.id, u.id));

    await consumirToken({ idUsuario: u.id, codigo, tipo });

    if (tipo === "primer_login") {
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
    }

    return ok({ mensaje: "Contraseña actualizada correctamente. Inicia sesión." });
  } catch (e) {
    console.error("[cambiar-password]", e);
    return err("Error al cambiar la contraseña", 500);
  }
}