"use client";
// src/components/perfil/HistorialForm.tsx
import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { Save, X, Upload, FileText, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";

interface Props {
  idEgresado:  number;
  historial?:  any;
  onSuccess?:  () => void;
}

const TIPOS_CONTRATO = ["Indefinido", "Fijo", "Por obra", "Consultor", "Pasante", "Otro"] as const;
const SECTORES       = ["Publico", "Privado", "Independiente", "ONG", "Otro"] as const;

export default function HistorialForm({ idEgresado, historial, onSuccess }: Props) {
  const router    = useRouter();
  const isEditing = !!historial;
  const fileRef   = useRef<HTMLInputElement>(null);

  const [error,    setError]    = useState<string | null>(null);
  const [loading,  setLoading]  = useState(false);
  const [esActual, setEsActual] = useState(historial ? historial.fechaFin === null : false);
  const [archivo,  setArchivo]  = useState<File | null>(null);

  const [form, setForm] = useState({
    empresa:      historial?.empresa      ?? "",
    cargo:        historial?.cargo        ?? "",
    area:         historial?.area         ?? "",
    tipoContrato: historial?.tipoContrato ?? "",
    ciudad:       historial?.ciudad       ?? "",
    sector:       historial?.sector       ?? "",
    fechaInicio:  historial?.fechaInicio?.split("T")[0] ?? historial?.fechaInicio ?? "",
    fechaFin:     historial?.fechaFin?.split("T")[0]   ?? historial?.fechaFin   ?? "",
  });

  const set = (k: string, v: string) => setForm(f => ({ ...f, [k]: v }));

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;
    const permitidos = ["application/pdf", "image/jpeg", "image/png", "image/webp"];
    if (!permitidos.includes(f.type)) {
      setError("Solo se permiten archivos PDF, JPG, PNG o WEBP"); return;
    }
    if (f.size > 5 * 1024 * 1024) {
      setError("El archivo no puede superar los 5MB"); return;
    }
    setError(null);
    setArchivo(f);
  };

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!form.empresa.trim() || form.empresa.length < 2) { setError("Empresa requerida"); return; }
    if (!form.cargo.trim()   || form.cargo.length   < 2) { setError("Cargo requerido");   return; }
    if (!form.fechaInicio)                               { setError("Fecha de inicio requerida"); return; }

    setLoading(true);
    try {
      const url    = isEditing ? `/api/historial/${historial.id}` : "/api/historial";
      const method = isEditing ? "PUT" : "POST";

      let res: Response;

      if (isEditing) {
        res = await fetch(url, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            idEgresado,
            empresa:            form.empresa,
            cargo:              form.cargo,
            area:               form.area || null,
            tipoContrato:       form.tipoContrato || null,
            ciudad:             form.ciudad || null,
            sector:             form.sector || null,
            fechaInicio:        form.fechaInicio,
            fechaFin:           esActual ? null : (form.fechaFin || null),
            actualmenteTrabaja: esActual,
          }),
        });
      } else {
        const fd = new FormData();
        fd.append("idEgresado",         String(idEgresado));
        fd.append("empresa",            form.empresa);
        fd.append("cargo",              form.cargo);
        fd.append("area",               form.area);
        fd.append("tipoContrato",       form.tipoContrato);
        fd.append("ciudad",             form.ciudad);
        fd.append("sector",             form.sector);
        fd.append("fechaInicio",        form.fechaInicio);
        fd.append("fechaFin",           esActual ? "" : form.fechaFin);
        fd.append("actualmenteTrabaja", String(esActual));
        if (archivo) fd.append("documento", archivo);
        res = await fetch(url, { method: "POST", body: fd });
      }

      const json = await res.json();
      if (!res.ok) { setError(json.error); return; }
      if (onSuccess) onSuccess();
      else { router.push("/mi-perfil"); router.refresh(); }
    } finally { setLoading(false); }
  };

  return (
    <form onSubmit={onSubmit} className="space-y-5">
      {error && <p className="error-box">{error}</p>}

      {/* Empresa y Cargo */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="md:col-span-2">
          <label className="label">Empresa <span className="text-red-500">*</span></label>
          <input
            value={form.empresa}
            onChange={e => set("empresa", e.target.value)}
            placeholder="Nombre de la empresa"
            className="field"
          />
        </div>
        <div>
          <label className="label">Cargo <span className="text-red-500">*</span></label>
          <input
            value={form.cargo}
            onChange={e => set("cargo", e.target.value)}
            placeholder="Cargo o puesto"
            className="field"
          />
        </div>
        <div>
          <label className="label">Área</label>
          <input
            value={form.area}
            onChange={e => set("area", e.target.value)}
            placeholder="Área o departamento (opcional)"
            className="field"
          />
        </div>
      </div>

      {/* Tipo contrato, Ciudad, Sector */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label className="label">Tipo de Contrato</label>
          <select value={form.tipoContrato} onChange={e => set("tipoContrato", e.target.value)} className="field">
            <option value="">— Seleccionar —</option>
            {TIPOS_CONTRATO.map(t => <option key={t} value={t}>{t}</option>)}
          </select>
        </div>
        <div>
          <label className="label">Ciudad</label>
          <input value={form.ciudad} onChange={e => set("ciudad", e.target.value)} placeholder="Ej: La Paz" className="field" />
        </div>
        <div>
          <label className="label">Sector</label>
          <select value={form.sector} onChange={e => set("sector", e.target.value)} className="field">
            <option value="">— Seleccionar —</option>
            {SECTORES.map(s => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>
      </div>

      {/* Fecha inicio */}
      <div className="max-w-xs">
        <label className="label">Fecha de Inicio <span className="text-red-500">*</span></label>
        <input
          type="date"
          value={form.fechaInicio}
          onChange={e => set("fechaInicio", e.target.value)}
          className="field"
        />
      </div>

      {/* Toggle actualmente trabaja */}
      <div>
        <label className="flex items-center gap-3 cursor-pointer select-none">
          <div
            onClick={() => setEsActual(v => !v)}
            className="w-10 h-6 rounded-full relative transition-colors cursor-pointer"
            style={{ background: esActual ? "var(--verde)" : "var(--borde)" }}
          >
            <span
              className="absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-transform"
              style={{ transform: esActual ? "translateX(1.25rem)" : "translateX(0.25rem)" }}
            />
          </div>
          <span className="text-sm font-medium" style={{ color: "var(--azul-pizarra)" }}>
            Actualmente trabajo aquí
          </span>
        </label>
      </div>

      {!esActual && (
        <div className="max-w-xs">
          <label className="label">Fecha de Fin</label>
          <input
            type="date"
            value={form.fechaFin}
            onChange={e => set("fechaFin", e.target.value)}
            className="field"
          />
        </div>
      )}

      {/* ── Documento de verificación ── */}
      {!isEditing && (
        <div
          className="rounded-xl p-4"
          style={{ background: "var(--turquesa-pale)", border: "1px solid rgba(0,165,168,0.20)" }}
        >
          <div className="flex items-start gap-3 mb-3">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" style={{ color: "var(--turquesa-dark)" }} />
            <div>
              <p className="text-sm font-semibold" style={{ color: "var(--turquesa-dark)" }}>
                Documento de verificación
              </p>
              <p className="text-xs mt-0.5" style={{ color: "var(--gris-grafito)" }}>
                Adjunta un certificado de trabajo, contrato o credencial institucional.
                El administrador revisará y confirmará tu experiencia. (Opcional pero recomendado)
              </p>
            </div>
          </div>

          {archivo ? (
            <div className="flex items-center gap-3 p-3 rounded-lg" style={{ background: "var(--blanco)", border: "1px solid var(--borde)" }}>
              <FileText className="w-4 h-4 shrink-0" style={{ color: "var(--turquesa)" }} />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate" style={{ color: "var(--azul-pizarra)" }}>{archivo.name}</p>
                <p className="text-xs" style={{ color: "var(--placeholder)" }}>
                  {(archivo.size / 1024).toFixed(0)} KB
                </p>
              </div>
              <button
                type="button"
                onClick={() => { setArchivo(null); if (fileRef.current) fileRef.current.value = ""; }}
                className="btn-ghost btn-xs"
              >
                <X className="w-3 h-3" />
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => fileRef.current?.click()}
              className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-lg text-sm font-medium transition-all"
              style={{
                background: "var(--blanco)",
                border: "1.5px dashed rgba(0,165,168,0.40)",
                color: "var(--turquesa-dark)",
              }}
            >
              <Upload className="w-4 h-4" />
              Adjuntar documento (PDF, JPG, PNG — máx. 5MB)
            </button>
          )}

          <input
            ref={fileRef}
            type="file"
            accept=".pdf,.jpg,.jpeg,.png,.webp"
            onChange={handleFile}
            className="hidden"
          />
        </div>
      )}

      {/* Estado de verificación si ya existe */}
      {isEditing && historial?.verificacionEstado && (
        <div
          className="rounded-xl px-4 py-3 flex items-center gap-3"
          style={{
            background: historial.verificacionEstado === "aprobado"
              ? "var(--verde-light)"
              : historial.verificacionEstado === "rechazado"
              ? "#FEF2F2"
              : "var(--naranja-light)",
            border: `1px solid ${
              historial.verificacionEstado === "aprobado" ? "#86efac"
              : historial.verificacionEstado === "rechazado" ? "#FECACA"
              : "#fed7aa"
            }`,
          }}
        >
          <span className="text-sm font-semibold" style={{
            color: historial.verificacionEstado === "aprobado"
              ? "var(--verde)"
              : historial.verificacionEstado === "rechazado"
              ? "#dc2626"
              : "var(--naranja)",
          }}>
            {historial.verificacionEstado === "aprobado" && "✓ Experiencia verificada"}
            {historial.verificacionEstado === "rechazado" && "✗ Verificación rechazada"}
            {historial.verificacionEstado === "pendiente" && "⏳ Pendiente de verificación"}
          </span>
          {historial.rechazoMotivo && (
            <span className="text-xs" style={{ color: "#dc2626" }}>— {historial.rechazoMotivo}</span>
          )}
        </div>
      )}

      {/* Acciones */}
      <div className="flex gap-3 pt-3 border-t" style={{ borderColor: "var(--borde)" }}>
        <button type="submit" disabled={loading} className="btn-primary">
          {loading
            ? <><span className="spinner" /> Guardando...</>
            : <><Save className="w-4 h-4" /> {isEditing ? "Guardar cambios" : "Agregar experiencia"}</>}
        </button>
        <button
          type="button"
          onClick={() => onSuccess ? onSuccess() : router.push("/mi-perfil")}
          className="btn-ghost"
        >
          <X className="w-4 h-4" /> Cancelar
        </button>
      </div>
    </form>
  );
}
