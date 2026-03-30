"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { egresadoSchema, type EgresadoInput } from "@/lib/validations";
import { Save, X } from "lucide-react";
import { cn } from "@/lib/utils";

interface Props {
  egresado?: any;
  planes:    { id: number; nombre: string }[];
  redirectTo?: string;
}

export default function EgresadoForm({ egresado: eg, planes, redirectTo }: Props) {
  const router    = useRouter();
  const isEditing = !!eg;
  const [serverError, setServerError] = useState<string | null>(null);

  const { register, handleSubmit, formState: { errors, isSubmitting } } =
    useForm<EgresadoInput>({
      resolver: zodResolver(egresadoSchema),
      defaultValues: eg ? {
        nombres:         eg.nombres,
        apellidos:       eg.apellidos,
        ci:              eg.ci,
        telefono:        eg.telefono ?? "",
        direccion:       eg.direccion ?? "",
        fechaNacimiento: eg.fechaNacimiento?.split("T")[0] ?? eg.fechaNacimiento,
        fechaGraduacion: eg.fechaGraduacion?.split("T")[0] ?? eg.fechaGraduacion,
        idPlan:          eg.idPlan,
      } : undefined,
    });

  const onSubmit = async (d: EgresadoInput) => {
    setServerError(null);
    const url    = isEditing ? `/api/egresados/${eg.id}` : "/api/egresados/";
    const method = isEditing ? "PUT" : "POST";
    const res    = await fetch(url, {
      method, headers: { "Content-Type": "application/json" }, body: JSON.stringify(d),
    });
    const json = await res.json();
    if (!res.ok) { setServerError(json.error); return; }
    const dest = redirectTo ?? (isEditing ? `/egresados/${eg.id}` : `/egresados/${json.data?.id}`);
    router.push(dest);
    router.refresh();
  };

  const inputClass = (hasErr?: boolean) => cn("field", hasErr && "field-err");

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {serverError && <p className="error-box">{serverError}</p>}

      {/* Datos personales */}
      <div>
        <p className="text-slate-400 text-xs uppercase tracking-widest font-semibold mb-4">
          Datos Personales
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="label">Nombres <span className="text-red-400">*</span></label>
            <input {...register("nombres")} className={inputClass(!!errors.nombres)} />
            {errors.nombres && <p className="hint">{errors.nombres.message}</p>}
          </div>
          <div>
            <label className="label">Apellidos <span className="text-red-400">*</span></label>
            <input {...register("apellidos")} className={inputClass(!!errors.apellidos)} />
            {errors.apellidos && <p className="hint">{errors.apellidos.message}</p>}
          </div>
          <div>
            <label className="label">CI <span className="text-red-400">*</span></label>
            <input {...register("ci")} className={inputClass(!!errors.ci)} />
            {errors.ci && <p className="hint">{errors.ci.message}</p>}
          </div>
          <div>
            <label className="label">Teléfono</label>
            <input {...register("telefono")} type="tel" className="field" />
          </div>
          <div className="md:col-span-2">
            <label className="label">Dirección</label>
            <input {...register("direccion")} className="field" />
          </div>
          <div>
            <label className="label">Fecha de Nacimiento <span className="text-red-400">*</span></label>
            <input {...register("fechaNacimiento")} type="date"
              className={inputClass(!!errors.fechaNacimiento)} />
            {errors.fechaNacimiento && <p className="hint">{errors.fechaNacimiento.message}</p>}
          </div>
        </div>
      </div>

      {/* Datos académicos */}
      <div className="border-t border-slate-800 pt-6">
        <p className="text-slate-400 text-xs uppercase tracking-widest font-semibold mb-4">
          Datos Académicos
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="label">Fecha de Graduación <span className="text-red-400">*</span></label>
            <input {...register("fechaGraduacion")} type="date"
              className={inputClass(!!errors.fechaGraduacion)} />
            {errors.fechaGraduacion && <p className="hint">{errors.fechaGraduacion.message}</p>}
          </div>
          <div>
            <label className="label">Plan de Estudios <span className="text-red-400">*</span></label>
            <select {...register("idPlan", { valueAsNumber: true })}
              className={inputClass(!!errors.idPlan)}>
              <option value="">— Seleccionar —</option>
              {planes.map(p => <option key={p.id} value={p.id}>{p.nombre}</option>)}
            </select>
            {errors.idPlan && <p className="hint">{errors.idPlan.message}</p>}
          </div>
        </div>
      </div>

      {/* Acciones */}
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
