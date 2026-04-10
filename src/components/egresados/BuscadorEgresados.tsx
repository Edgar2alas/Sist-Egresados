"use client";
import { useRouter, usePathname } from "next/navigation";
import { useForm } from "react-hook-form";
import { Search, SlidersHorizontal, X } from "lucide-react";

interface SP {
  busqueda?:   string;
  plan?:       string;
  anioEgreso?: string;
  conEmpleo?:  string;
  genero?:     string;
  page?:       string;
}

interface Props {
  planes:       readonly string[];
  searchParams: SP;
}

export default function BuscadorEgresados({ planes, searchParams }: Props) {
  const router   = useRouter();
  const pathname = usePathname();
  const years    = Array.from(
    { length: new Date().getFullYear() - 1997 },
    (_, i) => 1998 + i
  ).reverse();

  const { register, handleSubmit, reset } = useForm<SP>({
    defaultValues: {
      busqueda:   searchParams.busqueda   ?? "",
      plan:       searchParams.plan       ?? "",
      anioEgreso: searchParams.anioEgreso ?? "",
      conEmpleo:  searchParams.conEmpleo  ?? "",
      genero:     searchParams.genero     ?? "",
    },
  });

  const onSubmit = (d: SP) => {
    const p = new URLSearchParams();
    Object.entries(d).forEach(([k, v]) => { if (v) p.set(k, v as string); });
    router.push(`${pathname}?${p}`);
  };

  const onClear = () => {
    reset({ busqueda: "", plan: "", anioEgreso: "", conEmpleo: "", genero: "" });
    router.push(pathname);
  };

  const hasFilters = Object.values(searchParams).some(Boolean);

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="card flex flex-wrap gap-3 items-end">

      <div className="flex-1 min-w-[180px]">
        <label className="label">Buscar</label>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
          <input {...register("busqueda")} placeholder="Nombre, apellido o CI…" className="field pl-9" />
        </div>
      </div>

      <div className="min-w-[140px]">
        <label className="label">Plan de Estudios</label>
        <select {...register("plan")} className="field">
          <option value="">Todos</option>
          {planes.map(p => <option key={p} value={p}>Plan {p}</option>)}
        </select>
      </div>

      <div className="min-w-[120px]">
        <label className="label">Año Egreso</label>
        <select {...register("anioEgreso")} className="field">
          <option value="">Todos</option>
          {years.map(y => <option key={y} value={y}>{y}</option>)}
        </select>
      </div>

      <div className="min-w-[120px]">
        <label className="label">Género</label>
        <select {...register("genero")} className="field">
          <option value="">Todos</option>
          <option value="Masculino">Masculino</option>
          <option value="Femenino">Femenino</option>
          <option value="Otro">Otro</option>
        </select>
      </div>

      <div className="min-w-[140px]">
        <label className="label">Estado Laboral</label>
        <select {...register("conEmpleo")} className="field">
          <option value="">Todos</option>
          <option value="true">Con empleo</option>
          <option value="false">Sin empleo</option>
        </select>
      </div>

      <div className="flex gap-2">
        <button type="submit" className="btn-primary btn-sm">
          <SlidersHorizontal className="w-3.5 h-3.5" /> Filtrar
        </button>
        {hasFilters && (
          <button type="button" onClick={onClear} className="btn-ghost btn-sm">
            <X className="w-3.5 h-3.5" /> Limpiar
          </button>
        )}
      </div>
    </form>
  );
}
