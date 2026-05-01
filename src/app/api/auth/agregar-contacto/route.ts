import { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { usuario } from "@/lib/schema";
import { eq } from "drizzle-orm";
import { crearToken } from "@/lib/tokens";
import { sendPrimerLoginEmail } from "@/lib/email";
import { ok, err } from "@/lib/utils";
import { z } from "zod";

const schema = z.object({
  idUsuario: z.number().int().positive(),
  correo:    z.string().email().optional(),
  celular:   z.string().min(7).max(20).optional(),
}).refine(d => d.correo || d.celular, {
  message: "Debes ingresar al menos un correo o celular",
});

export async function POST(req: NextRequest) {
  try {
    const parsed = schema.safeParse(await req.json());
    if (!parsed.success) return err(parsed.error.errors[0].message);

    const { idUsuario, correo, celular } = parsed.data;

    const [u] = await db.select().from(usuario).where(eq(usuario.id, idUsuario)).limit(1);
    if (!u) return err("Usuario no encontrado", 404);
    if (!u.primerLogin) return err("Esta cuenta ya fue activada", 400);

    // Actualizar correo y/o celular en el usuario
    const updates: any = {};
    if (correo) updates.correo = correo;
    if (celular) updates.celular = celular;

    await db.update(usuario).set(updates).where(eq(usuario.id, idUsuario));

    // Si hay correo, enviar código de verificación
    if (correo) {
      const codigo = await crearToken({ idUsuario, tipo: "primer_login" });
      // Obtener nombre del egresado si existe
      let nombres = correo.split("@")[0];
      if (u.idEgresado) {
        const { egresado } = await import("@/lib/schema");
        const [eg] = await db.select({ nombres: egresado.nombres })
          .from(egresado).where(eq(egresado.id, u.idEgresado)).limit(1);
        if (eg) nombres = eg.nombres;
      }
      await sendPrimerLoginEmail({ to: correo, nombres, codigo });
      return ok({ metodo: "correo", correo });
    }

    // Si solo hay celular (sin correo), en dev mostramos en consola
    if (celular) {
      const codigo = await crearToken({ idUsuario, tipo: "primer_login" });
      console.log("\n" + "=".repeat(60));
      console.log("📱 [SMS DEV MODE] — no se envió SMS real");
      console.log(`Para celular: ${celular}`);
      console.log(`Código:  >>>  ${codigo}  <<<`);
      console.log("=".repeat(60) + "\n");
      return ok({ metodo: "celular", celular });
    }

    return err("Sin método de contacto", 400);
  } catch (e) {
    console.error("[agregar-contacto]", e);
    return err("Error interno", 500);
  }
}