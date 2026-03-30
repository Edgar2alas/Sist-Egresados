import { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { historialLaboral } from "@/lib/schema";
import { eq, desc } from "drizzle-orm";
import { getSession } from "@/lib/auth";
import { historialSchema } from "@/lib/validations";
import { ok, err } from "@/lib/utils";

export async function GET(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session) return err("No autorizado", 401);

    const idEgresado = parseInt(new URL(req.url).searchParams.get("idEgresado") ?? "");
    if (isNaN(idEgresado)) return err("idEgresado requerido");

    if (session.rol === "egresado" && session.idEgresado !== idEgresado)
      return err("No autorizado", 403);

    const rows = await db.select().from(historialLaboral)
      .where(eq(historialLaboral.idEgresado, idEgresado))
      .orderBy(desc(historialLaboral.fechaInicio));

    return ok(rows);
  } catch (e) { console.error(e); return err("Error", 500); }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session) return err("No autorizado", 401);

    const parsed = historialSchema.safeParse(await req.json());
    if (!parsed.success) return err(parsed.error.errors[0].message);

    const d = parsed.data;

    if (session.rol === "egresado" && session.idEgresado !== d.idEgresado)
      return err("No autorizado", 403);

    // Si actualmente trabaja → fecha_fin = NULL
    const fechaFin = d.actualmenteTrabaja ? null : (d.fechaFin ?? null);

    const [row] = await db.insert(historialLaboral).values({
      idEgresado:  d.idEgresado,
      empresa:     d.empresa,
      cargo:       d.cargo,
      area:        d.area ?? null,
      fechaInicio: d.fechaInicio,
      fechaFin,
    }).returning();

    return ok(row, 201);
  } catch (e) { console.error(e); return err("Error al crear historial", 500); }
}
