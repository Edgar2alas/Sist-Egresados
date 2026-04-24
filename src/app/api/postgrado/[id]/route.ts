import { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { postgrado } from "@/lib/schema";
import { eq } from "drizzle-orm";
import { getSession } from "@/lib/auth";
import { ok, err } from "@/lib/utils";
import { z } from "zod";

const editSchema = z.object({
  idEgresado:  z.number().int().positive(),
  tipo:        z.enum(["Diplomado", "Especialidad", "Maestria", "Doctorado", "Postdoctorado", "Otro"]),
  institucion: z.string().min(2).max(200),
  pais:        z.string().min(2).max(100),
  anioInicio:  z.number().int().min(1990),
  anioFin:     z.number().int().min(1990).optional().nullable(),
  estado:      z.enum(["En curso", "Finalizado", "Abandonado"]),
  // Si es admin aprobando directamente
  aprobarDirecto: z.boolean().optional(),
});

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await getSession();
    if (!session) return err("No autorizado", 401);

    const id = parseInt(params.id);
    if (isNaN(id)) return err("ID inválido");

    const body = await req.json();
    const parsed = editSchema.safeParse(body);
    if (!parsed.success) return err(parsed.error.errors[0].message);

    const d = parsed.data;

    if (session.rol === "egresado" && session.idEgresado !== d.idEgresado)
      return err("No autorizado", 403);

    const [existing] = await db.select().from(postgrado).where(eq(postgrado.id, id)).limit(1);
    if (!existing) return err("Registro no encontrado", 404);

    if (session.rol === "admin") {
      // Admin edita directamente sin flujo de aprobación
      const [updated] = await db.update(postgrado).set({
        tipo:               d.tipo,
        institucion:        d.institucion,
        pais:               d.pais,
        anioInicio:         d.anioInicio,
        anioFin:            d.anioFin ?? null,
        estado:             d.estado,
        verificacionEstado: null,
        datosPropuestos:    null,
        esSolicitudCambio:  false,
      }).where(eq(postgrado.id, id)).returning();
      return ok(updated);
    }

    // Egresado: crear solicitud de cambio pendiente de aprobación
    const datosPropuestos = JSON.stringify({
      tipo:        d.tipo,
      institucion: d.institucion,
      pais:        d.pais,
      anioInicio:  d.anioInicio,
      anioFin:     d.anioFin ?? null,
      estado:      d.estado,
    });

    const [updated] = await db.update(postgrado).set({
      verificacionEstado: "pendiente",
      esSolicitudCambio:  true,
      datosPropuestos,
    }).where(eq(postgrado.id, id)).returning();

    return ok({ ...updated, esSolicitudPendiente: true });
  } catch (e) { console.error(e); return err("Error al actualizar", 500); }
}

export async function DELETE(_: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await getSession();
    if (!session) return err("No autorizado", 401);

    const id = parseInt(params.id);
    if (isNaN(id)) return err("ID inválido");

    if (session.rol === "egresado") {
      const [p] = await db.select().from(postgrado).where(eq(postgrado.id, id)).limit(1);
      if (!p || p.idEgresado !== session.idEgresado) return err("No autorizado", 403);
    }

    const [deleted] = await db.delete(postgrado).where(eq(postgrado.id, id)).returning();
    if (!deleted) return err("Registro no encontrado", 404);
    return ok({ message: "Eliminado" });
  } catch (e) { console.error(e); return err("Error al eliminar", 500); }
}