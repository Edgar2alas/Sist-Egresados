import { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { postgrado } from "@/lib/schema";
import { eq, desc } from "drizzle-orm";
import { getSession } from "@/lib/auth";
import { ok, err } from "@/lib/utils";
import { z } from "zod";

const postgradoFormSchema = z.object({
  idEgresado:  z.number().int().positive(),
  tipo:        z.enum(["Diplomado", "Especialidad", "Maestria", "Doctorado", "Postdoctorado", "Otro"]),
  institucion: z.string().min(2).max(200),
  pais:        z.string().min(2).max(100).default("Bolivia"),
  anioInicio:  z.number().int().min(1990).max(new Date().getFullYear() + 1),
  anioFin:     z.number().int().min(1990).optional().nullable(),
  estado:      z.enum(["En curso", "Finalizado", "Abandonado"]).default("En curso"),
});

export async function GET(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session) return err("No autorizado", 401);

    const idEgresado = parseInt(new URL(req.url).searchParams.get("idEgresado") ?? "");
    if (isNaN(idEgresado)) return err("idEgresado requerido");

    if (session.rol === "egresado" && session.idEgresado !== idEgresado)
      return err("No autorizado", 403);

    const rows = await db.select({
      id:                  postgrado.id,
      idEgresado:          postgrado.idEgresado,
      tipo:                postgrado.tipo,
      institucion:         postgrado.institucion,
      pais:                postgrado.pais,
      anioInicio:          postgrado.anioInicio,
      anioFin:             postgrado.anioFin,
      estado:              postgrado.estado,
      verificacionEstado:  postgrado.verificacionEstado,
      documentoNombre:     postgrado.documentoNombre,
      documentoTipo:       postgrado.documentoTipo,
      documentoSubidoEn:   postgrado.documentoSubidoEn,
      verificadoEn:        postgrado.verificadoEn,
      rechazoMotivo:       postgrado.rechazoMotivo,
      esSolicitudCambio:   postgrado.esSolicitudCambio,
      datosPropuestos:     postgrado.datosPropuestos,
      ultimaActualizacion: postgrado.ultimaActualizacion,
      creadoEn:            postgrado.creadoEn,
    })
    .from(postgrado)
    .where(eq(postgrado.idEgresado, idEgresado))
    .orderBy(desc(postgrado.anioInicio));

    return ok(rows);
  } catch (e) { console.error(e); return err("Error", 500); }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session) return err("No autorizado", 401);

    const formData = await req.formData();

    const raw = {
      idEgresado:  parseInt(formData.get("idEgresado") as string),
      tipo:        formData.get("tipo") as string,
      institucion: formData.get("institucion") as string,
      pais:        formData.get("pais") as string || "Bolivia",
      anioInicio:  parseInt(formData.get("anioInicio") as string),
      anioFin:     formData.get("anioFin") ? parseInt(formData.get("anioFin") as string) : null,
      estado:      formData.get("estado") as string || "En curso",
    };

    const parsed = postgradoFormSchema.safeParse(raw);
    if (!parsed.success) return err(parsed.error.errors[0].message);

    const d = parsed.data;

    if (session.rol === "egresado" && session.idEgresado !== d.idEgresado)
      return err("No autorizado", 403);

    // Procesar documento si se adjuntó
    const archivo = formData.get("documento") as File | null;
    let docBinario: Buffer | null = null;
    let docNombre: string | null = null;
    let docTipo: string | null = null;
    let docSubidoEn: Date | null = null;
    let verificacionEstado: string | null = null;

    if (archivo && archivo.size > 0) {
      const tiposPermitidos = ["application/pdf", "image/jpeg", "image/png", "image/webp"];
      if (!tiposPermitidos.includes(archivo.type))
        return err("Solo se permiten archivos PDF, JPG, PNG o WEBP");
      if (archivo.size > 5 * 1024 * 1024)
        return err("El archivo no puede superar los 5MB");
      const arrayBuffer = await archivo.arrayBuffer();
      docBinario    = Buffer.from(arrayBuffer);
      docNombre     = archivo.name;
      docTipo       = archivo.type;
      docSubidoEn   = new Date();
      verificacionEstado = "pendiente";
    }

    const [row] = await db.insert(postgrado).values({
      idEgresado:         d.idEgresado,
      tipo:               d.tipo,
      institucion:        d.institucion,
      pais:               d.pais,
      anioInicio:         d.anioInicio,
      anioFin:            d.anioFin ?? null,
      estado:             d.estado,
      verificacionEstado,
      documentoBinario:   docBinario,
      documentoNombre:    docNombre,
      documentoTipo:      docTipo,
      documentoSubidoEn:  docSubidoEn,
    }).returning();

    return ok(row, 201);
  } catch (e) { console.error(e); return err("Error al crear postgrado", 500); }
}