import { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { usuario } from "@/lib/schema";
import { eq } from "drizzle-orm";
import { getSession } from "@/lib/auth";
import { crearToken, getDatosUsuarioParaEmail } from "@/lib/tokens";
import { sendPrimerLoginEmail } from "@/lib/email";
import { ok, err } from "@/lib/utils";

export async function POST(_: NextRequest) {
  try {
    const session = await getSession();
    if (!session) return err("No autorizado", 401);

    const [u] = await db.select().from(usuario).where(eq(usuario.id, session.idUsuario)).limit(1);
    if (!u) return err("Usuario no encontrado", 404);

    if (!u.correoVerificado && !u.celularVerificado) {
      return err("Debes verificar al menos un método de contacto primero.", 400);
    }

    const datos  = await getDatosUsuarioParaEmail(u.id);
    const nombres = datos?.nombres ?? "Egresado";
    const codigo  = await crearToken({ idUsuario: u.id, tipo: "primer_login" });

    if (u.correoVerificado && u.correo) {
      await sendPrimerLoginEmail({ to: u.correo, nombres, codigo });
    } else if (u.celularVerificado && u.celular) {
      console.log(`\n${"=".repeat(50)}\n📱 [SMS DEV] Celular: ${u.celular} | Código: ${codigo}\n${"=".repeat(50)}\n`);
    }

    return ok({ mensaje: "Código enviado." });
  } catch (e) {
    console.error("[solicitar-codigo-activacion]", e);
    return err("Error al enviar código", 500);
  }
}