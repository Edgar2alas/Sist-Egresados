import { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { usuario } from "@/lib/schema";
import { eq } from "drizzle-orm";
import { validarToken, consumirToken, crearToken } from "@/lib/tokens";
import { ok, err } from "@/lib/utils";
import { z } from "zod";

const schema = z.object({
  idUsuario: z.number().int().positive(),
  codigo:    z.string().length(6),
  metodo:    z.enum(["correo", "celular"]),
});

export async function POST(req: NextRequest) {
  try {
    const parsed = schema.safeParse(await req.json());
    if (!parsed.success) return err(parsed.error.errors[0].message);

    const { idUsuario, codigo, metodo } = parsed.data;

    const [u] = await db.select().from(usuario).where(eq(usuario.id, idUsuario)).limit(1);
    if (!u) return err("Usuario no encontrado", 404);

    const { valido, error } = await validarToken({ idUsuario, codigo, tipo: "primer_login" });
    if (!valido) return err(error ?? "Código inválido");

    // Marcar como verificado según el método
    const updates: any = {};
    if (metodo === "correo")  updates.correoVerificado  = true;
    if (metodo === "celular") updates.celularVerificado = true;

    await db.update(usuario).set(updates).where(eq(usuario.id, idUsuario));
    await consumirToken({ idUsuario, codigo, tipo: "primer_login" });

    return ok({ verificado: true, metodo });
  } catch (e) {
    console.error("[verificar-contacto]", e);
    return err("Error interno", 500);
  }
}