import { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { egresado } from "@/lib/schema";
import { and, sql, ilike } from "drizzle-orm";
import { getSession } from "@/lib/auth";
import { ok, err } from "@/lib/utils";
import * as XLSX from "xlsx";

export async function GET(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session || session.rol !== "admin") return err("No autorizado", 403);

    const sp       = new URL(req.url).searchParams;
    const anio     = sp.get("anioEgreso");
    const plan     = sp.get("plan");
    const empleo   = sp.get("conEmpleo");
    const genero   = sp.get("genero");
    const exportar = sp.get("exportar");

    const conds: any[] = [];
    if (anio)   conds.push(sql`${egresado.anioEgreso} = ${parseInt(anio)}`);
    if (plan)   conds.push(ilike(egresado.planEstudiosNombre, `%${plan}%`));
    if (genero) conds.push(sql`${egresado.genero} = ${genero}`);
    if (empleo === "true")
      conds.push(sql`EXISTS(SELECT 1 FROM historial_laboral h WHERE h.id_egresado=${egresado.id} AND h.fecha_fin IS NULL)`);
    if (empleo === "false")
      conds.push(sql`NOT EXISTS(SELECT 1 FROM historial_laboral h WHERE h.id_egresado=${egresado.id} AND h.fecha_fin IS NULL)`);

    const where = conds.length > 0 ? and(...conds) : undefined;

    const rows = await db.select({
      id:                  egresado.id,
      nombres:             egresado.nombres,
      apellidos:           egresado.apellidos,
      apellidoPaterno:     egresado.apellidoPaterno,
      apellidoMaterno:     egresado.apellidoMaterno,
      ci:                  egresado.ci,
      celular:             egresado.celular,
      correoElectronico:   egresado.correoElectronico,
      genero:              egresado.genero,
      planEstudiosNombre:  egresado.planEstudiosNombre,
      modalidadTitulacion: egresado.modalidadTitulacion,
      anioTitulacion:      egresado.anioTitulacion,
      anioEgreso:          egresado.anioEgreso,
      tieneEmpleo: sql<boolean>`EXISTS(
        SELECT 1 FROM historial_laboral h
        WHERE h.id_egresado=${egresado.id} AND h.fecha_fin IS NULL
      )`,
    })
    .from(egresado)
    .where(where)
    .orderBy(egresado.apellidos);

    // ── Exportar Excel ──────────────────────────────────────────────────────
    if (exportar === "excel") {
      const excelRows = rows.map(r => ({
        "Nombres":              r.nombres,
        "Apellido Paterno":     r.apellidoPaterno ?? r.apellidos,
        "Apellido Materno":     r.apellidoMaterno ?? "",
        "CI":                   r.ci,
        "Correo":               r.correoElectronico ?? "",
        "Celular":              r.celular ?? "",
        "Género":               r.genero ?? "",
        "Plan de Estudios":     r.planEstudiosNombre ? `Plan ${r.planEstudiosNombre}` : "",
        "Modalidad Titulación": r.modalidadTitulacion ?? "",
        "Año Titulación":       r.anioTitulacion ?? "",
        "Año Egreso":           r.anioEgreso ?? "",
        "Tiene Empleo":         r.tieneEmpleo ? "Sí" : "No",
      }));

      const wb  = XLSX.utils.book_new();
      const ws  = XLSX.utils.json_to_sheet(excelRows);
      ws["!cols"] = [
        {wch:20},{wch:20},{wch:20},{wch:12},{wch:28},{wch:14},
        {wch:12},{wch:18},{wch:20},{wch:14},{wch:12},{wch:12},
      ];
      XLSX.utils.book_append_sheet(wb, ws, "Egresados");
      const buf  = XLSX.write(wb, { type: "buffer", bookType: "xlsx" });
      const fecha = new Date().toISOString().split("T")[0];
      return new Response(buf, {
        headers: {
          "Content-Type":        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
          "Content-Disposition": `attachment; filename="egresados_${fecha}.xlsx"`,
        },
      });
    }

    // ── Estadísticas para gráficos ─────────────────────────────────────────
    const [porAnio, porPlan, porGenero, empleabilidad] = await Promise.all([
      db.execute(sql`
        SELECT anio_titulacion AS anio, COUNT(*)::int AS cantidad
        FROM egresado WHERE anio_titulacion IS NOT NULL
        GROUP BY anio_titulacion ORDER BY anio_titulacion
      `),
      db.execute(sql`
        SELECT
          COALESCE(plan_estudios_nombre, 'Sin especificar') AS plan,
          COUNT(*)::int AS cantidad
        FROM egresado
        GROUP BY plan_estudios_nombre ORDER BY cantidad DESC
      `),
      db.execute(sql`
        SELECT
          COALESCE(genero::text, 'Sin especificar') AS genero,
          COUNT(*)::int AS cantidad
        FROM egresado
        GROUP BY genero ORDER BY cantidad DESC
      `),
      db.execute(sql`
        SELECT
          anio_egreso AS anio,
          COUNT(DISTINCT e.id)::int AS total,
          COUNT(DISTINCT CASE WHEN h.fecha_fin IS NULL THEN e.id END)::int AS "conEmpleo"
        FROM egresado e
        LEFT JOIN historial_laboral h ON h.id_egresado = e.id
        WHERE e.anio_egreso IS NOT NULL
        GROUP BY anio_egreso ORDER BY anio_egreso
      `),
    ]);

    return ok({
      filas:         rows,
      total:         rows.length,
      conEmpleo:     rows.filter(r => r.tieneEmpleo).length,
      sinEmpleo:     rows.filter(r => !r.tieneEmpleo).length,
      porAnio:       porAnio.rows,
      porPlan:       porPlan.rows,
      porGenero:     porGenero.rows,
      empleabilidad: empleabilidad.rows,
    });
  } catch (e) {
    console.error("[reportes]", e);
    return err("Error en reportes", 500);
  }
}
