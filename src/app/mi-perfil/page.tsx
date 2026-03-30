import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { db } from "@/lib/db";
import { egresado, planEstudios, historialLaboral } from "@/lib/schema";
import { eq } from "drizzle-orm";
import Link from "next/link";
import {
  Pencil, GraduationCap, Briefcase, Plus,
} from "lucide-react";
import { fmtDate } from "@/lib/utils";
import MiPerfilHistorial from "@/components/perfil/MiPerfilHistorial";
import LogoutButton from "@/components/shared/LogoutButton";

export default async function MiPerfilPage() {
  const session = await getSession();
  if (!session || session.rol !== "egresado") redirect("/login");

  // Si no tiene egresado asociado → registro inicial
  if (!session.idEgresado) redirect("/registro-inicial");

  const [eg] = await db.select({
    id: egresado.id, nombres: egresado.nombres, apellidos: egresado.apellidos,
    ci: egresado.ci, telefono: egresado.telefono, direccion: egresado.direccion,
    fechaNacimiento: egresado.fechaNacimiento, fechaGraduacion: egresado.fechaGraduacion,
    idPlan: egresado.idPlan, nombrePlan: planEstudios.nombre,
  })
  .from(egresado)
  .leftJoin(planEstudios, eq(egresado.idPlan, planEstudios.id))
  .where(eq(egresado.id, session.idEgresado))
  .limit(1);

  if (!eg) redirect("/registro-inicial");

  const historial = await db.select().from(historialLaboral)
    .where(eq(historialLaboral.idEgresado, eg.id))
    .orderBy(historialLaboral.fechaInicio);

  const empleoActual = historial.find(h => h.fechaFin === null);

  return (
    <div className="min-h-screen bg-slate-950">
      {/* Top bar simple para egresado */}
      <header className="h-14 bg-slate-900/80 border-b border-slate-800 flex items-center justify-between px-6">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-primary-600/20 border border-primary-500/30 rounded-xl
                          flex items-center justify-center">
            <GraduationCap className="w-4 h-4 text-primary-400" />
          </div>
          <span className="text-white font-semibold text-sm">Mi Perfil</span>
        </div>
        <LogoutButton />
      </header>

      <main className="max-w-4xl mx-auto p-6 lg:p-8 space-y-6 animate-fade-up">
        {/* ── SECCIÓN: Datos personales ─────────────────────────────────── */}
        <div className="card">
          <div className="flex items-start justify-between mb-6">
            <div>
              <h2 className="text-xl font-bold text-white">Datos Personales</h2>
              <p className="text-slate-500 text-sm mt-0.5">Tu información registrada en el sistema</p>
            </div>
            <Link href="/editar-perfil" className="btn-slate btn-sm">
              <Pencil className="w-3.5 h-3.5" /> Editar datos
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4">
            <div>
              <p className="label">Nombres</p>
              <p className="text-white font-medium">{eg.nombres}</p>
            </div>
            <div>
              <p className="label">Apellidos</p>
              <p className="text-white font-medium">{eg.apellidos}</p>
            </div>
            <div>
              <p className="label">CI</p>
              <p className="text-white font-mono">{eg.ci}</p>
            </div>
            <div>
              <p className="label">Teléfono</p>
              <p className="text-slate-300">{eg.telefono ?? <span className="text-slate-600">No registrado</span>}</p>
            </div>
            <div className="md:col-span-2">
              <p className="label">Dirección</p>
              <p className="text-slate-300">{eg.direccion ?? <span className="text-slate-600">No registrada</span>}</p>
            </div>
            <div>
              <p className="label">Fecha de Nacimiento</p>
              <p className="text-slate-300">{fmtDate(eg.fechaNacimiento)}</p>
            </div>
            <div>
              <p className="label">Fecha de Graduación</p>
              <p className="text-slate-300">{fmtDate(eg.fechaGraduacion)}</p>
            </div>
            <div className="md:col-span-2">
              <p className="label">Plan de Estudios</p>
              <p className="text-slate-300">{eg.nombrePlan ?? "—"}</p>
            </div>
          </div>
        </div>

        {/* ── SECCIÓN: Historial laboral ────────────────────────────────── */}
        <div className="card">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h2 className="text-xl font-bold text-white">Historial Laboral</h2>
              <p className="text-slate-500 text-sm mt-0.5">{historial.length} experiencia(s) registrada(s)</p>
            </div>
            <Link href="/experiencia/nueva" className="btn-primary btn-sm">
              <Plus className="w-3.5 h-3.5" /> Agregar experiencia
            </Link>
          </div>

          {historial.length === 0 ? (
            <div className="text-center py-12 border border-dashed border-slate-800 rounded-xl">
              <Briefcase className="w-10 h-10 text-slate-700 mx-auto mb-3" />
              <p className="text-slate-400 font-semibold">Sin experiencias registradas</p>
              <p className="text-slate-600 text-sm mt-1">Agrega tu primera experiencia laboral</p>
              <Link href="/experiencia/nueva" className="btn-primary btn-sm mt-4 inline-flex">
                <Plus className="w-3.5 h-3.5" /> Agregar ahora
              </Link>
            </div>
          ) : (
            <MiPerfilHistorial historial={historial} idEgresado={eg.id} />
          )}
        </div>
      </main>
    </div>
  );
}
