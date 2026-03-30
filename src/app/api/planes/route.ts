import { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { planEstudios, egresado } from "@/lib/schema";
import { eq, sql } from "drizzle-orm";
import { getSession } from "@/lib/auth";
import { planSchema } from "@/lib/validations";
import { ok, err } from "@/lib/utils";

export async function GET() {
  try {
    const session = await getSession();
    if (!session) return err("No autorizado", 401);

    const rows = await db.select({
      id:             planEstudios.id,
      nombre:         planEstudios.nombre,
      anioAprobacion: planEstudios.anioAprobacion,
      descripcion:    planEstudios.descripcion,
      estado:         planEstudios.estado,
      totalEgresados: sql<number>`(
        SELECT COUNT(*)::int FROM egresado e WHERE e.id_plan = ${planEstudios.id}
      )`,
    }).from(planEstudios).orderBy(planEstudios.anioAprobacion);

    return ok(rows);
  } catch (e) { console.error(e); return err("Error", 500); }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session || session.rol !== "admin") return err("No autorizado", 403);

    const parsed = planSchema.safeParse(await req.json());
    if (!parsed.success) return err(parsed.error.errors[0].message);

    const d = parsed.data;
    const [row] = await db.insert(planEstudios).values({
      nombre: d.nombre, anioAprobacion: d.anioAprobacion,
      descripcion: d.descripcion ?? null, estado: d.estado,
    }).returning();

    return ok(row, 201);
  } catch (e) { console.error(e); return err("Error al crear plan", 500); }
}
