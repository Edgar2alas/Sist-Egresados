// src/app/directorio/page.tsx
import { db } from "@/lib/db";
import { egresado } from "@/lib/schema";
import { eq, sql, ilike, and, or } from "drizzle-orm";
import PublicLayout from "@/components/shared/PublicLayout";
import DirectorioClient from "@/components/directorio/DirectorioClient";

// Next.js requiere que searchParams extienda Record<string, string | undefined>
interface SP extends Record<string, string | undefined> {
  busqueda?: string;
  plan?:     string;
  sector?:   string;
  ciudad?:   string;
  page?:     string;
}

async function getEgresados(sp: SP) {
  const pageSize = 18;
  const page     = Math.max(1, parseInt(sp.page ?? "1"));

  const conds: any[] = [eq(egresado.mostrarEnDirectorio, true)];

  if (sp.busqueda) conds.push(or(
    ilike(egresado.nombres,   `%${sp.busqueda}%`),
    ilike(egresado.apellidos, `%${sp.busqueda}%`),
  ));
  if (sp.plan) conds.push(ilike(egresado.planEstudiosNombre, `%${sp.plan}%`));
  if (sp.sector)
    conds.push(sql`EXISTS(
      SELECT 1 FROM historial_laboral h
      WHERE h.id_egresado=${egresado.id}
        AND h.sector::text = ${sp.sector}
        AND h.fecha_fin IS NULL
    )`);
  if (sp.ciudad)
    conds.push(sql`EXISTS(
      SELECT 1 FROM historial_laboral h
      WHERE h.id_egresado=${egresado.id}
        AND LOWER(h.ciudad) = LOWER(${sp.ciudad})
        AND h.fecha_fin IS NULL
    )`);

  const where = and(...conds);

  const [{ total }] = await db
    .select({ total: sql<number>`count(*)::int` })
    .from(egresado).where(where);

  const rows = await db.select({
    id:                 egresado.id,
    nombres:            egresado.nombres,
    apellidos:          egresado.apellidos,
    apellidoPaterno:    egresado.apellidoPaterno,
    apellidoMaterno:    egresado.apellidoMaterno,
    tituloAcademico:    egresado.tituloAcademico,
    planEstudiosNombre: egresado.planEstudiosNombre,
    anioTitulacion:     egresado.anioTitulacion,
    correoElectronico:  egresado.correoElectronico,
    celular:            egresado.celular,
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
    sectorActual: sql<string | null>`(
      SELECT h.sector::text
      FROM historial_laboral h
      WHERE h.id_egresado = ${egresado.id} AND h.fecha_fin IS NULL
      ORDER BY h.fecha_inicio DESC LIMIT 1
    )`,
    ultimaActualizacion: egresado.ultimaActualizacion,
  })
  .from(egresado).where(where)
  .orderBy(sql`${egresado.ultimaActualizacion} DESC NULLS LAST`)
  .limit(pageSize).offset((page - 1) * pageSize);

  return { rows, total, page, totalPages: Math.ceil(total / pageSize) };
}

export default async function DirectorioPage({
  searchParams,
}: {
  searchParams: SP;
}) {
  const { rows, total, page, totalPages } = await getEgresados(searchParams);

  return (
    <PublicLayout>
      <DirectorioClient
        egresados={rows}
        total={total}
        page={page}
        totalPages={totalPages}
        searchParams={searchParams}
      />
    </PublicLayout>
  );
}
