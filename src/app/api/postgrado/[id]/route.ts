// src/app/api/postgrado/[id]/route.ts
import { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { postgrado } from "@/lib/schema";
import { eq } from "drizzle-orm";
import { getSession } from "@/lib/auth";
import { postgradoSchema } from "@/lib/validations";
import { ok, err } from "@/lib/utils";

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await getSession();
    if (!session) return err("No autorizado", 401);

    const id = parseInt(params.id);
    if (isNaN(id)) return err("ID inválido");

    const parsed = postgradoSchema.safeParse(await req.json());
    if (!parsed.success) return err(parsed.error.errors[0].message);

    const d = parsed.data;

    if (session.rol === "egresado" && session.idEgresado !== d.idEgresado)
      return err("No autorizado", 403);

    const [updated] = await db.update(postgrado).set({
      tipo:        d.tipo,
      institucion: d.institucion,
      pais:        d.pais,
      anioInicio:  d.anioInicio,
      anioFin:     d.anioFin ?? null,
      estado:      d.estado,
    }).where(eq(postgrado.id, id)).returning();

    if (!updated) return err("Registro no encontrado", 404);
    return ok(updated);
  } catch (e) { console.error(e); return err("Error al actualizar", 500); }
}

export async function DELETE(_: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await getSession();
    if (!session) return err("No autorizado", 401);

    const id = parseInt(params.id);
    if (isNaN(id)) return err("ID inválido");

    // Verificar propiedad si es egresado
    if (session.rol === "egresado") {
      const [p] = await db.select().from(postgrado).where(eq(postgrado.id, id)).limit(1);
      if (!p || p.idEgresado !== session.idEgresado) return err("No autorizado", 403);
    }

    const [deleted] = await db.delete(postgrado).where(eq(postgrado.id, id)).returning();
    if (!deleted) return err("Registro no encontrado", 404);
    return ok({ message: "Eliminado" });
  } catch (e) { console.error(e); return err("Error al eliminar", 500); }
}
