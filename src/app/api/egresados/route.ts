import { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { egresado, planEstudios, historialLaboral } from "@/lib/schema";
import { eq, ilike, and, or, sql, desc } from "drizzle-orm";
import { getSession } from "@/lib/auth";
import { egresadoSchema } from "@/lib/validations";
import { ok, err } from "@/lib/utils";

export async function GET(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session || session.rol !== "admin") return err("No autorizado", 403);

    const sp       = new URL(req.url).searchParams;
    const busqueda = sp.get("busqueda") ?? "";
    const idPlan   = sp.get("idPlan");
    const anio     = sp.get("anioGraduacion");
    const empleo   = sp.get("conEmpleo");
    const page     = Math.max(1, parseInt(sp.get("page") ?? "1"));
    const pageSize = 12;

    const conds: any[] = [];
    if (busqueda) conds.push(or(
      ilike(egresado.nombres,   `%${busqueda}%`),
      ilike(egresado.apellidos, `%${busqueda}%`),
      ilike(egresado.ci,        `%${busqueda}%`),
    ));
    if (idPlan) conds.push(eq(egresado.idPlan, parseInt(idPlan)));
    if (anio)   conds.push(sql`EXTRACT(YEAR FROM ${egresado.fechaGraduacion}) = ${parseInt(anio)}`);
    if (empleo === "true")
      conds.push(sql`EXISTS(SELECT 1 FROM historial_laboral h WHERE h.id_egresado=${egresado.id} AND h.fecha_fin IS NULL)`);
    if (empleo === "false")
      conds.push(sql`NOT EXISTS(SELECT 1 FROM historial_laboral h WHERE h.id_egresado=${egresado.id} AND h.fecha_fin IS NULL)`);

    const where = conds.length > 0 ? and(...conds) : undefined;

    const [{ total }] = await db
      .select({ total: sql<number>`count(*)::int` })
      .from(egresado).where(where);

    const rows = await db.select({
      id:              egresado.id,
      nombres:         egresado.nombres,
      apellidos:       egresado.apellidos,
      ci:              egresado.ci,
      telefono:        egresado.telefono,
      fechaGraduacion: egresado.fechaGraduacion,
      idPlan:          egresado.idPlan,
      nombrePlan:      planEstudios.nombre,
      tieneEmpleo:     sql<boolean>`EXISTS(
        SELECT 1 FROM historial_laboral h
        WHERE h.id_egresado=${egresado.id} AND h.fecha_fin IS NULL
      )`,
    })
    .from(egresado)
    .leftJoin(planEstudios, eq(egresado.idPlan, planEstudios.id))
    .where(where)
    .orderBy(desc(egresado.fechaRegistro))
    .limit(pageSize).offset((page - 1) * pageSize);

    return Response.json({ data: rows, total, page, pageSize, totalPages: Math.ceil(total / pageSize) });
  } catch (e) { console.error(e); return err("Error al obtener egresados", 500); }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session || session.rol !== "admin") return err("No autorizado", 403);

    const parsed = egresadoSchema.safeParse(await req.json());
    if (!parsed.success) return err(parsed.error.errors[0].message);

    const d = parsed.data;
    const [row] = await db.insert(egresado).values({
      nombres: d.nombres, apellidos: d.apellidos, ci: d.ci,
      telefono: d.telefono ?? null, direccion: d.direccion ?? null,
      fechaNacimiento: d.fechaNacimiento, fechaGraduacion: d.fechaGraduacion,
      idPlan: d.idPlan,
    }).returning();

    return ok(row, 201);
  } catch (e: any) {
    console.error(e);
    if (e.code === "23505") return err("Ya existe un egresado con ese CI");
    return err("Error al crear egresado", 500);
  }
}
