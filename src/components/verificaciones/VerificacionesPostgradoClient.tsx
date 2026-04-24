"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { CheckCircle, XCircle, Eye, FileText, BookOpen, Calendar, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";

interface PendientePostgrado {
  id:                number;
  tipo:              string;
  institucion:       string;
  pais:              string;
  anioInicio:        number;
  anioFin:           number | null;
  estado:            string;
  verificacionEstado:string | null;
  documentoNombre:   string | null;
  documentoTipo:     string | null;
  documentoSubidoEn: Date | string | null;
  esSolicitudCambio: boolean;
  datosPropuestos:   string | null;
  egresadoId:        number;
  nombres:           string;
  apellidos:         string;
  apellidoPaterno:   string | null;
  ci:                string;
}

export default function VerificacionesPostgradoClient({
  pendientes,
}: { pendientes: PendientePostgrado[] }) {
  const router = useRouter();
  const [procesando,    setProcesando]    = useState<number | null>(null);
  const [modalRechazo,  setModalRechazo]  = useState<number | null>(null);
  const [motivo,        setMotivo]        = useState("");
  const [error,         setError]         = useState<string | null>(null);

  const aprobar = async (id: number) => {
    setProcesando(id);
    try {
      const res = await fetch(`/api/postgrado/${id}/verificar`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ accion: "aprobar" }),
      });
      if (!res.ok) { const j = await res.json(); alert(j.error ?? "Error"); return; }
      router.refresh();
    } finally { setProcesando(null); }
  };

  const rechazar = async (id: number) => {
    if (!motivo.trim() || motivo.trim().length < 5) {
      setError("Ingresa un motivo de al menos 5 caracteres"); return;
    }
    setProcesando(id);
    setError(null);
    try {
      const res = await fetch(`/api/postgrado/${id}/verificar`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ accion: "rechazar", motivo }),
      });
      if (!res.ok) { const j = await res.json(); alert(j.error ?? "Error"); return; }
      setModalRechazo(null);
      setMotivo("");
      router.refresh();
    } finally { setProcesando(null); }
  };

  if (pendientes.length === 0) {
    return (
      <div className="card text-center py-12" style={{ background: "var(--blanco)" }}>
        <CheckCircle className="w-10 h-10 mx-auto mb-3" style={{ color: "var(--verde)" }} />
        <p className="font-semibold" style={{ color: "var(--azul-pizarra)" }}>
          Sin verificaciones de postgrado pendientes
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {pendientes.map(p => {
        let propuestos: any = null;
        if (p.esSolicitudCambio && p.datosPropuestos) {
          try { propuestos = JSON.parse(p.datosPropuestos); } catch { }
        }

        return (
          <div key={p.id} className="card" style={{ background: "var(--blanco)" }}>
            <div className="flex flex-col md:flex-row md:items-start gap-4">

              {/* Egresado */}
              <div className="flex items-center gap-3 p-3 rounded-xl shrink-0"
                style={{ background: "var(--humo)", border: "1px solid var(--borde)", minWidth: "200px" }}>
                <div className="w-10 h-10 rounded-xl flex items-center justify-center font-bold text-sm shrink-0"
                  style={{ background: "var(--turquesa-light)", color: "var(--turquesa-dark)" }}>
                  {(p.apellidoPaterno ?? p.apellidos)[0]}{p.nombres[0]}
                </div>
                <div className="min-w-0">
                  <p className="font-semibold text-sm truncate" style={{ color: "var(--azul-pizarra)" }}>
                    {p.apellidoPaterno ?? p.apellidos}, {p.nombres}
                  </p>
                  <p className="text-xs font-mono" style={{ color: "var(--placeholder)" }}>CI: {p.ci}</p>
                </div>
              </div>

              {/* Info del postgrado */}
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-3 mb-2">
                  <div>
                    <div className="flex items-center gap-2 mb-0.5">
                      <BookOpen className="w-4 h-4" style={{ color: "var(--turquesa)" }} />
                      <p className="font-bold" style={{ color: "var(--azul-pizarra)" }}>{p.tipo}</p>
                      {p.esSolicitudCambio && (
                        <span className="badge" style={{
                          background: "rgba(139,92,246,0.10)",
                          color: "#7c3aed",
                          border: "1px solid rgba(139,92,246,0.20)",
                        }}>
                          Solicitud de cambio
                        </span>
                      )}
                    </div>
                    <p className="text-sm" style={{ color: "var(--gris-grafito)" }}>{p.institucion} · {p.pais}</p>
                    <p className="text-xs mt-0.5" style={{ color: "var(--placeholder)" }}>
                      {p.anioInicio}{p.anioFin ? `–${p.anioFin}` : ""} · {p.estado}
                    </p>
                  </div>
                  <span className="badge shrink-0" style={{
                    background: "var(--naranja-light)", color: "var(--naranja)",
                    border: "1px solid #fed7aa",
                  }}>
                    ⏳ Pendiente
                  </span>
                </div>

                {/* Datos propuestos vs actuales */}
                {propuestos && (
                  <div className="rounded-xl p-3 mb-3"
                    style={{ background: "rgba(139,92,246,0.05)", border: "1px solid rgba(139,92,246,0.15)" }}>
                    <p className="text-xs font-semibold mb-2" style={{ color: "#7c3aed" }}>
                      Cambios solicitados:
                    </p>
                    <div className="grid grid-cols-2 gap-x-6 gap-y-1 text-xs">
                      {([
                        ["Tipo",        p.tipo,        propuestos.tipo],
                        ["Institución", p.institucion, propuestos.institucion],
                        ["País",        p.pais,        propuestos.pais],
                        ["Año inicio",  String(p.anioInicio), String(propuestos.anioInicio)],
                        ["Año fin",     String(p.anioFin ?? "—"), String(propuestos.anioFin ?? "—")],
                        ["Estado",      p.estado,      propuestos.estado],
                      ] as [string, string, string][]).map(([label, actual, nuevo]) => (
                        actual !== nuevo ? (
                          <div key={label}>
                            <span style={{ color: "var(--placeholder)" }}>{label}: </span>
                            <span style={{ color: "#dc2626", textDecoration: "line-through" }}>{actual}</span>
                            {" → "}
                            <span style={{ color: "var(--verde)" }}>{nuevo}</span>
                          </div>
                        ) : null
                      ))}
                    </div>
                  </div>
                )}

                {/* Documento */}
                {p.documentoNombre && (
                  <div className="flex items-center gap-2 mb-3">
                    <FileText className="w-4 h-4 shrink-0" style={{ color: "var(--turquesa)" }} />
                    <a href={`/api/postgrado/${p.id}/verificar`} target="_blank" rel="noopener noreferrer"
                      className="text-sm font-medium flex items-center gap-1.5"
                      style={{ color: "var(--turquesa-dark)" }}>
                      <Eye className="w-3.5 h-3.5" />
                      {p.documentoNombre}
                    </a>
                  </div>
                )}

                {/* Botones */}
                {modalRechazo === p.id ? (
                  <div className="rounded-xl p-4 space-y-3"
                    style={{ background: "#FEF2F2", border: "1px solid #FECACA" }}>
                    <p className="text-sm font-semibold" style={{ color: "#dc2626" }}>Motivo del rechazo</p>
                    <textarea
                      value={motivo}
                      onChange={e => { setMotivo(e.target.value); setError(null); }}
                      placeholder="Explica por qué se rechaza..."
                      rows={3}
                      className="field text-sm resize-none"
                    />
                    {error && <p className="hint">{error}</p>}
                    <div className="flex gap-2">
                      <button onClick={() => rechazar(p.id)} disabled={procesando === p.id}
                        className="btn-danger btn-sm">
                        {procesando === p.id ? <span className="spinner" /> : <XCircle className="w-4 h-4" />}
                        Confirmar rechazo
                      </button>
                      <button onClick={() => { setModalRechazo(null); setMotivo(""); setError(null); }}
                        className="btn-ghost btn-sm">
                        Cancelar
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="flex gap-2">
                    <button onClick={() => aprobar(p.id)} disabled={procesando === p.id}
                      className="btn-sm flex items-center gap-2 font-semibold"
                      style={{
                        background: "var(--verde-light)", color: "var(--verde)",
                        border: "1px solid #86efac", padding: "0.5rem 0.875rem", borderRadius: "0.5rem",
                      }}>
                      {procesando === p.id
                        ? <span className="w-4 h-4 border-2 border-green-300 border-t-green-700 rounded-full animate-spin" />
                        : <CheckCircle className="w-4 h-4" />}
                      {p.esSolicitudCambio ? "Aprobar cambio" : "Aprobar"}
                    </button>
                    <button onClick={() => { setModalRechazo(p.id); setError(null); }}
                      disabled={procesando === p.id} className="btn-danger btn-sm">
                      <XCircle className="w-4 h-4" /> Rechazar
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}