"use client";
import { useState, useRef } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { postgradoSchema, type PostgradoInput } from "@/lib/validations";
import { Save, X, Upload, FileText, AlertCircle, Clock } from "lucide-react";
import { cn } from "@/lib/utils";

interface Props {
  idEgresado: number;
  postgrado?: any;
  onSuccess:  () => void;
  onCancel:   () => void;
}

const TIPOS   = ["Diplomado", "Especialidad", "Maestria", "Doctorado", "Postdoctorado", "Otro"] as const;
const ESTADOS = ["En curso", "Finalizado", "Abandonado"] as const;

export default function PostgradoForm({ idEgresado, postgrado: pg, onSuccess, onCancel }: Props) {
  const isEditing = !!pg;
  const fileRef   = useRef<HTMLInputElement>(null);
  const [error,   setError]   = useState<string | null>(null);
  const [archivo, setArchivo] = useState<File | null>(null);

  const years = Array.from(
    { length: new Date().getFullYear() - 1989 },
    (_, i) => 1990 + i
  ).reverse();

  const { register, handleSubmit, watch, formState: { errors, isSubmitting } } =
    useForm<PostgradoInput>({
      resolver: zodResolver(postgradoSchema),
      defaultValues: {
        idEgresado,
        tipo:        pg?.tipo        ?? undefined,
        institucion: pg?.institucion ?? "",
        pais:        pg?.pais        ?? "Bolivia",
        anioInicio:  pg?.anioInicio  ?? undefined,
        anioFin:     pg?.anioFin     ?? undefined,
        estado:      pg?.estado      ?? "En curso",
      },
    });

  const estadoWatch = watch("estado");

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;
    const permitidos = ["application/pdf", "image/jpeg", "image/png", "image/webp"];
    if (!permitidos.includes(f.type)) { setError("Solo PDF, JPG, PNG o WEBP"); return; }
    if (f.size > 5 * 1024 * 1024)    { setError("Máximo 5MB"); return; }
    setError(null);
    setArchivo(f);
  };

  const onSubmit = async (d: PostgradoInput) => {
    setError(null);

    if (isEditing) {
      // Edición → solicitud de cambio (JSON)
      const res  = await fetch(`/api/postgrado/${pg.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(d),
      });
      const json = await res.json();
      if (!res.ok) { setError(json.error); return; }
      onSuccess();
      return;
    }

    // Creación → FormData (para documento)
    const fd = new FormData();
    fd.append("idEgresado",  String(d.idEgresado));
    fd.append("tipo",        d.tipo);
    fd.append("institucion", d.institucion);
    fd.append("pais",        d.pais);
    fd.append("anioInicio",  String(d.anioInicio));
    fd.append("anioFin",     d.anioFin ? String(d.anioFin) : "");
    fd.append("estado",      d.estado);
    if (archivo) fd.append("documento", archivo);

    const res  = await fetch("/api/postgrado", { method: "POST", body: fd });
    const json = await res.json();
    if (!res.ok) { setError(json.error); return; }
    onSuccess();
  };

  // Si hay solicitud pendiente, mostrar aviso
  if (isEditing && pg.verificacionEstado === "pendiente" && pg.esSolicitudCambio) {
    return (
      <div className="rounded-xl px-4 py-5 text-center space-y-2"
        style={{ background: "var(--naranja-light)", border: "1px solid #fed7aa" }}>
        <Clock className="w-8 h-8 mx-auto" style={{ color: "var(--naranja)" }} />
        <p className="font-semibold text-sm" style={{ color: "var(--naranja)" }}>
          Solicitud de cambio pendiente
        </p>
        <p className="text-xs" style={{ color: "var(--gris-grafito)" }}>
          Tu solicitud está siendo revisada por el administrador.
          No puedes editar hasta que sea procesada.
        </p>
        <button onClick={onCancel} className="btn-ghost btn-sm mt-2">
          <X className="w-3.5 h-3.5" /> Cerrar
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      {error && <p className="error-box">{error}</p>}

      {/* Aviso de flujo de aprobación para edición */}
      {isEditing && (
        <div className="rounded-xl px-3 py-2.5 flex items-start gap-2"
          style={{ background: "var(--turquesa-pale)", border: "1px solid rgba(0,165,168,0.20)" }}>
          <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" style={{ color: "var(--turquesa-dark)" }} />
          <p className="text-xs" style={{ color: "var(--turquesa-dark)" }}>
            Los cambios serán enviados al administrador para su aprobación antes de aplicarse.
          </p>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="label">Tipo <span className="text-red-400">*</span></label>
          <select {...register("tipo")} className={cn("field", errors.tipo && "field-err")}>
            <option value="">— Seleccionar —</option>
            {TIPOS.map(t => <option key={t} value={t}>{t}</option>)}
          </select>
          {errors.tipo && <p className="hint">{errors.tipo.message}</p>}
        </div>

        <div>
          <label className="label">Estado <span className="text-red-400">*</span></label>
          <select {...register("estado")} className="field">
            {ESTADOS.map(e => <option key={e} value={e}>{e}</option>)}
          </select>
        </div>

        <div className="md:col-span-2">
          <label className="label">Institución <span className="text-red-400">*</span></label>
          <input {...register("institucion")} placeholder="Nombre de la institución"
            className={cn("field", errors.institucion && "field-err")} />
          {errors.institucion && <p className="hint">{errors.institucion.message}</p>}
        </div>

        <div>
          <label className="label">País <span className="text-red-400">*</span></label>
          <input {...register("pais")} className="field" placeholder="Bolivia" />
        </div>

        <div>
          <label className="label">Año de Inicio <span className="text-red-400">*</span></label>
          <select {...register("anioInicio", { setValueAs: v => v === "" ? undefined : Number(v) })}
            className={cn("field", errors.anioInicio && "field-err")}>
            <option value="">— Seleccionar —</option>
            {years.map(y => <option key={y} value={y}>{y}</option>)}
          </select>
          {errors.anioInicio && <p className="hint">{errors.anioInicio.message}</p>}
        </div>

        {estadoWatch !== "En curso" && (
          <div>
            <label className="label">Año de Finalización</label>
            <select {...register("anioFin", { setValueAs: v => v === "" ? null : Number(v) })}
              className="field">
              <option value="">— Sin especificar —</option>
              {years.map(y => <option key={y} value={y}>{y}</option>)}
            </select>
          </div>
        )}
      </div>

      {/* Documento — solo en creación */}
      {!isEditing && (
        <div className="rounded-xl p-4"
          style={{ background: "var(--turquesa-pale)", border: "1px solid rgba(0,165,168,0.20)" }}>
          <div className="flex items-start gap-3 mb-3">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" style={{ color: "var(--turquesa-dark)" }} />
            <div>
              <p className="text-sm font-semibold" style={{ color: "var(--turquesa-dark)" }}>
                Certificado o título (opcional)
              </p>
              <p className="text-xs mt-0.5" style={{ color: "var(--gris-grafito)" }}>
                Adjunta tu diploma, certificado o comprobante de inscripción. PDF, JPG o PNG — máx. 5MB.{" "}
                <span className="font-medium" style={{ color: "var(--turquesa-dark)" }}>
                  El documento es opcional.
                </span>
              </p>
            </div>
          </div>

          {archivo ? (
            <div className="flex items-center gap-3 p-3 rounded-lg"
              style={{ background: "var(--blanco)", border: "1px solid var(--borde)" }}>
              <FileText className="w-4 h-4 shrink-0" style={{ color: "var(--turquesa)" }} />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate" style={{ color: "var(--azul-pizarra)" }}>
                  {archivo.name}
                </p>
                <p className="text-xs" style={{ color: "var(--placeholder)" }}>
                  {(archivo.size / 1024).toFixed(0)} KB
                </p>
              </div>
              <button type="button" onClick={() => { setArchivo(null); if (fileRef.current) fileRef.current.value = ""; }}
                className="btn-ghost btn-xs">
                <X className="w-3 h-3" />
              </button>
            </div>
          ) : (
            <button type="button" onClick={() => fileRef.current?.click()}
              className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-lg text-sm font-medium"
              style={{ background: "var(--blanco)", border: "1.5px dashed rgba(0,165,168,0.40)", color: "var(--turquesa-dark)" }}>
              <Upload className="w-4 h-4" />
              Adjuntar certificado
            </button>
          )}
          <input ref={fileRef} type="file" accept=".pdf,.jpg,.jpeg,.png,.webp"
            onChange={handleFile} className="hidden" />
        </div>
      )}

      {/* Estado verificación si es edición */}
      {isEditing && pg?.verificacionEstado && (
        <div className="rounded-xl px-4 py-3 flex items-center gap-3"
          style={{
            background: pg.verificacionEstado === "aprobado" ? "var(--verde-light)"
              : pg.verificacionEstado === "rechazado" ? "#FEF2F2" : "var(--naranja-light)",
            border: `1px solid ${pg.verificacionEstado === "aprobado" ? "#86efac"
              : pg.verificacionEstado === "rechazado" ? "#FECACA" : "#fed7aa"}`,
          }}>
          <span className="text-sm font-semibold" style={{
            color: pg.verificacionEstado === "aprobado" ? "var(--verde)"
              : pg.verificacionEstado === "rechazado" ? "#dc2626" : "var(--naranja)",
          }}>
            {pg.verificacionEstado === "aprobado"  && "✓ Verificado"}
            {pg.verificacionEstado === "rechazado" && "✗ Rechazado"}
            {pg.verificacionEstado === "pendiente" && "⏳ Pendiente de verificación"}
          </span>
          {pg.rechazoMotivo && (
            <span className="text-xs" style={{ color: "#dc2626" }}>— {pg.rechazoMotivo}</span>
          )}
        </div>
      )}

      <div className="flex gap-3 pt-3 border-t" style={{ borderColor: "var(--borde)" }}>
        <button type="submit" disabled={isSubmitting} className="btn-primary">
          {isSubmitting
            ? <><span className="spinner" /> Guardando...</>
            : <><Save className="w-4 h-4" /> {isEditing ? "Solicitar cambio" : "Agregar postgrado"}</>}
        </button>
        <button type="button" onClick={onCancel} className="btn-ghost">
          <X className="w-4 h-4" /> Cancelar
        </button>
      </div>
    </form>
  );
}