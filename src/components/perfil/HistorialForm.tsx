"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { historialSchema, type HistorialInput } from "@/lib/validations";
import { Save, X } from "lucide-react";
import { cn } from "@/lib/utils";

interface Props {
  idEgresado:  number;
  historial?:  any;
  onSuccess?:  () => void;
}

export default function HistorialForm({ idEgresado, historial, onSuccess }: Props) {
  const router    = useRouter();
  const isEditing = !!historial;
  const [error, setError]       = useState<string | null>(null);
  const [esActual, setEsActual] = useState(
    historial ? historial.fechaFin === null : false
  );

  const { register, handleSubmit, setValue, formState: { errors, isSubmitting } } =
    useForm<HistorialInput>({
      resolver: zodResolver(historialSchema),
      defaultValues: {
        idEgresado,
        empresa:            historial?.empresa    ?? "",
        cargo:              historial?.cargo      ?? "",
        area:               historial?.area       ?? "",
        fechaInicio:        historial?.fechaInicio?.split("T")[0] ?? historial?.fechaInicio ?? "",
        fechaFin:           historial?.fechaFin?.split("T")[0]   ?? historial?.fechaFin   ?? "",
        actualmenteTrabaja: historial ? historial.fechaFin === null : false,
      },
    });

  const onSubmit = async (d: HistorialInput) => {
    setError(null);
    const payload = { ...d, fechaFin: esActual ? null : d.fechaFin || null, actualmenteTrabaja: esActual };
    const url    = isEditing ? `/api/historial/${historial.id}` : "/api/historial";
    const method = isEditing ? "PUT" : "POST";
    const res    = await fetch(url, {
      method, headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload),
    });
    const json = await res.json();
    if (!res.ok) { setError(json.error); return; }
    if (onSuccess) onSuccess();
    else { router.push("/mi-perfil"); router.refresh(); }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      {error && <p className="error-box">{error}</p>}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="md:col-span-2">
          <label className="label">Empresa <span className="text-red-400">*</span></label>
          <input {...register("empresa")} placeholder="Nombre de la empresa"
            className={cn("field", errors.empresa && "field-err")} />
          {errors.empresa && <p className="hint">{errors.empresa.message}</p>}
        </div>

        <div>
          <label className="label">Cargo <span className="text-red-400">*</span></label>
          <input {...register("cargo")} placeholder="Cargo o puesto"
            className={cn("field", errors.cargo && "field-err")} />
          {errors.cargo && <p className="hint">{errors.cargo.message}</p>}
        </div>

        <div>
          <label className="label">Área</label>
          <input {...register("area")} placeholder="Área o departamento (opcional)" className="field" />
        </div>

        <div>
          <label className="label">Fecha de Inicio <span className="text-red-400">*</span></label>
          <input {...register("fechaInicio")} type="date"
            className={cn("field", errors.fechaInicio && "field-err")} />
          {errors.fechaInicio && <p className="hint">{errors.fechaInicio.message}</p>}
        </div>

        {/* Toggle actualmente trabaja */}
        <div className="md:col-span-2">
          <label className="flex items-center gap-3 cursor-pointer select-none">
            <div
              onClick={() => {
                const next = !esActual;
                setEsActual(next);
                setValue("actualmenteTrabaja", next);
                if (next) setValue("fechaFin", "");
              }}
              className={cn(
                "w-10 h-6 rounded-full relative transition-colors",
                esActual ? "bg-emerald-600" : "bg-slate-700"
              )}>
              <span className={cn(
                "absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-transform",
                esActual ? "translate-x-5" : "translate-x-1"
              )} />
            </div>
            <span className="text-slate-300 text-sm font-medium">
              Actualmente trabajo aquí
            </span>
          </label>
        </div>

        {/* Fecha fin — solo si no es trabajo actual */}
        {!esActual && (
          <div>
            <label className="label">Fecha de Fin</label>
            <input {...register("fechaFin")} type="date"
              className={cn("field", errors.fechaFin && "field-err")} />
            {errors.fechaFin && <p className="hint">{errors.fechaFin.message}</p>}
          </div>
        )}
      </div>

      <div className="flex gap-3 pt-3 border-t border-slate-800">
        <button type="submit" disabled={isSubmitting} className="btn-primary">
          {isSubmitting
            ? <><span className="spinner" /> Guardando...</>
            : <><Save className="w-4 h-4" /> {isEditing ? "Guardar cambios" : "Agregar experiencia"}</>}
        </button>
        <button type="button"
          onClick={() => onSuccess ? onSuccess() : router.push("/mi-perfil")}
          className="btn-ghost">
          <X className="w-4 h-4" /> Cancelar
        </button>
      </div>
    </form>
  );
}
