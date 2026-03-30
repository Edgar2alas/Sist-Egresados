import { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { planEstudios, egresado } from "@/lib/schema";
import { eq, sql } from "drizzle-orm";
import { getSession } from "@/lib/auth";
import { planSchema } from "@/lib/validations";
import { ok, err } from "@/lib/utils";

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await getSession();
    if (!session || session.rol !== "admin") return err("No autorizado", 403);
    const id = parseInt(params.id);
    if (isNaN(id)) return err("ID inválido");
    const parsed = planSchema.safeParse(await req.json());
    if (!parsed.success) return err(parsed.error.errors[0].message);
    const d = parsed.data;
    const [r] = await db.update(planEstudios).set({
      nombre: d.nombre, anioAprobacion: d.anioAprobacion,
      descripcion: d.descripcion ?? null, estado: d.estado,
    }).where(eq(planEstudios.id, id)).returning();
    if (!r) return err("Plan no encontrado", 404);
    return ok(r);
  } catch (e) { console.error(e); return err("Error", 500); }
}

export async function DELETE(_: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await getSession();
    if (!session || session.rol !== "admin") return err("No autorizado", 403);
    const id = parseInt(params.id);
    if (isNaN(id)) return err("ID inválido");
    const [{ count }] = await db.select({ count: sql<number>`count(*)::int` })
      .from(egresado).where(eq(egresado.idPlan, id));
    if (count > 0) return err(`No se puede eliminar: tiene ${count} egresado(s) asociado(s)`);
    const [r] = await db.delete(planEstudios).where(eq(planEstudios.id, id)).returning();
    if (!r) return err("Plan no encontrado", 404);
    return ok({ message: "Eliminado" });
  } catch (e) { console.error(e); return err("Error", 500); }
}
