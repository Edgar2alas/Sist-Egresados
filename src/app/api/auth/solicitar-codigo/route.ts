import { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { usuario, egresado } from "@/lib/schema";
import { eq } from "drizzle-orm";
import { crearToken, getDatosUsuarioParaEmail } from "@/lib/tokens";
import { sendPrimerLoginEmail, sendResetPasswordEmail } from "@/lib/email";
import { ok, err } from "@/lib/utils";
import { z } from "zod";

const schema = z.object({
  correo: z.string().email("Correo inválido"),
  tipo:   z.enum(["primer_login", "reset_password"]),
});

export async function POST(req: NextRequest) {
  try {
    const parsed = schema.safeParse(await req.json());
    if (!parsed.success) return err(parsed.error.errors[0].message);

    const { correo, tipo } = parsed.data;

    // Buscar usuario por correo
    const [u] = await db
      .select()
      .from(usuario)
      .where(eq(usuario.correo, correo))
      .limit(1);

    // Respuesta genérica para no revelar si el correo existe o no
    if (!u) {
      return ok({ mensaje: "Si el correo está registrado, recibirás un código." });
    }

    if (u.estado !== "activo") {
      return err(`Tu cuenta está ${u.estado}. Contacta al administrador.`, 403);
    }

    // Para primer_login: verificar que realmente es su primer login
    if (tipo === "primer_login" && !u.primerLogin) {
      return err("Tu contraseña ya fue configurada. Usa 'Olvidé mi contraseña'.", 400);
    }

    // Obtener nombre para el email
    const datos = await getDatosUsuarioParaEmail(u.id);
    const nombres = datos?.nombres ?? correo.split("@")[0];

    // Crear token y enviar correo
    const codigo = await crearToken({ idUsuario: u.id, tipo });

    if (tipo === "primer_login") {
      await sendPrimerLoginEmail({ to: correo, nombres, codigo });
    } else {
      await sendResetPasswordEmail({ to: correo, nombres, codigo });
    }

    return ok({ mensaje: "Si el correo está registrado, recibirás un código." });
  } catch (e) {
    console.error("[solicitar-codigo]", e);
    return err("Error al enviar el código. Intenta de nuevo.", 500);
  }
}
