// src/app/api/egresados/destacados/route.ts
import { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { egresado } from "@/lib/schema";
import { eq, sql } from "drizzle-orm";
import { ok, err } from "@/lib/utils";

export async function GET(_: NextRequest) {
  try {
    const rows = await db.select({
      id:                 egresado.id,
      nombres:            egresado.nombres,
      apellidos:          egresado.apellidos,
      apellidoPaterno:    egresado.apellidoPaterno,
      apellidoMaterno:    egresado.apellidoMaterno,
      tituloAcademico:    egresado.tituloAcademico,
      planEstudiosNombre: egresado.planEstudiosNombre,
      empleoActual: sql<string | null>`(
        SELECT h.cargo || ' — ' || h.empresa
        FROM historial_laboral h
        WHERE h.id_egresado = ${egresado.id} AND h.fecha_fin IS NULL
        ORDER BY h.fecha_inicio DESC LIMIT 1
      )`,
      ciudadActual: sql<string | null>`(
        SELECT h.ciudad
        FROM historial_laboral h
        WHERE h.id_egresado = ${egresado.id} AND h.fecha_fin IS NULL
        ORDER BY h.fecha_inicio DESC LIMIT 1
      )`,
      ultimaActualizacion: egresado.ultimaActualizacion,
    })
    .from(egresado)
    .where(eq(egresado.mostrarEnDirectorio, true))
    // Más recientemente actualizados primero
    .orderBy(sql`${egresado.ultimaActualizacion} DESC NULLS LAST`)
    .limit(6);

    return ok(rows);
  } catch (e) {
    console.error("[destacados]", e);
    return err("Error", 500);
  }
}
