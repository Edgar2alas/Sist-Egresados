import { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { egresado } from "@/lib/schema";
import { and, sql } from "drizzle-orm";
import { getSession } from "@/lib/auth";
import { ok, err } from "@/lib/utils";

export async function GET(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session || session.rol !== "admin") return err("No autorizado", 403);

    const sp                  = new URL(req.url).searchParams;
    const anioTitulacionDesde = sp.get("anioTitulacionDesde");
    const anioTitulacionHasta = sp.get("anioTitulacionHasta");
    const sector              = sp.get("sector");
    const modalidad           = sp.get("modalidad");
    const tipo                = sp.get("tipo");

    // Condiciones base para filtros (excluyendo fallecidos de stats activas)
    const filtroBase = (incluirFallecidos = false) => {
      const conds: any[] = [];
      if (!incluirFallecidos) conds.push(sql`${egresado.fallecido} = false`);
      if (anioTitulacionDesde) conds.push(sql`${egresado.anioTitulacion} >= ${parseInt(anioTitulacionDesde)}`);
      if (anioTitulacionHasta) conds.push(sql`${egresado.anioTitulacion} <= ${parseInt(anioTitulacionHasta)}`);
      if (tipo)     conds.push(sql`${egresado.tipo}::text = ${tipo}`);
      if (modalidad) conds.push(sql`${egresado.modalidadTitulacion}::text = ${modalidad}`);
      if (sector)
        conds.push(sql`EXISTS(SELECT 1 FROM historial_laboral h WHERE h.id_egresado=${egresado.id} AND h.sector::text = ${sector} AND h.fecha_fin IS NULL)`);
      return conds.length > 0 ? and(...conds) : undefined;
    };

    const [
      kpis,
      titulados_anio,
      por_sector,
      por_modalidad,
      geo_ciudad,
      geo_region,
      cohorte_comparativo,
    ] = await Promise.all([

      // ── KPIs ──────────────────────────────────────────────────────────────
      db.execute(sql`
        SELECT
          -- Totales (incluye fallecidos en el conteo total)
          (SELECT COUNT(*)::int FROM egresado WHERE tipo = 'Titulado') AS "totalTitulados",
          (SELECT COUNT(*)::int FROM egresado WHERE tipo = 'Egresado') AS "totalEgresados",
          -- Solo activos (no fallecidos) para empleabilidad
          (SELECT COUNT(*)::int FROM egresado WHERE tipo = 'Titulado' AND fallecido = false) AS "tituladosActivos",
          (SELECT COUNT(*)::int FROM egresado
           WHERE tipo = 'Titulado' AND fallecido = false
             AND EXISTS(SELECT 1 FROM historial_laboral h WHERE h.id_egresado=egresado.id AND h.fecha_fin IS NULL)
          ) AS "tituladosConEmpleo",
          -- Tiempo promedio egreso → titulación (en meses)
          (SELECT ROUND(AVG((anio_titulacion - anio_egreso) * 12)::numeric, 1)
           FROM egresado
           WHERE anio_titulacion IS NOT NULL AND anio_egreso IS NOT NULL
             AND anio_titulacion >= anio_egreso AND fallecido = false
          ) AS "tiempoPromedioTitulacion",
          -- Tiempo promedio inserción laboral (egreso → primer empleo, en meses)
          (SELECT ROUND(AVG(
            EXTRACT(YEAR FROM h.fecha_inicio::date) * 12 +
            EXTRACT(MONTH FROM h.fecha_inicio::date) -
            (e.anio_egreso * 12)
          )::numeric, 1)
           FROM egresado e
           INNER JOIN LATERAL (
             SELECT fecha_inicio FROM historial_laboral
             WHERE id_egresado = e.id ORDER BY fecha_inicio ASC LIMIT 1
           ) h ON true
           WHERE e.anio_egreso IS NOT NULL AND e.fallecido = false
             AND (EXTRACT(YEAR FROM h.fecha_inicio::date) * 12 + EXTRACT(MONTH FROM h.fecha_inicio::date))
                 >= e.anio_egreso * 12
          ) AS "tiempoPromedioInsercion",
          -- % titulados con empleo en sector público o privado (área estadística proxy)
          (SELECT COUNT(*)::int FROM egresado
           WHERE tipo = 'Titulado' AND fallecido = false
             AND EXISTS(
               SELECT 1 FROM historial_laboral h
               WHERE h.id_egresado = egresado.id AND h.fecha_fin IS NULL
             )
          ) AS "tituladosEmpleados"
      `),

      // ── Titulados por año (con filtro de rango) ───────────────────────────
      db.execute(sql`
        SELECT
          anio_titulacion AS anio,
          COUNT(*)::int AS total,
          COUNT(CASE WHEN tipo = 'Titulado' THEN 1 END)::int AS titulados,
          COUNT(CASE WHEN tipo = 'Egresado' THEN 1 END)::int AS egresados
        FROM egresado
        WHERE anio_titulacion IS NOT NULL AND fallecido = false
          ${anioTitulacionDesde ? sql`AND anio_titulacion >= ${parseInt(anioTitulacionDesde)}` : sql``}
          ${anioTitulacionHasta ? sql`AND anio_titulacion <= ${parseInt(anioTitulacionHasta)}` : sql``}
          ${tipo ? sql`AND tipo::text = ${tipo}` : sql``}
        GROUP BY anio_titulacion ORDER BY anio_titulacion
      `),

      // ── Distribución por sector laboral (empleo actual) ───────────────────
      db.execute(sql`
        SELECT
          COALESCE(h.sector::text, 'Sin especificar') AS sector,
          COUNT(DISTINCT e.id)::int AS cantidad
        FROM egresado e
        INNER JOIN historial_laboral h ON h.id_egresado = e.id AND h.fecha_fin IS NULL
        WHERE e.fallecido = false
          ${tipo ? sql`AND e.tipo::text = ${tipo}` : sql``}
        GROUP BY h.sector ORDER BY cantidad DESC
      `),

      // ── Distribución por modalidad de titulación ──────────────────────────
      db.execute(sql`
        SELECT
          COALESCE(modalidad_titulacion::text, 'Sin especificar') AS modalidad,
          COUNT(*)::int AS cantidad
        FROM egresado
        WHERE fallecido = false
          ${tipo ? sql`AND tipo::text = ${tipo}` : sql``}
        GROUP BY modalidad_titulacion ORDER BY cantidad DESC
      `),

      // ── Distribución geográfica — ciudad de trabajo ───────────────────────
      db.execute(sql`
        SELECT
          COALESCE(h.ciudad, 'Sin especificar') AS ciudad,
          COUNT(DISTINCT e.id)::int AS cantidad
        FROM egresado e
        INNER JOIN historial_laboral h ON h.id_egresado = e.id AND h.fecha_fin IS NULL
        WHERE e.fallecido = false AND h.ciudad IS NOT NULL AND h.ciudad != ''
          ${tipo ? sql`AND e.tipo::text = ${tipo}` : sql``}
        GROUP BY h.ciudad ORDER BY cantidad DESC LIMIT 15
      `),

      // ── Distribución geográfica — región/departamento de residencia ───────
      db.execute(sql`
        SELECT
          COALESCE(region_residencia, 'Sin especificar') AS region,
          COUNT(*)::int AS cantidad
        FROM egresado
        WHERE fallecido = false
          ${tipo ? sql`AND tipo::text = ${tipo}` : sql``}
        GROUP BY region_residencia ORDER BY cantidad DESC LIMIT 10
      `),

      // ── Tabla comparativa: Titulados vs Egresados por cohorte de ingreso ──
      db.execute(sql`
        SELECT
          anio_ingreso AS cohorte,
          COUNT(*)::int AS total,
          COUNT(CASE WHEN tipo = 'Titulado' THEN 1 END)::int AS titulados,
          COUNT(CASE WHEN tipo = 'Egresado' THEN 1 END)::int AS egresados,
          COUNT(CASE WHEN tipo = 'Titulado' AND EXISTS(
            SELECT 1 FROM historial_laboral h WHERE h.id_egresado = egresado.id AND h.fecha_fin IS NULL
          ) THEN 1 END)::int AS "tituladosConEmpleo",
          ROUND(
            100.0 * COUNT(CASE WHEN tipo = 'Titulado' THEN 1 END) /
            NULLIF(COUNT(*), 0), 1
          )::float AS "pctTitulados"
        FROM egresado
        WHERE anio_ingreso IS NOT NULL AND fallecido = false
          ${tipo ? sql`AND tipo::text = ${tipo}` : sql``}
        GROUP BY anio_ingreso ORDER BY anio_ingreso DESC LIMIT 20
      `),
    ]);

    const k = (kpis as any).rows?.[0] ?? {};
    const tituladosActivos = parseInt(k.tituladosActivos ?? 0);
    const tituladosConEmpleo = parseInt(k.tituladosConEmpleo ?? 0);
    const tasaEmpleabilidad = tituladosActivos > 0
      ? Math.round((tituladosConEmpleo / tituladosActivos) * 100)
      : 0;

    return ok({
      kpis: {
        totalTitulados:          parseInt(k.totalTitulados ?? 0),
        totalEgresados:          parseInt(k.totalEgresados ?? 0),
        tasaEmpleabilidadTitulados: tasaEmpleabilidad,
        tiempoPromedioTitulacion:  parseFloat(k.tiempoPromedioTitulacion ?? 0) || 0,
        tiempoPromedioInsercion:   parseFloat(k.tiempoPromedioInsercion ?? 0) || 0,
        tituladosConEmpleo,
        tituladosActivos,
      },
      graficos: {
        tituladosPorAnio:    (titulados_anio as any).rows ?? [],
        porSector:           (por_sector as any).rows ?? [],
        porModalidad:        (por_modalidad as any).rows ?? [],
        geoCiudad:           (geo_ciudad as any).rows ?? [],
        geoRegion:           (geo_region as any).rows ?? [],
        cohorteComparativo:  (cohorte_comparativo as any).rows ?? [],
      },
    });
  } catch (e) {
    console.error("[dashboard]", e);
    return err("Error al obtener datos del dashboard", 500);
  }
}