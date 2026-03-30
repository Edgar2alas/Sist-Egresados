import { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { egresado, historialLaboral, planEstudios } from "@/lib/schema";
import { eq, ilike, and, or, sql } from "drizzle-orm";
import { getSession } from "@/lib/auth";
import { ok, err } from "@/lib/utils";
import * as XLSX from "xlsx";

export async function GET(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session || session.rol !== "admin") return err("No autorizado", 403);

    const sp       = new URL(req.url).searchParams;
    const anio     = sp.get("anioGraduacion");
    const idPlan   = sp.get("idPlan");
    const empleo   = sp.get("conEmpleo");
    const exportar = sp.get("exportar");   // "excel" | "json"

    // Construir filtros
    const conds: any[] = [];
    if (anio)   conds.push(sql`EXTRACT(YEAR FROM ${egresado.fechaGraduacion}) = ${parseInt(anio)}`);
    if (idPlan) conds.push(eq(egresado.idPlan, parseInt(idPlan)));
    if (empleo === "true")
      conds.push(sql`EXISTS(SELECT 1 FROM historial_laboral h WHERE h.id_egresado=${egresado.id} AND h.fecha_fin IS NULL)`);
    if (empleo === "false")
      conds.push(sql`NOT EXISTS(SELECT 1 FROM historial_laboral h WHERE h.id_egresado=${egresado.id} AND h.fecha_fin IS NULL)`);

    const where = conds.length > 0 ? and(...conds) : undefined;

    // Datos principales
    const rows = await db.select({
      id:              egresado.id,
      nombres:         egresado.nombres,
      apellidos:       egresado.apellidos,
      ci:              egresado.ci,
      telefono:        egresado.telefono,
      fechaGraduacion: egresado.fechaGraduacion,
      nombrePlan:      planEstudios.nombre,
      tieneEmpleo:     sql<boolean>`EXISTS(
        SELECT 1 FROM historial_laboral h
        WHERE h.id_egresado=${egresado.id} AND h.fecha_fin IS NULL
      )`,
    })
    .from(egresado)
    .leftJoin(planEstudios, eq(egresado.idPlan, planEstudios.id))
    .where(where)
    .orderBy(egresado.apellidos);

    // ── Exportar Excel ──────────────────────────────────────────────────────
    if (exportar === "excel") {
      const excelRows = rows.map(r => ({
        "Nombres":          r.nombres,
        "Apellidos":        r.apellidos,
        "CI":               r.ci,
        "Teléfono":         r.telefono ?? "",
        "Fecha Graduación": r.fechaGraduacion,
        "Plan de Estudios": r.nombrePlan ?? "",
        "Tiene Empleo":     r.tieneEmpleo ? "Sí" : "No",
      }));

      const wb  = XLSX.utils.book_new();
      const ws  = XLSX.utils.json_to_sheet(excelRows);
      ws["!cols"] = [
        {wch:20},{wch:20},{wch:12},{wch:14},{wch:16},{wch:25},{wch:12},
      ];
      XLSX.utils.book_append_sheet(wb, ws, "Egresados");
      const buf  = XLSX.write(wb, { type:"buffer", bookType:"xlsx" });
      const fecha = new Date().toISOString().split("T")[0];
      return new Response(buf, {
        headers: {
          "Content-Type":        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
          "Content-Disposition": `attachment; filename="egresados_${fecha}.xlsx"`,
        },
      });
    }

    // ── Estadísticas para gráficos ─────────────────────────────────────────
    const [porAnio, porPlan, empleabilidad] = await Promise.all([
      db.execute(sql`
        SELECT EXTRACT(YEAR FROM fecha_graduacion)::int AS anio, COUNT(*)::int AS cantidad
        FROM egresado GROUP BY anio ORDER BY anio
      `),
      db.execute(sql`
        SELECT p.nombre AS plan, COUNT(e.id)::int AS cantidad
        FROM plan_estudios p LEFT JOIN egresado e ON e.id_plan = p.id
        GROUP BY p.nombre ORDER BY cantidad DESC
      `),
      db.execute(sql`
        SELECT
          EXTRACT(YEAR FROM e.fecha_graduacion)::int AS anio,
          COUNT(DISTINCT e.id)::int AS total,
          COUNT(DISTINCT CASE WHEN h.fecha_fin IS NULL THEN e.id END)::int AS "conEmpleo"
        FROM egresado e
        LEFT JOIN historial_laboral h ON h.id_egresado = e.id
        GROUP BY anio ORDER BY anio
      `),
    ]);

    return ok({
      filas:         rows,
      total:         rows.length,
      conEmpleo:     rows.filter(r => r.tieneEmpleo).length,
      sinEmpleo:     rows.filter(r => !r.tieneEmpleo).length,
      porAnio:       porAnio.rows,
      porPlan:       porPlan.rows,
      empleabilidad: empleabilidad.rows,
    });
  } catch (e) { console.error(e); return err("Error en reportes", 500); }
}
