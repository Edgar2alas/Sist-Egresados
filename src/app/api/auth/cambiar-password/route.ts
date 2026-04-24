import { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { usuario } from "@/lib/schema";
import { eq } from "drizzle-orm";
import { validarToken, consumirToken } from "@/lib/tokens";
import { hashPassword, signToken, setSession } from "@/lib/auth";
import { ok, err } from "@/lib/utils";
import { z } from "zod";

const schema = z.object({
  correo:            z.string().email(),
  codigo:            z.string().length(6, "El código debe tener 6 dígitos"),
  nuevaPassword:     z.string()
    .min(8, "Mínimo 8 caracteres")
    .regex(/[A-Z]/, "Debe contener al menos una mayúscula")
    .regex(/[a-z]/, "Debe contener al menos una minúscula")
    .regex(/[0-9]/, "Debe contener al menos un número"),
  confirmarPassword: z.string(),
  tipo:              z.enum(["primer_login", "reset_password"]),
}).refine(d => d.nuevaPassword === d.confirmarPassword, {
  message: "Las contraseñas no coinciden",
  path: ["confirmarPassword"],
});

export async function POST(req: NextRequest) {
  try {
    const parsed = schema.safeParse(await req.json());
    if (!parsed.success) return err(parsed.error.errors[0].message);

    const { correo, codigo, nuevaPassword, tipo } = parsed.data;

    const [u] = await db
      .select()
      .from(usuario)
      .where(eq(usuario.correo, correo))
      .limit(1);

    if (!u) return err("Correo no encontrado", 404);
    if (u.estado !== "activo") return err("Cuenta inactiva", 403);

    const { valido, error } = await validarToken({ idUsuario: u.id, codigo, tipo });
    if (!valido) return err(error ?? "Código inválido");

    // Verificar que la nueva contraseña no sea la contraseña inicial (CI o CI+iniciales)
    if (u.idEgresado) {
      const { egresado: egresadoTable } = await import("@/lib/schema");
      const { generarPasswordInicial }  = await import("@/lib/utils");
      const { verifyPassword }          = await import("@/lib/auth");

      const [eg] = await db
        .select()
        .from(egresadoTable)
        .where(eq(egresadoTable.id, u.idEgresado))
        .limit(1);

      if (eg) {
        // No permitir que la nueva contraseña sea la contraseña inicial
        const passInicial = generarPasswordInicial(
          eg.ci, eg.nombres, eg.apellidoPaterno, eg.apellidoMaterno, eg.apellidos,
        );
        const esMismaInicial = await verifyPassword(nuevaPassword, await hashPassword(passInicial))
          .catch(() => false);
        // Comparación directa en texto plano (más eficiente)
        if (nuevaPassword === passInicial) {
          return err("Tu nueva contraseña no puede ser la contraseña inicial. Elige una diferente.");
        }
        // Tampoco puede ser solo el CI
        if (nuevaPassword === eg.ci) {
          return err("Tu nueva contraseña no puede ser tu número de CI.");
        }
      }
    }

    const hash = await hashPassword(nuevaPassword);
    await db
      .update(usuario)
      .set({ passwordHash: hash, primerLogin: false })
      .where(eq(usuario.id, u.id));

    await consumirToken({ idUsuario: u.id, codigo, tipo });

    if (tipo === "primer_login") {
      const token = await signToken({
        idUsuario:  u.id,
        correo:     u.correo,
        rol:        u.rol,
        idEgresado: u.idEgresado,
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