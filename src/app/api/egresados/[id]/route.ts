import { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { egresado, planEstudios, historialLaboral } from "@/lib/schema";
import { eq } from "drizzle-orm";
import { getSession } from "@/lib/auth";
import { egresadoSchema } from "@/lib/validations";
import { ok, err } from "@/lib/utils";

export async function GET(_: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await getSession();
    if (!session) return err("No autorizado", 401);

    const id = parseInt(params.id);
    if (isNaN(id)) return err("ID inválido");

    // Egresado solo puede ver su propio perfil
    if (session.rol === "egresado" && session.idEgresado !== id)
      return err("No autorizado", 403);

    const [eg] = await db.select({
      id: egresado.id, nombres: egresado.nombres, apellidos: egresado.apellidos,
      ci: egresado.ci, telefono: egresado.telefono, direccion: egresado.direccion,
      fechaNacimiento: egresado.fechaNacimiento, fechaGraduacion: egresado.fechaGraduacion,
      fechaRegistro: egresado.fechaRegistro, idPlan: egresado.idPlan,
      nombrePlan: planEstudios.nombre,
    })
    .from(egresado)
    .leftJoin(planEstudios, eq(egresado.idPlan, planEstudios.id))
    .where(eq(egresado.id, id)).limit(1);

    if (!eg) return err("Egresado no encontrado", 404);

    const historial = await db.select().from(historialLaboral)
      .where(eq(historialLaboral.idEgresado, id))
      .orderBy(historialLaboral.fechaInicio);

    return ok({ ...eg, historial });
  } catch (e) { console.error(e); return err("Error", 500); }
}

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await getSession();
    if (!session) return err("No autorizado", 401);

    const id = parseInt(params.id);
    if (isNaN(id)) return err("ID inválido");

    // Solo admin o el propio egresado pueden editar
    if (session.rol === "egresado" && session.idEgresado !== id)
      return err("No autorizado", 403);

    const parsed = egresadoSchema.safeParse(await req.json());
    if (!parsed.success) return err(parsed.error.errors[0].message);

    const d = parsed.data;
    const [updated] = await db.update(egresado).set({
      nombres: d.nombres, apellidos: d.apellidos, ci: d.ci,
      telefono: d.telefono ?? null, direccion: d.direccion ?? null,
      fechaNacimiento: d.fechaNacimiento, fechaGraduacion: d.fechaGraduacion,
      idPlan: d.idPlan,
    }).where(eq(egresado.id, id)).returning();

    if (!updated) return err("Egresado no encontrado", 404);
    return ok(updated);
  } catch (e: any) {
    console.error(e);
    if (e.code === "23505") return err("Ya existe un egresado con ese CI");
    return err("Error al actualizar", 500);
  }
}

export async function DELETE(_: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await getSession();
    if (!session || session.rol !== "admin") return err("No autorizado", 403);

    const id = parseInt(params.id);
    if (isNaN(id)) return err("ID inválido");

    const [deleted] = await db.delete(egresado).where(eq(egresado.id, id)).returning();
    if (!deleted) return err("Egresado no encontrado", 404);
    return ok({ message: "Eliminado correctamente" });
  } catch (e) { console.error(e); return err("Error al eliminar", 500); }
}
