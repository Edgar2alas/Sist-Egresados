import { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { postgrado } from "@/lib/schema";
import { eq } from "drizzle-orm";
import { getSession } from "@/lib/auth";
import { ok, err } from "@/lib/utils";
import { z } from "zod";

const schema = z.object({
  accion: z.enum(["aprobar", "rechazar"]),
  motivo: z.string().min(5).optional(),
});

// GET — descargar documento del postgrado
export async function GET(_: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await getSession();
    if (!session || session.rol !== "admin") return err("No autorizado", 403);

    const id = parseInt(params.id);
    if (isNaN(id)) return err("ID inválido");

    const [p] = await db.select({
      documentoBinario: postgrado.documentoBinario,
      documentoNombre:  postgrado.documentoNombre,
      documentoTipo:    postgrado.documentoTipo,
    }).from(postgrado).where(eq(postgrado.id, id)).limit(1);

    if (!p) return err("Registro no encontrado", 404);
    if (!p.documentoBinario) return err("Sin documento adjunto", 404);

    const body = new Uint8Array(p.documentoBinario);
    return new Response(body, {
      headers: {
        "Content-Type":        p.documentoTipo ?? "application/octet-stream",
        "Content-Disposition": `inline; filename="${p.documentoNombre ?? "documento"}"`,
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

    if (accion === "rechazar" && (!motivo || motivo.trim().length < 5))
      return err("Debes indicar el motivo del rechazo");

    const [p] = await db.select().from(postgrado).where(eq(postgrado.id, id)).limit(1);
    if (!p) return err("Registro no encontrado", 404);
    if (p.verificacionEstado !== "pendiente") return err("Este registro ya fue procesado");

    if (accion === "aprobar") {
      // Si es solicitud de cambio, aplicar los datos propuestos
      let updateData: any = {
        verificacionEstado: "aprobado",
        verificadoEn:       new Date(),
        rechazoMotivo:      null,
        documentoBinario:   null, // limpiar binario
        esSolicitudCambio:  false,
      };

      if (p.esSolicitudCambio && p.datosPropuestos) {
        try {
          const propuestos = JSON.parse(p.datosPropuestos);
          updateData = {
            ...updateData,
            tipo:            propuestos.tipo,
            institucion:     propuestos.institucion,
            pais:            propuestos.pais,
            anioInicio:      propuestos.anioInicio,
            anioFin:         propuestos.anioFin ?? null,
            estado:          propuestos.estado,
            datosPropuestos: null,
          };
        } catch { /* si falla el parse, igual aprobamos sin cambiar datos */ }
      }

      const [updated] = await db.update(postgrado).set(updateData)
        .where(eq(postgrado.id, id))
        .returning({ id: postgrado.id, verificacionEstado: postgrado.verificacionEstado });

      return ok(updated);
    }

    // Rechazar
    const [updated] = await db.update(postgrado).set({
      verificacionEstado: "rechazado",
      verificadoEn:       new Date(),
      rechazoMotivo:      motivo,
      datosPropuestos:    null,
      esSolicitudCambio:  false,
      documentoBinario:   null,
    }).where(eq(postgrado.id, id))
    .returning({ id: postgrado.id, verificacionEstado: postgrado.verificacionEstado });

    return ok(updated);
  } catch (e) { console.error(e); return err("Error al verificar", 500); }
}