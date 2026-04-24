import { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { postgrado, egresado } from "@/lib/schema";
import { eq, sql } from "drizzle-orm";
import { getSession } from "@/lib/auth";
import { ok, err } from "@/lib/utils";

export async function GET(_: NextRequest) {
  try {
    const session = await getSession();
    if (!session || session.rol !== "admin") return err("No autorizado", 403);

    const pendientes = await db.select({
      id:                postgrado.id,
      tipo:              postgrado.tipo,
      institucion:       postgrado.institucion,
      pais:              postgrado.pais,
      anioInicio:        postgrado.anioInicio,
      anioFin:           postgrado.anioFin,
      estado:            postgrado.estado,
      verificacionEstado:postgrado.verificacionEstado,
      documentoNombre:   postgrado.documentoNombre,
      documentoTipo:     postgrado.documentoTipo,
      documentoSubidoEn: postgrado.documentoSubidoEn,
      esSolicitudCambio: postgrado.esSolicitudCambio,
      datosPropuestos:   postgrado.datosPropuestos,
      egresadoId:        egresado.id,
      nombres:           egresado.nombres,
      apellidos:         egresado.apellidos,
      apellidoPaterno:   egresado.apellidoPaterno,
      ci:                egresado.ci,
    })
    .from(postgrado)
    .innerJoin(egresado, eq(postgrado.idEgresado, egresado.id))
    .where(eq(postgrado.verificacionEstado, "pendiente"))
    .orderBy(postgrado.documentoSubidoEn);

    return ok(pendientes);
  } catch (e) { console.error(e); return err("Error", 500); }
}