import { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { sugerencias } from "@/lib/schema";
import { eq, desc } from "drizzle-orm";
import { getSession } from "@/lib/auth";
import { sugerenciaSchema } from "@/lib/validations";
import { ok, err } from "@/lib/utils";

export async function GET(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session || session.rol !== "admin") return err("No autorizado", 403);

    const rows = await db.select({
      id:         sugerencias.id,
      tipo:       sugerencias.tipo,
      mensaje:    sugerencias.mensaje,
      esAnonima:  sugerencias.esAnonima,
      leida:      sugerencias.leida,
      creadoEn:   sugerencias.creadoEn,
      idEgresado: sugerencias.idEgresado,
    })
    .from(sugerencias)
    .orderBy(desc(sugerencias.creadoEn));

    return ok(rows);
  } catch (e) { console.error(e); return err("Error", 500); }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session || session.rol !== "egresado") return err("No autorizado", 403);

    const parsed = sugerenciaSchema.safeParse(await req.json());
    if (!parsed.success) return err(parsed.error.errors[0].message);

    const d = parsed.data;

    const [row] = await db.insert(sugerencias).values({
      idEgresado: d.esAnonima ? null : (session.idEgresado ?? null),
      tipo:       d.tipo,
      mensaje:    d.mensaje,
      esAnonima:  d.esAnonima,
      leida:      false,
    }).returning();

    return ok(row, 201);
  } catch (e) { console.error(e); return err("Error al enviar sugerencia", 500); }
}