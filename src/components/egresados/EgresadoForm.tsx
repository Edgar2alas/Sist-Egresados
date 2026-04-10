"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { egresadoSchema, type EgresadoInput } from "@/lib/validations";
import { PLANES_ESTUDIO, MODALIDADES_TITULACION } from "@/lib/schema";
import { Save, X } from "lucide-react";
import { cn } from "@/lib/utils";

interface Props {
  egresado?:   any;
  redirectTo?: string;
}

export default function EgresadoForm({ egresado: eg, redirectTo }: Props) {
  const router    = useRouter();
  const isEditing = !!eg;
  const [serverError, setServerError] = useState<string | null>(null);

  const years = Array.from(
    { length: new Date().getFullYear() - 1997 },
    (_, i) => 1998 + i
  ).reverse();

  const { register, handleSubmit, formState: { errors, isSubmitting } } =
    useForm<EgresadoInput>({
      resolver: zodResolver(egresadoSchema),
      defaultValues: eg ? {
        nombres:             eg.nombres,
        apellidos:           eg.apellidos,
        apellidoPaterno:     eg.apellidoPaterno    ?? "",
        apellidoMaterno:     eg.apellidoMaterno    ?? "",
        ci:                  eg.ci,
        nacionalidad:        eg.nacionalidad       ?? "",
        genero:              eg.genero             ?? undefined,
        correoElectronico:   eg.correoElectronico  ?? "",
        celular:             eg.celular ?? eg.telefono ?? "",
        direccion:           eg.direccion          ?? "",
        tituloAcademico:     eg.tituloAcademico    ?? "",
        fechaNacimiento:     eg.fechaNacimiento?.split("T")[0] ?? eg.fechaNacimiento ?? "",
        planEstudiosNombre:  eg.planEstudiosNombre ?? "",
        anioIngreso:         eg.anioIngreso        ?? undefined,
        anioEgreso:          eg.anioEgreso         ?? undefined,
        anioTitulacion:      eg.anioTitulacion     ?? undefined,
        promedio:            eg.promedio ? parseFloat(eg.promedio) : undefined,
        modalidadTitulacion: eg.modalidadTitulacion ?? undefined,
      } : undefined,
    });

  const onSubmit = async (d: EgresadoInput) => {
    setServerError(null);
    const apellidos = [d.apellidoPaterno, d.apellidoMaterno].filter(Boolean).join(" ") || d.apellidos;
    const payload   = { ...d, apellidos };

    const url    = isEditing ? `/api/egresados/${eg.id}` : "/api/egresados";
    const method = isEditing ? "PUT" : "POST";
    const res    = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    const json = await res.json();
    if (!res.ok) { setServerError(json.error); return; }
    const dest = redirectTo ?? (isEditing ? `/egresados/${eg.id}` : `/egresados/${json.data?.id}`);
    router.push(dest);
    router.refresh();
  };

  const f = (hasErr?: boolean) => cn("field", hasErr && "field-err");

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {serverError && <p className="error-box">{serverError}</p>}

      {/* ── Datos Personales ── */}
      <section>
        <p className="text-slate-400 text-xs uppercase tracking-widest font-semibold mb-4">
          Datos Personales
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

          <div>
            <label className="label">Nombres <span className="text-red-400">*</span></label>
            <input {...register("nombres")} className={f(!!errors.nombres)} />
            {errors.nombres && <p className="hint">{errors.nombres.message}</p>}
          </div>

          <div>
            <label className="label">CI <span className="text-red-400">*</span></label>
            <input {...register("ci")} className={f(!!errors.ci)} />
            {errors.ci && <p className="hint">{errors.ci.message}</p>}
          </div>

          <div>
            <label className="label">Apellido Paterno</label>
            <input {...register("apellidoPaterno")} className="field" />
          </div>

          <div>
            <label className="label">Apellido Materno</label>
            <input {...register("apellidoMaterno")} className="field" />
          </div>

          <div>
            <label className="label">Fecha de Nacimiento <span className="text-red-400">*</span></label>
            <input {...register("fechaNacimiento")} type="date" className={f(!!errors.fechaNacimiento)} />
            {errors.fechaNacimiento && <p className="hint">{errors.fechaNacimiento.message}</p>}
          </div>

          <div>
            <label className="label">Género</label>
            <select {...register("genero")} className="field">
              <option value="">— Seleccionar —</option>
              <option value="Masculino">Masculino</option>
              <option value="Femenino">Femenino</option>
              <option value="Otro">Otro</option>
              <option value="Prefiero no decir">Prefiero no decir</option>
            </select>
          </div>

          <div>
            <label className="label">Celular</label>
            <input {...register("celular")} type="tel" placeholder="7XXXXXXX" className="field" />
          </div>

          <div>
            <label className="label">Correo Electrónico</label>
            <input {...register("correoElectronico")} type="email" className={f(!!errors.correoElectronico)} />
            {errors.correoElectronico && <p className="hint">{errors.correoElectronico.message}</p>}
          </div>

          <div className="md:col-span-2">
            <label className="label">Dirección</label>
            <input {...register("direccion")} className="field" />
          </div>

          <div>
            <label className="label">Nacionalidad</label>
            <input {...register("nacionalidad")} className="field" placeholder="Boliviana" />
          </div>

          <div>
            <label className="label">Último Título Académico</label>
            <input
              {...register("tituloAcademico")}
              className="field"
              placeholder="Ej: Lic. en Estadística"
            />
            <p className="text-slate-600 text-xs mt-1">
              Se actualiza automáticamente si registra un postgrado
            </p>
          </div>

        </div>
      </section>

      {/* ── Datos Académicos ── */}
      <section className="border-t border-slate-800 pt-6">
        <p className="text-slate-400 text-xs uppercase tracking-widest font-semibold mb-4">
          Datos Académicos
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

          <div>
            <label className="label">Plan de Estudios</label>
            <select {...register("planEstudiosNombre")} className="field">
              <option value="">— Seleccionar —</option>
              {PLANES_ESTUDIO.map(p => (
                <option key={p} value={p}>Plan {p}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="label">Modalidad de Titulación</label>
            <select {...register("modalidadTitulacion")} className="field">
              <option value="">— Seleccionar —</option>
              {MODALIDADES_TITULACION.map(m => (
                <option key={m} value={m}>{m}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="label">Año de Ingreso</label>
            <select {...register("anioIngreso", { valueAsNumber: true })} className="field">
              <option value="">— Seleccionar —</option>
              {years.map(y => <option key={y} value={y}>{y}</option>)}
            </select>
          </div>

          <div>
            <label className="label">Año de Egreso</label>
            <select {...register("anioEgreso", { valueAsNumber: true })} className={f(!!errors.anioEgreso)}>
              <option value="">— Seleccionar —</option>
              {years.map(y => <option key={y} value={y}>{y}</option>)}
            </select>
            {errors.anioEgreso && <p className="hint">{errors.anioEgreso.message}</p>}
          </div>

          <div>
            <label className="label">Año de Titulación</label>
            <select {...register("anioTitulacion", { valueAsNumber: true })} className={f(!!errors.anioTitulacion)}>
              <option value="">— Seleccionar —</option>
              {years.map(y => <option key={y} value={y}>{y}</option>)}
            </select>
            {errors.anioTitulacion && <p className="hint">{errors.anioTitulacion.message}</p>}
          </div>

          <div>
            <label className="label">Promedio de Egreso</label>
            <input
              {...register("promedio", { valueAsNumber: true })}
              type="number"
              min="0"
              max="100"
              step="0.01"
              placeholder="Ej: 65.50"
              className={f(!!errors.promedio)}
            />
            {errors.promedio && <p className="hint">{errors.promedio.message}</p>}
          </div>

        </div>
      </section>

      {/* ── Acciones ── */}
      <div className="flex gap-3 pt-4 border-t border-slate-800">
        <button type="submit" disabled={isSubmitting} className="btn-primary">
          {isSubmitting
            ? <><span className="spinner" /> Guardando...</>
            : <><Save className="w-4 h-4" /> {isEditing ? "Guardar cambios" : "Crear egresado"}</>}
        </button>
        <button type="button" onClick={() => router.back()} className="btn-ghost">
          <X className="w-4 h-4" /> Cancelar
        </button>
      </div>
    </form>
  );
}
