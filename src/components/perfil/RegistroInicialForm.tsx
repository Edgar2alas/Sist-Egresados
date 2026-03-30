"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { egresadoSchema, type EgresadoInput } from "@/lib/validations";
import { Save } from "lucide-react";
import { cn } from "@/lib/utils";

interface Props { planes: { id: number; nombre: string }[] }

export default function RegistroInicialForm({ planes }: Props) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);

  const { register, handleSubmit, formState: { errors, isSubmitting } } =
    useForm<EgresadoInput>({ resolver: zodResolver(egresadoSchema) });

  const onSubmit = async (d: EgresadoInput) => {
    setError(null);

    // 1. Crear egresado
    const res1  = await fetch("/api/egresados", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(d),
    });
    const json1 = await res1.json();
    if (!res1.ok) { setError(json1.error); return; }

    const idEgresado = json1.data?.id;

    // 2. Vincular egresado al usuario actual
    const res2  = await fetch("/api/auth/link-egresado", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ idEgresado }),
    });
    const json2 = await res2.json();
    if (!res2.ok) { setError(json2.error); return; }

    router.push("/mi-perfil");
    router.refresh();
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
      {error && <p className="error-box">{error}</p>}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="label">Nombres <span className="text-red-400">*</span></label>
          <input {...register("nombres")} className={cn("field", errors.nombres && "field-err")} />
          {errors.nombres && <p className="hint">{errors.nombres.message}</p>}
        </div>
        <div>
          <label className="label">Apellidos <span className="text-red-400">*</span></label>
          <input {...register("apellidos")} className={cn("field", errors.apellidos && "field-err")} />
          {errors.apellidos && <p className="hint">{errors.apellidos.message}</p>}
        </div>
        <div>
          <label className="label">CI <span className="text-red-400">*</span></label>
          <input {...register("ci")} className={cn("field", errors.ci && "field-err")} />
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
            className={cn("field", errors.fechaNacimiento && "field-err")} />
          {errors.fechaNacimiento && <p className="hint">{errors.fechaNacimiento.message}</p>}
        </div>
        <div>
          <label className="label">Fecha de Graduación <span className="text-red-400">*</span></label>
          <input {...register("fechaGraduacion")} type="date"
            className={cn("field", errors.fechaGraduacion && "field-err")} />
          {errors.fechaGraduacion && <p className="hint">{errors.fechaGraduacion.message}</p>}
        </div>
        <div className="md:col-span-2">
          <label className="label">Plan de Estudios <span className="text-red-400">*</span></label>
          <select {...register("idPlan", { valueAsNumber: true })}
            className={cn("field", errors.idPlan && "field-err")}>
            <option value="">— Seleccionar plan —</option>
            {planes.map(p => <option key={p.id} value={p.id}>{p.nombre}</option>)}
          </select>
          {errors.idPlan && <p className="hint">{errors.idPlan.message}</p>}
        </div>
      </div>

      <button type="submit" disabled={isSubmitting} className="btn-primary w-full py-3">
        {isSubmitting
          ? <><span className="spinner" /> Guardando...</>
          : <><Save className="w-4 h-4" /> Guardar y continuar</>}
      </button>
    </form>
  );
}
