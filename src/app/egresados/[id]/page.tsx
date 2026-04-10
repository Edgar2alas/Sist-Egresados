import { notFound, redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { db } from "@/lib/db";
import { egresado, historialLaboral } from "@/lib/schema";
import { eq } from "drizzle-orm";
import Link from "next/link";
import { ArrowLeft, Pencil, Phone, MapPin, Calendar, Briefcase, Building2, GraduationCap } from "lucide-react";
import AdminLayout from "@/components/shared/AdminLayout";
import { cn, fmtDate } from "@/lib/utils";

export default async function EgresadoDetallePage({ params }: { params: { id: string } }) {
  const session = await getSession();
  if (!session || session.rol !== "admin") redirect("/login");

  const id = parseInt(params.id);
  if (isNaN(id)) notFound();

  const [eg] = await db.select().from(egresado).where(eq(egresado.id, id)).limit(1);
  if (!eg) notFound();

  const historial = await db.select()
    .from(historialLaboral)
    .where(eq(historialLaboral.idEgresado, id))
    .orderBy(historialLaboral.fechaInicio);

  const empleoActual = historial.find(h => h.fechaFin === null);

  return (
    <AdminLayout correo={session.correo}>
      <div className="space-y-6 animate-fade-up">
        <div className="flex items-center gap-3">
          <Link href="/egresados" className="btn-ghost btn-sm">
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <Link href={`/egresados/${id}/editar`} className="btn-slate btn-sm ml-auto">
            <Pencil className="w-3.5 h-3.5" /> Editar
          </Link>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="space-y-4">
            {/* Datos personales */}
            <div className="card text-center">
              <div className="w-20 h-20 rounded-2xl bg-primary-600/20 border-2 border-primary-500/30
                              flex items-center justify-center mx-auto mb-4">
                <span className="text-primary-300 text-2xl font-bold">
                  {(eg.apellidoPaterno ?? eg.apellidos)[0]}{eg.nombres[0]}
                </span>
              </div>
              <h2 className="text-white font-bold text-lg">
                {eg.apellidoPaterno ?? eg.apellidos}{eg.apellidoMaterno ? ` ${eg.apellidoMaterno}` : ""}, {eg.nombres}
              </h2>
              <p className="text-slate-500 text-sm mt-1">CI: {eg.ci}</p>
              {eg.genero && <p className="text-slate-600 text-xs mt-0.5">{eg.genero}</p>}
              <div className="mt-3">
                <span className={cn("badge", empleoActual ? "badge-green" : "badge-slate")}>
                  {empleoActual ? "Empleado actualmente" : "Sin empleo actual"}
                </span>
              </div>
            </div>

            {/* Contacto */}
            <div className="card space-y-3">
              <p className="text-slate-500 text-xs uppercase tracking-widest font-semibold">Contacto</p>
              {(eg.celular ?? eg.telefono) && (
                <div className="flex gap-3 text-sm">
                  <Phone className="w-4 h-4 text-slate-500 mt-0.5 shrink-0" />
                  <span className="text-slate-300">{eg.celular ?? eg.telefono}</span>
                </div>
              )}
              {eg.correoElectronico && (
                <div className="flex gap-3 text-sm">
                  <span className="text-slate-500 text-xs mt-0.5">✉</span>
                  <span className="text-slate-300 text-sm">{eg.correoElectronico}</span>
                </div>
              )}
              {eg.direccion && (
                <div className="flex gap-3 text-sm">
                  <MapPin className="w-4 h-4 text-slate-500 mt-0.5 shrink-0" />
                  <span className="text-slate-300">{eg.direccion}</span>
                </div>
              )}
              <div className="flex gap-3 text-sm">
                <Calendar className="w-4 h-4 text-slate-500 mt-0.5 shrink-0" />
                <span className="text-slate-300">{fmtDate(eg.fechaNacimiento)}</span>
              </div>
            </div>

            {/* Académico */}
            <div className="card space-y-2">
              <p className="text-slate-500 text-xs uppercase tracking-widest font-semibold">Académico</p>
              {eg.planEstudiosNombre && (
                <p className="text-slate-300 text-sm">
                  <span className="text-slate-500">Plan: </span>Plan {eg.planEstudiosNombre}
                </p>
              )}
              {eg.modalidadTitulacion && (
                <p className="text-slate-300 text-sm">
                  <span className="text-slate-500">Modalidad: </span>{eg.modalidadTitulacion}
                </p>
              )}
              {eg.anioTitulacion && (
                <p className="text-slate-300 text-sm">
                  <span className="text-slate-500">Año titulación: </span>{eg.anioTitulacion}
                </p>
              )}
              {eg.anioIngreso && (
                <p className="text-slate-300 text-sm">
                  <span className="text-slate-500">Ingreso: </span>
                  {eg.anioIngreso}{eg.semestreIngreso ? `-${eg.semestreIngreso}` : ""}
                </p>
              )}
              {eg.anioEgreso && (
                <p className="text-slate-300 text-sm">
                  <span className="text-slate-500">Egreso: </span>
                  {eg.anioEgreso}{eg.semestreEgreso ? `-${eg.semestreEgreso}` : ""}
                </p>
              )}
              <p className="text-slate-600 text-xs mt-2">
                Registrado: {fmtDate(eg.fechaRegistro?.toISOString())}
              </p>
            </div>
          </div>

          {/* Historial laboral */}
          <div className="lg:col-span-2">
            <div className="card">
              <div className="flex items-center justify-between mb-5">
                <div>
                  <h3 className="text-white font-bold">Historial Laboral</h3>
                  <p className="text-slate-500 text-xs mt-0.5">{historial.length} registro(s)</p>
                </div>
              </div>

              {historial.length === 0 ? (
                <div className="text-center py-10">
                  <Briefcase className="w-8 h-8 text-slate-700 mx-auto mb-2" />
                  <p className="text-slate-600 text-sm">Sin historial laboral registrado</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {historial.map(h => (
                    <div key={h.id} className={cn("rounded-xl p-4 border",
                      h.fechaFin === null
                        ? "bg-emerald-500/5 border-emerald-500/20"
                        : "bg-slate-800/40 border-slate-700/50")}>
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex gap-3">
                          <div className="w-9 h-9 bg-slate-700 rounded-xl flex items-center justify-center shrink-0">
                            <Building2 className="w-4 h-4 text-slate-400" />
                          </div>
                          <div>
                            <p className="text-white font-semibold text-sm">{h.cargo}</p>
                            <p className="text-slate-400 text-sm">{h.empresa}</p>
                            <div className="flex gap-2 mt-0.5 flex-wrap">
                              {h.area && <p className="text-slate-600 text-xs">{h.area}</p>}
                              {h.ciudad && <p className="text-slate-600 text-xs">· {h.ciudad}</p>}
                              {h.sector && <p className="text-slate-600 text-xs">· {h.sector}</p>}
                            </div>
                          </div>
                        </div>
                        <div className="text-right shrink-0">
                          {h.fechaFin === null
                            ? <span className="badge badge-green">Actual</span>
                            : <span className="badge badge-slate">Finalizado</span>}
                          <p className="text-slate-600 text-xs mt-1.5">
                            {fmtDate(h.fechaInicio)} — {h.fechaFin ? fmtDate(h.fechaFin) : "presente"}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
