import { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { usuario } from "@/lib/schema";
import { eq } from "drizzle-orm";
import { crearToken, crearTokenContacto, getDatosUsuarioParaEmail } from "@/lib/tokens";
import {
  sendPrimerLoginEmail,
  sendResetPasswordEmail,
  sendVerificacionContactoEmail,
} from "@/lib/email";
import { getSession } from "@/lib/auth";
import { ok, err } from "@/lib/utils";
import { z } from "zod";

const schema = z.discriminatedUnion("tipo", [
  z.object({
    tipo:   z.literal("reset_password"),
    ci:     z.string().min(4),
  }),
  z.object({
    tipo:   z.literal("verificar_correo"),
    correo: z.string().email(),
  }),
  z.object({
    tipo:    z.literal("verificar_celular"),
    celular: z.string().min(7),
  }),
]);

export async function POST(req: NextRequest) {
  try {
    const body   = await req.json();
    const parsed = schema.safeParse(body);
    if (!parsed.success) return err(parsed.error.errors[0].message);

    const d = parsed.data;

    // ── Reset password (por CI) ────────────────────────────────────────────
    if (d.tipo === "reset_password") {
      const [u] = await db
        .select()
        .from(usuario)
        .where(eq(usuario.ci, d.ci))
        .limit(1);

      // Respuesta genérica para no revelar si el CI existe
      if (!u) return ok({ mensaje: "Si el CI está registrado y tiene un método de contacto verificado, recibirás un código." });
      if (u.estado !== "activo") return err(`Tu cuenta está ${u.estado}.`, 403);

      // Verificar que tiene al menos un método de contacto verificado
      if (!u.correoVerificado && !u.celularVerificado) {
        return err("No tienes un método de contacto verificado. Contacta al administrador.", 400);
      }

      const datos  = await getDatosUsuarioParaEmail(u.id);
      const nombres = datos?.nombres ?? "Egresado";

      if (u.correoVerificado && u.celularVerificado) {
        // Tiene ambos — el cliente debe preguntar cuál prefiere
        return ok({ tieneAmbos: true, correoMask: maskEmail(u.correo), celularMask: maskCelular(u.celular) });
      }

      // Solo uno disponible — enviar directo
      const codigo = await crearToken({ idUsuario: u.id, tipo: "reset_password" });

      if (u.correoVerificado && u.correo) {
        await sendResetPasswordEmail({ to: u.correo, nombres, codigo });
      } else {
        // SMS en producción; consola en dev
        console.log(`\n${"=".repeat(50)}\n📱 [SMS DEV] Celular: ${u.celular} | Código: ${codigo}\n${"=".repeat(50)}\n`);
      }

      return ok({ mensaje: "Código enviado." });
    }

    // ── Verificar correo / celular (requiere sesión activa) ────────────────
    const session = await getSession();
    if (!session) return err("No autorizado", 401);

    if (d.tipo === "verificar_correo") {
      const datos  = await getDatosUsuarioParaEmail(session.idUsuario);
      const nombres = datos?.nombres ?? "Egresado";
      const codigo  = await crearTokenContacto({ idUsuario: session.idUsuario, tipo: "verificar_correo" });

      // Guardar el correo temporalmente en el usuario (sin verificar aún)
      await db.update(usuario)
        .set({ correo: d.correo })
        .where(eq(usuario.id, session.idUsuario));

      await sendVerificacionContactoEmail({ to: d.correo, nombres, codigo });
      return ok({ mensaje: "Código enviado al correo." });
    }

    if (d.tipo === "verificar_celular") {
      const codigo = await crearTokenContacto({ idUsuario: session.idUsuario, tipo: "verificar_celular" });

      await db.update(usuario)
        .set({ celular: d.celular })
        .where(eq(usuario.id, session.idUsuario));

      console.log(`\n${"=".repeat(50)}\n📱 [SMS DEV] Celular: ${d.celular} | Código: ${codigo}\n${"=".repeat(50)}\n`);
      return ok({ mensaje: "Código enviado al celular." });
    }

    return err("Tipo no válido");
  } catch (e) {
    console.error("[solicitar-codigo]", e);
    return err("Error al enviar el código.", 500);
  }
}

// Helpers para enmascarar datos
function maskEmail(email: string | null): string {
  if (!email) return "***";
  const [user, domain] = email.split("@");
  return `${user.slice(0, 2)}***@${domain}`;
}
function maskCelular(cel: string | null): string {
  if (!cel) return "***";
  return `****${cel.slice(-3)}`;
}