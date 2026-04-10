// src/app/api/postgrado/route.ts
import { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { postgrado } from "@/lib/schema";
import { eq, desc } from "drizzle-orm";
import { getSession } from "@/lib/auth";
import { postgradoSchema } from "@/lib/validations";
import { ok, err } from "@/lib/utils";

export async function GET(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session) return err("No autorizado", 401);

    const idEgresado = parseInt(new URL(req.url).searchParams.get("idEgresado") ?? "");
    if (isNaN(idEgresado)) return err("idEgresado requerido");

    if (session.rol === "egresado" && session.idEgresado !== idEgresado)
      return err("No autorizado", 403);

    const rows = await db.select().from(postgrado)
      .where(eq(postgrado.idEgresado, idEgresado))
      .orderBy(desc(postgrado.anioInicio));

    return ok(rows);
  } catch (e) { console.error(e); return err("Error", 500); }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session) return err("No autorizado", 401);

    const parsed = postgradoSchema.safeParse(await req.json());
    if (!parsed.success) return err(parsed.error.errors[0].message);

    const d = parsed.data;

    if (session.rol === "egresado" && session.idEgresado !== d.idEgresado)
      return err("No autorizado", 403);

    const [row] = await db.insert(postgrado).values({
      idEgresado:  d.idEgresado,
      tipo:        d.tipo,
      institucion: d.institucion,
      pais:        d.pais,
      anioInicio:  d.anioInicio,
      anioFin:     d.anioFin ?? null,
      estado:      d.estado,
    }).returning();

    return ok(row, 201);
  } catch (e) { console.error(e); return err("Error al crear postgrado", 500); }
}
