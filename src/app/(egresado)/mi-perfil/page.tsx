// src/app/(egresado)/mi-perfil/page.tsx
import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { db } from "@/lib/db";
import { egresado, historialLaboral, postgrado } from "@/lib/schema";
import { eq } from "drizzle-orm";
import Link from "next/link";
import { Pencil, Briefcase, Plus, BookOpen, GraduationCap, Clock } from "lucide-react";
import { fmtDate, fmtGestion } from "@/lib/utils";
import MiPerfilHistorial from "@/components/perfil/MiPerfilHistorial";
import MiPerfilPostgrados from "@/components/perfil/MiPerfilPostgrados";

function calcularTiempoPrimerEmpleo(
  anioRef: number | null | undefined,
  primerFecha: string | null | undefined,
): { texto: string } | null {
  if (!anioRef || !primerFecha) return null;
  const diff = new Date(primerFecha).getFullYear() - anioRef;
  if (diff < 0) return null;
  return { texto: diff === 0 ? "Menos de 1 año" : diff === 1 ? "1 año" : `${diff} años` };
}

export default async function MiPerfilPage() {
  const session = await getSession();
  if (!session || session.rol !== "egresado") redirect("/login");
  if (!session.idEgresado) redirect("/registro-inicial");

  const [eg] = await db.select().from(egresado)
    .where(eq(egresado.id, session.idEgresado)).limit(1);
  if (!eg) redirect("/registro-inicial");

  const [historial, postgrados] = await Promise.all([
    db.select().from(historialLaboral)
      .where(eq(historialLaboral.idEgresado, eg.id))
      .orderBy(historialLaboral.fechaInicio),
    db.select().from(postgrado)
      .where(eq(postgrado.idEgresado, eg.id))
      .orderBy(postgrado.anioInicio),
  ]);

  const primerEmpleo = historial.length > 0
    ? historial.reduce((a, b) => new Date(a.fechaInicio) < new Date(b.fechaInicio) ? a : b)
    : null;
  const tiempoPrimerEmpleo = calcularTiempoPrimerEmpleo(
    eg.anioTitulacion ?? eg.anioEgreso,
    primerEmpleo?.fechaInicio,
  );

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 space-y-6 animate-fade-up">

      {/* ── Encabezado de perfil ── */}
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-4">
          <div
            className="w-14 h-14 rounded-2xl flex items-center justify-center text-xl font-bold shrink-0"
            style={{ background: "var(--turquesa-light)", color: "var(--turquesa-dark)", fontFamily: "'Source Serif 4', serif" }}
          >
            {(eg.apellidoPaterno ?? eg.apellidos)[0]}{eg.nombres[0]}
          </div>
          <div>
            <h1 className="text-2xl font-bold" style={{ color: "var(--azul-pizarra)", fontFamily: "'Source Serif 4', serif" }}>
              {eg.apellidoPaterno ?? eg.apellidos}
              {eg.apellidoMaterno ? ` ${eg.apellidoMaterno}` : ""}, {eg.nombres}
            </h1>
            {eg.tituloAcademico && (
              <p className="text-sm mt-0.5" style={{ color: "var(--gris-grafito)" }}>{eg.tituloAcademico}</p>
            )}
          </div>
        </div>
        <Link href="/editar-perfil" className="btn-slate btn-sm">
          <Pencil className="w-3.5 h-3.5" /> Editar perfil
        </Link>
      </div>

      {/* ── Grid: datos personales + académicos ── */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

        {/* Datos personales */}
        <div className="card">
          <h2 className="text-base font-bold mb-4" style={{ color: "var(--azul-pizarra)", fontFamily: "'Source Serif 4', serif" }}>
            Datos Personales
          </h2>
          <div className="space-y-3">
            {[
              { label: "CI", value: eg.ci, mono: true },
              { label: "Celular", value: eg.celular ?? eg.telefono },
              { label: "Correo", value: eg.correoElectronico },
              { label: "Género", value: eg.genero },
              { label: "Dirección", value: eg.direccion },
              { label: "Nacimiento", value: fmtDate(eg.fechaNacimiento) },
            ].map(({ label, value, mono }) => value ? (
              <div key={label} className="flex items-start justify-between gap-4">
                <p className="text-xs font-semibold uppercase tracking-wide shrink-0" style={{ color: "var(--placeholder)" }}>
                  {label}
                </p>
                <p className={`text-sm text-right ${mono ? "font-mono" : ""}`} style={{ color: "var(--azul-pizarra)" }}>
                  {value}
                </p>
              </div>
            ) : null)}
          </div>
        </div>

        {/* Datos académicos */}
        <div className="card">
          <h2 className="text-base font-bold mb-4" style={{ color: "var(--azul-pizarra)", fontFamily: "'Source Serif 4', serif" }}>
            Datos Académicos
          </h2>
          <div className="space-y-3">
            {[
              { label: "Plan", value: eg.planEstudiosNombre ? `Plan ${eg.planEstudiosNombre}` : null },
              { label: "Ingreso", value: eg.anioIngreso ? String(eg.anioIngreso) : null },
              { label: "Egreso", value: eg.anioEgreso ? String(eg.anioEgreso) : null },
              { label: "Titulación", value: eg.anioTitulacion ? String(eg.anioTitulacion) : null },
              { label: "Modalidad", value: eg.modalidadTitulacion },
              { label: "Promedio", value: eg.promedio ? String(eg.promedio) : null },
              {
                label: "Permanencia",
                value: eg.anioIngreso && eg.anioEgreso
                  ? `${eg.anioEgreso - eg.anioIngreso} año(s)`
                  : null
              },
            ].map(({ label, value }) => value ? (
              <div key={label} className="flex items-start justify-between gap-4">
                <p className="text-xs font-semibold uppercase tracking-wide shrink-0" style={{ color: "var(--placeholder)" }}>
                  {label}
                </p>
                <p className="text-sm text-right" style={{ color: "var(--azul-pizarra)" }}>{value}</p>
              </div>
            ) : null)}

            {/* RF-07 */}
            {tiempoPrimerEmpleo && (
              <div
                className="mt-3 pt-3 flex items-center gap-2 rounded-xl px-3 py-2"
                style={{ background: "var(--naranja-light)", border: "1px solid #fed7aa" }}
              >
                <Clock className="w-3.5 h-3.5 shrink-0" style={{ color: "var(--naranja)" }} />
                <p className="text-xs" style={{ color: "var(--naranja)" }}>
                  <span className="font-semibold">{tiempoPrimerEmpleo.texto}</span> hasta primer empleo
                  {eg.anioTitulacion ? " (desde titulación)" : " (desde egreso)"}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ── Historial laboral ── */}
      <div className="card">
        <div className="flex items-center justify-between mb-5">
          <div>
            <h2 className="text-lg font-bold" style={{ color: "var(--azul-pizarra)", fontFamily: "'Source Serif 4', serif" }}>
              Historial Laboral
            </h2>
            <p className="text-sm mt-0.5" style={{ color: "var(--gris-grafito)" }}>
              {historial.length} experiencia(s) registrada(s)
            </p>
          </div>
          <Link href="/experiencia/nueva" className="btn-primary btn-sm">
            <Plus className="w-3.5 h-3.5" /> Agregar
          </Link>
        </div>

        {historial.length === 0 ? (
          <div
            className="text-center py-12 rounded-xl border-2 border-dashed"
            style={{ borderColor: "var(--borde)", background: "var(--humo)" }}
          >
            <Briefcase className="w-10 h-10 mx-auto mb-3" style={{ color: "var(--borde)" }} />
            <p className="font-semibold" style={{ color: "var(--gris-grafito)" }}>Sin experiencias registradas</p>
            <p className="text-sm mt-1" style={{ color: "var(--placeholder)" }}>Agrega tu primera experiencia laboral</p>
            <Link href="/experiencia/nueva" className="btn-primary btn-sm mt-4 inline-flex">
              <Plus className="w-3.5 h-3.5" /> Agregar ahora
            </Link>
          </div>
        ) : (
          <MiPerfilHistorial historial={historial} idEgresado={eg.id} />
        )}
      </div>

      {/* ── Estudios de Postgrado ── */}
      <div className="card">
        <div className="flex items-center justify-between mb-5">
          <div>
            <h2 className="text-lg font-bold" style={{ color: "var(--azul-pizarra)", fontFamily: "'Source Serif 4', serif" }}>
              Estudios de Postgrado
            </h2>
            <p className="text-sm mt-0.5" style={{ color: "var(--gris-grafito)" }}>
              {postgrados.length} estudio(s) registrado(s)
            </p>
          </div>
        </div>

        {postgrados.length === 0 && (
          <div
            className="mb-4 text-center py-8 rounded-xl border-2 border-dashed"
            style={{ borderColor: "var(--borde)", background: "var(--humo)" }}
          >
            <BookOpen className="w-8 h-8 mx-auto mb-2" style={{ color: "var(--borde)" }} />
            <p className="text-sm" style={{ color: "var(--placeholder)" }}>Sin estudios de postgrado registrados</p>
          </div>
        )}

        <MiPerfilPostgrados postgrados={postgrados} idEgresado={eg.id} />
      </div>

    </div>
  );
}
