import { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { usuario } from "@/lib/schema";
import { eq } from "drizzle-orm";
import { crearToken, getDatosUsuarioParaEmail } from "@/lib/tokens";
import { sendResetPasswordEmail } from "@/lib/email";
import { ok, err } from "@/lib/utils";
import { z } from "zod";

const schema = z.object({
  ci:    z.string().min(4),
  canal: z.enum(["correo", "celular"]),
});

export async function POST(req: NextRequest) {
  try {
    const parsed = schema.safeParse(await req.json());
    if (!parsed.success) return err(parsed.error.errors[0].message);

    const { ci, canal } = parsed.data;

    const [u] = await db.select().from(usuario).where(eq(usuario.ci, ci)).limit(1);
    if (!u || u.estado !== "activo") return ok({ mensaje: "Código enviado si el CI está registrado." });

    const datos  = await getDatosUsuarioParaEmail(u.id);
    const nombres = datos?.nombres ?? "Egresado";
    const codigo  = await crearToken({ idUsuario: u.id, tipo: "reset_password" });

    if (canal === "correo" && u.correo && u.correoVerificado) {
      await sendResetPasswordEmail({ to: u.correo, nombres, codigo });
    } else if (canal === "celular" && u.celular && u.celularVerificado) {
      console.log(`\n${"=".repeat(50)}\n📱 [SMS DEV] Celular: ${u.celular} | Código: ${codigo}\n${"=".repeat(50)}\n`);
    } else {
      return err("Canal no disponible o no verificado.");
    }

    return ok({ mensaje: "Código enviado." });
  } catch (e) {
    console.error("[enviar-reset-canal]", e);
    return err("Error", 500);
  }
}