import { getSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { egresado } from "@/lib/schema";
import { ilike, and, or, sql } from "drizzle-orm";
import Link from "next/link";
import { Plus, Search, Eye, Pencil } from "lucide-react";
import AdminLayout from "@/components/shared/AdminLayout";
import BuscadorEgresados from "@/components/egresados/BuscadorEgresados";
import EliminarEgresadoBtn from "@/components/egresados/EliminarEgresadoBtn";
import { cn, fmtDate } from "@/lib/utils";
import { PLANES_ESTUDIO } from "@/lib/schema";

interface SP {
  busqueda?:  string;
  plan?:      string;
  anioEgreso?: string;
  conEmpleo?: string;
  genero?:    string;
  page?:      string;
}

async function getData(sp: SP) {
  const conds: any[] = [];

  if (sp.busqueda) conds.push(or(
    ilike(egresado.nombres,   `%${sp.busqueda}%`),
    ilike(egresado.apellidos, `%${sp.busqueda}%`),
    ilike(egresado.ci,        `%${sp.busqueda}%`),
  ));
  if (sp.plan)       conds.push(ilike(egresado.planEstudiosNombre, `%${sp.plan}%`));
  if (sp.anioEgreso) conds.push(sql`${egresado.anioEgreso} = ${parseInt(sp.anioEgreso)}`);
  if (sp.genero)     conds.push(sql`${egresado.genero} = ${sp.genero}`);
  if (sp.conEmpleo === "true")
    conds.push(sql`EXISTS(SELECT 1 FROM historial_laboral h WHERE h.id_egresado=${egresado.id} AND h.fecha_fin IS NULL)`);
  if (sp.conEmpleo === "false")
    conds.push(sql`NOT EXISTS(SELECT 1 FROM historial_laboral h WHERE h.id_egresado=${egresado.id} AND h.fecha_fin IS NULL)`);

  const where    = conds.length > 0 ? and(...conds) : undefined;
  const page     = Math.max(1, parseInt(sp.page ?? "1"));
  const pageSize = 12;

  const [{ total }] = await db
    .select({ total: sql<number>`count(*)::int` })
    .from(egresado)
    .where(where);

  const rows = await db.select({
    id:                  egresado.id,
    nombres:             egresado.nombres,
    apellidos:           egresado.apellidos,
    apellidoPaterno:     egresado.apellidoPaterno,
    apellidoMaterno:     egresado.apellidoMaterno,
    ci:                  egresado.ci,
    anioTitulacion:      egresado.anioTitulacion,
    planEstudiosNombre:  egresado.planEstudiosNombre,
    modalidadTitulacion: egresado.modalidadTitulacion,
    genero:              egresado.genero,
    tieneEmpleo: sql<boolean>`EXISTS(
      SELECT 1 FROM historial_laboral h
      WHERE h.id_egresado=${egresado.id} AND h.fecha_fin IS NULL
    )`,
  })
  .from(egresado)
  .where(where)
  .orderBy(egresado.apellidos)
  .limit(pageSize)
  .offset((page - 1) * pageSize);

  return { rows, total, page, pageSize, totalPages: Math.ceil(total / pageSize) };
}

export default async function EgresadosPage({
  searchParams,
}: {
  searchParams: SP;
}) {
  const session = await getSession();
  if (!session || session.rol !== "admin") redirect("/login");

  const { rows, total, page, totalPages } = await getData(searchParams);

  return (
    <AdminLayout correo={session.correo}>
      <div className="page">
        <div className="page-header">
          <div>
            <h1 className="page-title">Egresados</h1>
            <p className="page-sub">{total} egresado(s) encontrado(s)</p>
          </div>
          <Link href="/egresados/nuevo" className="btn-primary btn-sm">
            <Plus className="w-3.5 h-3.5" /> Nuevo Egresado
          </Link>
        </div>

        <BuscadorEgresados planes={[...PLANES_ESTUDIO]} searchParams={searchParams} />

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
                  <th>Año Titulación</th>
                  <th>Empleo</th>
                  <th className="text-right">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {rows.map(r => (
                  <tr key={r.id}>
                    <td>
                      <p className="text-white font-medium">
                        {r.apellidoPaterno ?? r.apellidos}
                        {r.apellidoMaterno ? ` ${r.apellidoMaterno}` : ""}, {r.nombres}
                      </p>
                      {r.genero && <p className="text-slate-500 text-xs">{r.genero}</p>}
                    </td>
                    <td className="font-mono text-slate-400 text-sm">{r.ci}</td>
                    <td className="text-slate-500 text-sm">
                      {r.planEstudiosNombre ? `Plan ${r.planEstudiosNombre}` : "—"}
                    </td>
                    <td className="text-slate-400 text-sm">{r.anioTitulacion ?? "—"}</td>
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

        {totalPages > 1 && (
          <div className="flex items-center justify-between text-sm">
            <p className="text-slate-500">Página {page} de {totalPages}</p>
            <div className="flex gap-2">
              {page > 1 && (
                <Link
                  href={`?${new URLSearchParams({ ...searchParams, page: String(page - 1) })}`}
                  className="btn-slate btn-xs">← Anterior</Link>
              )}
              {page < totalPages && (
                <Link
                  href={`?${new URLSearchParams({ ...searchParams, page: String(page + 1) })}`}
                  className="btn-slate btn-xs">Siguiente →</Link>
              )}
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
