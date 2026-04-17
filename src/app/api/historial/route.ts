// src/app/api/historial/route.ts
import { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { historialLaboral } from "@/lib/schema";
import { eq, desc } from "drizzle-orm";
import { getSession } from "@/lib/auth";
import { ok, err } from "@/lib/utils";
import { z } from "zod";

const historialFormSchema = z.object({
  idEgresado:         z.number().int().positive(),
  empresa:            z.string().min(2).max(150),
  cargo:              z.string().min(2).max(100),
  area:               z.string().max(100).optional().nullable(),
  tipoContrato:       z.enum(["Indefinido","Fijo","Por obra","Consultor","Pasante","Otro"]).optional().nullable(),
  ciudad:             z.string().max(100).optional().nullable(),
  sector:             z.enum(["Publico","Privado","Independiente","ONG","Otro"]).optional().nullable(),
  ingresoAproximado:  z.number().positive().optional().nullable(),
  fechaInicio:        z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  fechaFin:           z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional().nullable(),
  actualmenteTrabaja: z.boolean().default(false),
});

export async function GET(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session) return err("No autorizado", 401);

    const idEgresado = parseInt(new URL(req.url).searchParams.get("idEgresado") ?? "");
    if (isNaN(idEgresado)) return err("idEgresado requerido");

    if (session.rol === "egresado" && session.idEgresado !== idEgresado)
      return err("No autorizado", 403);

    // Excluir el binario del documento en el GET (pesado, innecesario)
    const rows = await db.select({
      id:                  historialLaboral.id,
      idEgresado:          historialLaboral.idEgresado,
      empresa:             historialLaboral.empresa,
      cargo:               historialLaboral.cargo,
      area:                historialLaboral.area,
      fechaInicio:         historialLaboral.fechaInicio,
      fechaFin:            historialLaboral.fechaFin,
      tipoContrato:        historialLaboral.tipoContrato,
      ciudad:              historialLaboral.ciudad,
      sector:              historialLaboral.sector,
      ingresoAproximado:   historialLaboral.ingresoAproximado,
      verificacionEstado:  historialLaboral.verificacionEstado,
      documentoNombre:     historialLaboral.documentoNombre,
      documentoTipo:       historialLaboral.documentoTipo,
      documentoSubidoEn:   historialLaboral.documentoSubidoEn,
      verificadoEn:        historialLaboral.verificadoEn,
      rechazoMotivo:       historialLaboral.rechazoMotivo,
      ultimaActualizacion: historialLaboral.ultimaActualizacion,
      creadoEn:            historialLaboral.creadoEn,
    })
    .from(historialLaboral)
    .where(eq(historialLaboral.idEgresado, idEgresado))
    .orderBy(desc(historialLaboral.fechaInicio));

    return ok(rows);
  } catch (e) { console.error(e); return err("Error", 500); }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session) return err("No autorizado", 401);

    // Leer como FormData para soportar archivo
    const formData = await req.formData();

    // Extraer campos de texto
    const raw = {
      idEgresado:         parseInt(formData.get("idEgresado") as string),
      empresa:            formData.get("empresa") as string,
      cargo:              formData.get("cargo") as string,
      area:               formData.get("area") as string || null,
      tipoContrato:       formData.get("tipoContrato") as string || null,
      ciudad:             formData.get("ciudad") as string || null,
      sector:             formData.get("sector") as string || null,
      ingresoAproximado:  formData.get("ingresoAproximado")
        ? parseFloat(formData.get("ingresoAproximado") as string)
        : null,
      fechaInicio:        formData.get("fechaInicio") as string,
      fechaFin:           formData.get("fechaFin") as string || null,
      actualmenteTrabaja: formData.get("actualmenteTrabaja") === "true",
    };

    const parsed = historialFormSchema.safeParse(raw);
    if (!parsed.success) return err(parsed.error.errors[0].message);

    const d = parsed.data;
    if (session.rol === "egresado" && session.idEgresado !== d.idEgresado)
      return err("No autorizado", 403);

    const fechaFin = d.actualmenteTrabaja ? null : (d.fechaFin ?? null);

    // Procesar documento si se adjuntó
    const archivo = formData.get("documento") as File | null;
    let docBinario: Buffer | null = null;
    let docNombre: string | null = null;
    let docTipo: string | null = null;
    let docSubidoEn: Date | null = null;
    let verificacionEstado: "pendiente" | null = null;

    if (archivo && archivo.size > 0) {
      // Validar tipo (solo PDF e imágenes)
      const tiposPermitidos = ["application/pdf", "image/jpeg", "image/png", "image/webp"];
      if (!tiposPermitidos.includes(archivo.type)) {
        return err("Solo se permiten archivos PDF, JPG, PNG o WEBP");
      }
      // Validar tamaño (máx 5MB)
      if (archivo.size > 5 * 1024 * 1024) {
        return err("El archivo no puede superar los 5MB");
      }
      const arrayBuffer = await archivo.arrayBuffer();
      docBinario = Buffer.from(arrayBuffer);
      docNombre = archivo.name;
      docTipo = archivo.type;
      docSubidoEn = new Date();
      verificacionEstado = "pendiente";
    }

    const [row] = await db.insert(historialLaboral).values({
      idEgresado:         d.idEgresado,
      empresa:            d.empresa,
      cargo:              d.cargo,
      area:               d.area ?? null,
      tipoContrato:       (d.tipoContrato as any) ?? null,
      ciudad:             d.ciudad ?? null,
      sector:             (d.sector as any) ?? null,
      ingresoAproximado:  d.ingresoAproximado != null ? String(d.ingresoAproximado) : null,
      fechaInicio:        d.fechaInicio,
      fechaFin,
      verificacionEstado,
      documentoBinario:   docBinario,
      documentoNombre:    docNombre,
      documentoTipo:      docTipo,
      documentoSubidoEn:  docSubidoEn,
    }).returning({
      id:                 historialLaboral.id,
      empresa:            historialLaboral.empresa,
      cargo:              historialLaboral.cargo,
      verificacionEstado: historialLaboral.verificacionEstado,
    });

    return ok(row, 201);
  } catch (e) { console.error(e); return err("Error al crear historial", 500); }
}
