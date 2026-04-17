// src/app/api/historial/[id]/verificar/route.ts
import { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { historialLaboral } from "@/lib/schema";
import { eq } from "drizzle-orm";
import { getSession } from "@/lib/auth";
import { ok, err } from "@/lib/utils";
import { z } from "zod";

const schema = z.object({
  accion:  z.enum(["aprobar", "rechazar"]),
  motivo:  z.string().min(5).optional(),
});

// GET — descargar el documento (solo admin)
export async function GET(_: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await getSession();
    if (!session || session.rol !== "admin") return err("No autorizado", 403);

    const id = parseInt(params.id);
    if (isNaN(id)) return err("ID inválido");

    const [h] = await db.select({
      documentoBinario: historialLaboral.documentoBinario,
      documentoNombre:  historialLaboral.documentoNombre,
      documentoTipo:    historialLaboral.documentoTipo,
    })
    .from(historialLaboral)
    .where(eq(historialLaboral.id, id))
    .limit(1);

    if (!h) return err("Registro no encontrado", 404);
    if (!h.documentoBinario) return err("Sin documento adjunto", 404);

    // Convertir Buffer a Uint8Array para que sea compatible con BodyInit
    const body = new Uint8Array(h.documentoBinario);

    return new Response(body, {
      headers: {
        "Content-Type":        h.documentoTipo ?? "application/octet-stream",
        "Content-Disposition": `inline; filename="${h.documentoNombre ?? "documento"}"`,
      },
    });
  } catch (e) { console.error(e); return err("Error", 500); }
}

// POST — aprobar o rechazar
export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await getSession();
    if (!session || session.rol !== "admin") return err("No autorizado", 403);

    const id = parseInt(params.id);
    if (isNaN(id)) return err("ID inválido");

    const parsed = schema.safeParse(await req.json());
    if (!parsed.success) return err(parsed.error.errors[0].message);

    const { accion, motivo } = parsed.data;

    if (accion === "rechazar" && (!motivo || motivo.trim().length < 5)) {
      return err("Debes indicar el motivo del rechazo (mínimo 5 caracteres)");
    }

    const [h] = await db.select({
      id:                 historialLaboral.id,
      verificacionEstado: historialLaboral.verificacionEstado,
    })
    .from(historialLaboral)
    .where(eq(historialLaboral.id, id))
    .limit(1);

    if (!h) return err("Registro no encontrado", 404);
    if (h.verificacionEstado !== "pendiente")
      return err("Este registro ya fue procesado");

    const [updated] = await db.update(historialLaboral).set({
      verificacionEstado: accion === "aprobar" ? "aprobado" : "rechazado",
      verificadoEn:       new Date(),
      rechazoMotivo:      accion === "rechazar" ? motivo : null,
      documentoBinario:   null, // Borrar binario al procesar
    })
    .where(eq(historialLaboral.id, id))
    .returning({
      id:                 historialLaboral.id,
      verificacionEstado: historialLaboral.verificacionEstado,
      verificadoEn:       historialLaboral.verificadoEn,
    });

    return ok(updated);
  } catch (e) { console.error(e); return err("Error al verificar", 500); }
}
