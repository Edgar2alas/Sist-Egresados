import { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { usuario } from "@/lib/schema";
import { eq } from "drizzle-orm";
import { verifyPassword, signToken, setSession } from "@/lib/auth";
import { loginSchema } from "@/lib/validations";
import { ok, err } from "@/lib/utils";
import { crearToken } from "@/lib/tokens";
import { sendPrimerLoginEmail } from "@/lib/email";
import { getDatosUsuarioParaEmail } from "@/lib/tokens";

export async function POST(req: NextRequest) {
  try {
    const body   = await req.json();
    const parsed = loginSchema.safeParse(body);
    if (!parsed.success) return err(parsed.error.errors[0].message);

    const { correo, password } = parsed.data;

    const [u] = await db
      .select()
      .from(usuario)
      .where(eq(usuario.correo, correo))
      .limit(1);

    if (!u)                    return err("Correo o contraseña incorrectos", 401);
    if (u.estado !== "activo") return err(`Tu cuenta está ${u.estado}.`, 403);

    const valid = await verifyPassword(password, u.passwordHash);
    if (!valid) return err("Correo o contraseña incorrectos", 401);

    // RF-10: Si es primer login, enviar código y redirigir a activar cuenta
    if (u.primerLogin) {
      try {
        const datos  = await getDatosUsuarioParaEmail(u.id);
        const nombres = datos?.nombres ?? correo.split("@")[0];
        const codigo  = await crearToken({ idUsuario: u.id, tipo: "primer_login" });
        await sendPrimerLoginEmail({ to: correo, nombres, codigo });
      } catch (emailErr) {
        // Si falla el correo, igual permitimos continuar (el código se muestra en consola en dev)
        console.error("[login] Error enviando email de activación:", emailErr);
      }
      return ok({ primerLogin: true, correo });
    }

    const token = await signToken({
      idUsuario:  u.id,
      correo:     u.correo,
      rol:        u.rol,
      idEgresado: u.idEgresado,
    });
    setSession(token);

    return ok({ rol: u.rol, idEgresado: u.idEgresado, primerLogin: false });
  } catch (e) {
    console.error("[login]", e);
    return err("Error interno del servidor", 500);
  }
}