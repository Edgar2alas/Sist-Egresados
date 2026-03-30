import { getSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { egresado, planEstudios } from "@/lib/schema";
import { eq, ilike, and, or, sql } from "drizzle-orm";
import Link from "next/link";
import { Plus, Search, Eye, Pencil, Trash2 } from "lucide-react";
import AdminLayout from "@/components/shared/AdminLayout";
import BuscadorEgresados from "@/components/egresados/BuscadorEgresados";
import EliminarEgresadoBtn from "@/components/egresados/EliminarEgresadoBtn";
import { cn, fmtDate } from "@/lib/utils";

interface SP extends Record<string, string | undefined> {
  busqueda?: string; idPlan?: string;
  anioGraduacion?: string; conEmpleo?: string; page?: string;
}

async function getData(sp: SP) {
  const conds: any[] = [];
  const b = sp.busqueda;
  if (b) conds.push(or(
    ilike(egresado.nombres,   `%${b}%`),
    ilike(egresado.apellidos, `%${b}%`),
    ilike(egresado.ci,        `%${b}%`),
  ));
  if (sp.idPlan)          conds.push(eq(egresado.idPlan, parseInt(sp.idPlan)));
  if (sp.anioGraduacion)  conds.push(sql`EXTRACT(YEAR FROM ${egresado.fechaGraduacion}) = ${parseInt(sp.anioGraduacion)}`);
  if (sp.conEmpleo === "true")
    conds.push(sql`EXISTS(SELECT 1 FROM historial_laboral h WHERE h.id_egresado=${egresado.id} AND h.fecha_fin IS NULL)`);
  if (sp.conEmpleo === "false")
    conds.push(sql`NOT EXISTS(SELECT 1 FROM historial_laboral h WHERE h.id_egresado=${egresado.id} AND h.fecha_fin IS NULL)`);

  const where    = conds.length > 0 ? and(...conds) : undefined;
  const page     = Math.max(1, parseInt(sp.page ?? "1"));
  const pageSize = 12;

  const [{ total }] = await db.select({ total: sql<number>`count(*)::int` })
    .from(egresado).where(where);

  const rows = await db.select({
    id: egresado.id, nombres: egresado.nombres, apellidos: egresado.apellidos,
    ci: egresado.ci, fechaGraduacion: egresado.fechaGraduacion,
    nombrePlan: planEstudios.nombre,
    tieneEmpleo: sql<boolean>`EXISTS(
      SELECT 1 FROM historial_laboral h
      WHERE h.id_egresado=${egresado.id} AND h.fecha_fin IS NULL
    )`,
  })
  .from(egresado)
  .leftJoin(planEstudios, eq(egresado.idPlan, planEstudios.id))
  .where(where)
  .orderBy(egresado.apellidos)
  .limit(pageSize).offset((page - 1) * pageSize);

  const planes = await db.select({ id: planEstudios.id, nombre: planEstudios.nombre })
    .from(planEstudios).orderBy(planEstudios.anioAprobacion);

  return { rows, total, page, pageSize, totalPages: Math.ceil(total / pageSize), planes };
}

export default async function EgresadosPage({ searchParams }: { searchParams: SP }) {
  const session = await getSession();
  if (!session || session.rol !== "admin") redirect("/login");

  const { rows, total, page, totalPages, planes } = await getData(searchParams);

  return (
    <AdminLayout correo={session.correo}>
      <div className="page">
        {/* Header */}
        <div className="page-header">
          <div>
            <h1 className="page-title">Egresados</h1>
            <p className="page-sub">{total} egresado(s) encontrado(s)</p>
          </div>
          <Link href="/egresados/nuevo" className="btn-primary btn-sm">
            <Plus className="w-3.5 h-3.5" /> Nuevo Egresado
          </Link>
        </div>

        {/* Buscador + filtros */}
        <BuscadorEgresados planes={planes} searchParams={searchParams} />

        {/* Tabla */}
        {rows.length === 0 ? (
          <div className="card text-center py-16">
            <Search className="w-10 h-10 text-slate-700 mx-auto mb-3" />
            <p className="text-slate-400 font-semibold">Sin resultados</p>
            <p className="text-slate-600 text-sm mt-1">Prueba con otros filtros</p>
          </div>
        ) : (
          <div className="tbl-wrap">
            <table className="tbl">
              <thead>
                <tr>
                  <th>Nombres y Apellidos</th>
                  <th>CI</th>
                  <th>Plan de Estudios</th>
                  <th>Fecha Graduación</th>
                  <th>Empleo</th>
                  <th className="text-right">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {rows.map(r => (
                  <tr key={r.id}>
                    <td>
                      <p className="text-white font-medium">{r.apellidos}, {r.nombres}</p>
                    </td>
                    <td className="font-mono text-slate-400 text-sm">{r.ci}</td>
                    <td className="text-slate-500 text-sm max-w-[180px] truncate">
                      {r.nombrePlan ?? "—"}
                    </td>
                    <td className="text-slate-400 text-sm">{fmtDate(r.fechaGraduacion)}</td>
                    <td>
                      <span className={cn("badge", r.tieneEmpleo ? "badge-green" : "badge-slate")}>
                        {r.tieneEmpleo ? "Empleado" : "Sin empleo"}
                      </span>
                    </td>
                    <td>
                      <div className="flex items-center justify-end gap-1.5">
                        <Link href={`/egresados/${r.id}`} className="btn-ghost btn-xs">
                          <Eye className="w-3.5 h-3.5" /> Ver
                        </Link>
                        <Link href={`/egresados/${r.id}/editar`} className="btn-slate btn-xs">
                          <Pencil className="w-3 h-3" /> Editar
                        </Link>
                        <EliminarEgresadoBtn id={r.id} nombre={`${r.nombres} ${r.apellidos}`} />
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Paginación */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between text-sm">
            <p className="text-slate-500">Página {page} de {totalPages}</p>
            <div className="flex gap-2">
              {page > 1 && (
                <Link href={`?${new URLSearchParams({ ...searchParams, page: String(page - 1) })}`}
                  className="btn-slate btn-xs">← Anterior</Link>
              )}
              {page < totalPages && (
                <Link href={`?${new URLSearchParams({ ...searchParams, page: String(page + 1) })}`}
                  className="btn-slate btn-xs">Siguiente →</Link>
              )}
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
