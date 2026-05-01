"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { noticiaSchema, type NoticiaInput } from "@/lib/validations";
import { Save, X, Eye, EyeOff } from "lucide-react";
import { cn } from "@/lib/utils";

interface Props {
  noticia?: any;
  redirectTo?: string;
}

const TIPO_LABELS: Record<string, string> = {
  noticia_institucional: "Noticia institucional",
  curso_evento:          "Curso / Evento",
  noticia_social:        "Noticia social",
};

const TIPO_COLORS: Record<string, { bg: string; color: string; border: string }> = {
  noticia_institucional: {
    bg: "rgba(0,165,168,0.10)",
    color: "var(--turquesa-dark)",
    border: "1px solid rgba(0,165,168,0.30)",
  },
  curso_evento: {
    bg: "rgba(139,92,246,0.10)",
    color: "#7c3aed",
    border: "1px solid rgba(139,92,246,0.30)",
  },
  noticia_social: {
    bg: "rgba(245,158,11,0.10)",
    color: "var(--naranja)",
    border: "1px solid rgba(245,158,11,0.30)",
  },
};

export default function NoticiaForm({ noticia: n, redirectTo }: Props) {
  const router    = useRouter();
  const isEditing = !!n;
  const [serverError, setServerError] = useState<string | null>(null);
  const [preview, setPreview]         = useState(false);

  const { register, handleSubmit, watch, formState: { errors, isSubmitting } } =
    useForm<NoticiaInput>({
      resolver: zodResolver(noticiaSchema),
      defaultValues: n ? {
        titulo:    n.titulo,
        cuerpo:    n.cuerpo,
        tipo:      n.tipo,
        fecha:     n.fecha?.split("T")[0] ?? n.fecha ?? "",
        imagenUrl: n.imagenUrl ?? "",
        publicado: n.publicado ?? false,
      } : {
        tipo:      "noticia_institucional",
        publicado: false,
        fecha:     new Date().toISOString().split("T")[0],
      },
    });

  const cuerpoWatch = watch("cuerpo", "");
  const tipoWatch   = watch("tipo");

  const onSubmit = async (d: NoticiaInput) => {
    setServerError(null);
    const url    = isEditing ? `/api/noticias/${n.id}` : "/api/noticias";
    const method = isEditing ? "PUT" : "POST";

    const res  = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...d, imagenUrl: d.imagenUrl || null }),
    });
    const json = await res.json();
    if (!res.ok) { setServerError(json.error); return; }

    router.push(redirectTo ?? "/noticias-admin");
    router.refresh();
  };

  const tipoColor = TIPO_COLORS[tipoWatch] ?? TIPO_COLORS.noticia_institucional;

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {serverError && <p className="error-box">{serverError}</p>}

      {/* ── Tipo ── */}
      <div>
        <label className="label">Tipo de publicación <span className="text-red-400">*</span></label>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {(["noticia_institucional", "curso_evento", "noticia_social"] as const).map(t => {
            const active = tipoWatch === t;
            const c = TIPO_COLORS[t];
            return (
              <label
                key={t}
                className="flex items-center gap-3 rounded-xl px-4 py-3 cursor-pointer transition-all"
                style={{
                  background: active ? c.bg : "var(--humo)",
                  border: active ? c.border : "1.5px solid var(--borde)",
                }}
              >
                <input type="radio" value={t} {...register("tipo")} className="sr-only" />
                <div
                  className="w-3 h-3 rounded-full border-2 shrink-0 flex items-center justify-center"
                  style={{ borderColor: active ? c.color : "var(--placeholder)" }}
                >
                  {active && (
                    <div className="w-1.5 h-1.5 rounded-full" style={{ background: c.color }} />
                  )}
                </div>
                <span className="text-sm font-medium" style={{ color: active ? c.color : "var(--gris-grafito)" }}>
                  {TIPO_LABELS[t]}
                </span>
              </label>
            );
          })}
        </div>
        {errors.tipo && <p className="hint">{errors.tipo.message}</p>}
      </div>

      {/* ── Título ── */}
      <div>
        <label className="label">Título <span className="text-red-400">*</span></label>
        <input
          {...register("titulo")}
          placeholder="Título de la noticia o evento..."
          className={cn("field", errors.titulo && "field-err")}
        />
        {errors.titulo && <p className="hint">{errors.titulo.message}</p>}
      </div>

      {/* ── Fecha ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="label">Fecha <span className="text-red-400">*</span></label>
          <input
            {...register("fecha")}
            type="date"
            className={cn("field", errors.fecha && "field-err")}
          />
          {errors.fecha && <p className="hint">{errors.fecha.message}</p>}
        </div>

        <div>
          <label className="label">URL de imagen (opcional)</label>
          <input
            {...register("imagenUrl")}
            placeholder="https://ejemplo.com/imagen.jpg"
            className={cn("field", errors.imagenUrl && "field-err")}
          />
          {errors.imagenUrl && <p className="hint">{errors.imagenUrl.message}</p>}
        </div>
      </div>

      {/* ── Cuerpo con toggle preview ── */}
      <div>
        <div className="flex items-center justify-between mb-1.5">
          <label className="label mb-0">Contenido <span className="text-red-400">*</span></label>
          <button
            type="button"
            onClick={() => setPreview(v => !v)}
            className="flex items-center gap-1.5 text-xs font-medium transition-colors"
            style={{ color: "var(--turquesa-dark)" }}
          >
            {preview
              ? <><EyeOff className="w-3.5 h-3.5" /> Editar</>
              : <><Eye className="w-3.5 h-3.5" /> Vista previa</>}
          </button>
        </div>

        {preview ? (
          <div
            className="min-h-[180px] rounded-xl px-4 py-3 text-sm leading-relaxed"
            style={{
              background: "var(--humo)",
              border: "1.5px solid var(--borde)",
              color: "var(--azul-pizarra)",
              whiteSpace: "pre-wrap",
            }}
          >
            {cuerpoWatch || <span style={{ color: "var(--placeholder)" }}>Sin contenido aún...</span>}
          </div>
        ) : (
          <textarea
            {...register("cuerpo")}
            rows={8}
            placeholder="Escribe el contenido completo de la noticia..."
            className={cn("field resize-y", errors.cuerpo && "field-err")}
            style={{ minHeight: "180px" }}
          />
        )}
        {errors.cuerpo && <p className="hint">{errors.cuerpo.message}</p>}
        <p className="text-xs mt-1" style={{ color: "var(--placeholder)" }}>
          {cuerpoWatch.length} caracteres
        </p>
      </div>

      {/* ── Toggle publicado ── */}
      <div
        className="flex items-center justify-between rounded-xl px-4 py-3"
        style={{ background: "var(--humo)", border: "1.5px solid var(--borde)" }}
      >
        <div>
          <p className="text-sm font-semibold" style={{ color: "var(--azul-pizarra)" }}>
            Publicar noticia
          </p>
          <p className="text-xs mt-0.5" style={{ color: "var(--gris-grafito)" }}>
            Las noticias publicadas son visibles en el sitio público
          </p>
        </div>
        <label className="flex items-center gap-2 cursor-pointer select-none">
          <input type="checkbox" {...register("publicado")} className="sr-only" />
          <div
            onClick={() => {}}
            className="w-10 h-6 rounded-full relative transition-colors cursor-pointer"
            style={{ background: watch("publicado") ? "var(--verde)" : "var(--borde)" }}
          >
            <span
              className="absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-transform"
              style={{ transform: watch("publicado") ? "translateX(1.25rem)" : "translateX(0.25rem)" }}
            />
          </div>
        </label>
      </div>

      {/* ── Acciones ── */}
      <div className="flex gap-3 pt-2 border-t" style={{ borderColor: "var(--borde)" }}>
        <button type="submit" disabled={isSubmitting} className="btn-primary">
          {isSubmitting
            ? <><span className="spinner" /> Guardando...</>
            : <><Save className="w-4 h-4" /> {isEditing ? "Guardar cambios" : "Crear publicación"}</>}
        </button>
        <button type="button" onClick={() => router.back()} className="btn-ghost">
          <X className="w-4 h-4" /> Cancelar
        </button>
      </div>
    </form>
  );
}