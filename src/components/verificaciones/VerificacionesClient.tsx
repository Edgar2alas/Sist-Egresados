"use client";
// src/components/verificaciones/VerificacionesClient.tsx
import { useState } from "react";
import { useRouter } from "next/navigation";
import { CheckCircle, XCircle, Eye, FileText, Building2, MapPin, Calendar } from "lucide-react";
import { cn, fmtDate } from "@/lib/utils";

interface Pendiente {
  id:               number;
  empresa:          string;
  cargo:            string;
  area:             string | null;
  ciudad:           string | null;
  sector:           string | null;
  fechaInicio:      string;
  fechaFin:         string | null;
  documentoNombre:  string | null;
  documentoTipo:    string | null;
  documentoSubidoEn: Date | string | null;
  verificacionEstado: string | null;
  egresadoId:       number;
  nombres:          string;
  apellidos:        string;
  apellidoPaterno:  string | null;
  ci:               string;
}

export default function VerificacionesClient({ pendientes }: { pendientes: Pendiente[] }) {
  const router = useRouter();
  const [procesando, setProcesando] = useState<number | null>(null);
  const [modalRechazo, setModalRechazo] = useState<number | null>(null);
  const [motivo, setMotivo] = useState("");
  const [error, setError]   = useState<string | null>(null);

  const aprobar = async (id: number) => {
    setProcesando(id);
    try {
      const res = await fetch(`/api/historial/${id}/verificar`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ accion: "aprobar" }),
      });
      if (!res.ok) {
        const j = await res.json();
        alert(j.error ?? "Error al aprobar");
        return;
      }
      router.refresh();
    } finally { setProcesando(null); }
  };

  const rechazar = async (id: number) => {
    if (!motivo.trim() || motivo.trim().length < 5) {
      setError("Ingresa un motivo de al menos 5 caracteres");
      return;
    }
    setProcesando(id);
    setError(null);
    try {
      const res = await fetch(`/api/historial/${id}/verificar`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ accion: "rechazar", motivo }),
      });
      if (!res.ok) {
        const j = await res.json();
        alert(j.error ?? "Error al rechazar");
        return;
      }
      setModalRechazo(null);
      setMotivo("");
      router.refresh();
    } finally { setProcesando(null); }
  };

  if (pendientes.length === 0) {
    return (
      <div
        className="card text-center py-16"
        style={{ background: "var(--blanco)" }}
      >
        <CheckCircle className="w-12 h-12 mx-auto mb-4" style={{ color: "var(--verde)" }} />
        <p className="text-lg font-bold" style={{ color: "var(--azul-pizarra)", fontFamily: "'Source Serif 4', serif" }}>
          Sin verificaciones pendientes
        </p>
        <p className="text-sm mt-1" style={{ color: "var(--gris-grafito)" }}>
          Todas las experiencias laborales han sido procesadas
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {pendientes.map(p => (
        <div key={p.id} className="card" style={{ background: "var(--blanco)" }}>
          <div className="flex flex-col md:flex-row md:items-start gap-4">

            {/* Info del egresado */}
            <div
              className="flex items-center gap-3 p-3 rounded-xl shrink-0"
              style={{ background: "var(--humo)", border: "1px solid var(--borde)", minWidth: "200px" }}
            >
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center font-bold text-sm shrink-0"
                style={{ background: "var(--turquesa-light)", color: "var(--turquesa-dark)" }}
              >
                {(p.apellidoPaterno ?? p.apellidos)[0]}{p.nombres[0]}
              </div>
              <div className="min-w-0">
                <p className="font-semibold text-sm truncate" style={{ color: "var(--azul-pizarra)" }}>
                  {p.apellidoPaterno ?? p.apellidos}, {p.nombres}
                </p>
                <p className="text-xs font-mono" style={{ color: "var(--placeholder)" }}>CI: {p.ci}</p>
              </div>
            </div>

            {/* Info de la experiencia */}
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between gap-3 mb-2">
                <div>
                  <p className="font-bold" style={{ color: "var(--azul-pizarra)" }}>{p.cargo}</p>
                  <div className="flex items-center gap-1.5 mt-0.5">
                    <Building2 className="w-3.5 h-3.5" style={{ color: "var(--placeholder)" }} />
                    <p className="text-sm" style={{ color: "var(--gris-grafito)" }}>{p.empresa}</p>
                  </div>
                </div>
                <span
                  className="badge shrink-0"
                  style={{
                    background: "var(--naranja-light)",
                    color: "var(--naranja)",
                    border: "1px solid #fed7aa",
                  }}
                >
                  ⏳ Pendiente
                </span>
              </div>

              <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs mb-3" style={{ color: "var(--gris-grafito)" }}>
                {p.ciudad && (
                  <span className="flex items-center gap-1">
                    <MapPin className="w-3 h-3" /> {p.ciudad}
                  </span>
                )}
                {p.sector && <span className="font-medium">{p.sector}</span>}
                <span className="flex items-center gap-1">
                  <Calendar className="w-3 h-3" />
                  {fmtDate(p.fechaInicio)} — {p.fechaFin ? fmtDate(p.fechaFin) : "presente"}
                </span>
                {p.documentoSubidoEn && (
                  <span style={{ color: "var(--placeholder)" }}>
                    Subido: {fmtDate(typeof p.documentoSubidoEn === 'string' ? p.documentoSubidoEn : new Date(p.documentoSubidoEn).toISOString())}
                  </span>
                )}
              </div>

              {/* Documento */}
              {p.documentoNombre && (
                <div className="flex items-center gap-2 mb-4">
                  <FileText className="w-4 h-4 shrink-0" style={{ color: "var(--turquesa)" }} />
                  <a
                    href={`/api/historial/${p.id}/verificar`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm font-medium flex items-center gap-1.5 transition-colors"
                    style={{ color: "var(--turquesa-dark)" }}
                  >
                    <Eye className="w-3.5 h-3.5" />
                    Ver documento: {p.documentoNombre}
                  </a>
                </div>
              )}

              {/* Botones */}
              {modalRechazo === p.id ? (
                <div
                  className="rounded-xl p-4 space-y-3"
                  style={{ background: "#FEF2F2", border: "1px solid #FECACA" }}
                >
                  <p className="text-sm font-semibold" style={{ color: "#dc2626" }}>
                    Motivo del rechazo
                  </p>
                  <textarea
                    value={motivo}
                    onChange={e => { setMotivo(e.target.value); setError(null); }}
                    placeholder="Explica por qué se rechaza esta verificación..."
                    rows={3}
                    className="field text-sm resize-none"
                  />
                  {error && <p className="hint">{error}</p>}
                  <div className="flex gap-2">
                    <button
                      onClick={() => rechazar(p.id)}
                      disabled={procesando === p.id}
                      className="btn-danger btn-sm"
                    >
                      {procesando === p.id ? <span className="spinner" /> : <XCircle className="w-4 h-4" />}
                      Confirmar rechazo
                    </button>
                    <button
                      onClick={() => { setModalRechazo(null); setMotivo(""); setError(null); }}
                      className="btn-ghost btn-sm"
                    >
                      Cancelar
                    </button>
                  </div>
                </div>
              ) : (
                <div className="flex gap-2">
                  <button
                    onClick={() => aprobar(p.id)}
                    disabled={procesando === p.id}
                    className="btn-sm flex items-center gap-2 font-semibold transition-all"
                    style={{
                      background: "var(--verde-light)",
                      color: "var(--verde)",
                      border: "1px solid #86efac",
                      padding: "0.5rem 0.875rem",
                      borderRadius: "0.5rem",
                    }}
                  >
                    {procesando === p.id
                      ? <span className="w-4 h-4 border-2 border-green-300 border-t-green-700 rounded-full animate-spin" />
                      : <CheckCircle className="w-4 h-4" />
                    }
                    Aprobar
                  </button>
                  <button
                    onClick={() => { setModalRechazo(p.id); setError(null); }}
                    disabled={procesando === p.id}
                    className="btn-danger btn-sm"
                  >
                    <XCircle className="w-4 h-4" /> Rechazar
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
