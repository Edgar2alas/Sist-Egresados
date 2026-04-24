"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Building2, MapPin, Pencil, Trash2, X, Briefcase, CheckCircle, Clock, XCircle } from "lucide-react";
import { cn, fmtDate } from "@/lib/utils";
import HistorialForm from "./HistorialForm";

function VerificacionBadge({ estado, motivo }: { estado: string | null; motivo?: string | null }) {
  if (!estado) return null;
  if (estado === "aprobado") return (
    <div className="flex items-center gap-1.5 mt-1">
      <CheckCircle className="w-3.5 h-3.5" style={{ color: "var(--verde)" }} />
      <span className="text-xs font-medium" style={{ color: "var(--verde)" }}>Verificado</span>
    </div>
  );
  if (estado === "rechazado") return (
    <div className="mt-1">
      <div className="flex items-center gap-1.5">
        <XCircle className="w-3.5 h-3.5 text-red-400" />
        <span className="text-xs font-medium text-red-400">Rechazado</span>
      </div>
      {motivo && <p className="text-xs text-red-400/70 mt-0.5">{motivo}</p>}
    </div>
  );
  if (estado === "pendiente") return (
    <div className="flex items-center gap-1.5 mt-1">
      <Clock className="w-3.5 h-3.5" style={{ color: "var(--naranja)" }} />
      <span className="text-xs font-medium" style={{ color: "var(--naranja)" }}>En verificación</span>
    </div>
  );
  return null;
}

export default function MiPerfilHistorial({
  historial, idEgresado,
}: { historial: any[]; idEgresado: number }) {
  const router = useRouter();
  const [editing, setEditing]   = useState<number | null>(null);
  const [deleting, setDeleting] = useState<number | null>(null);

  const handleDelete = async (id: number) => {
    if (!confirm("¿Eliminar este registro de experiencia?")) return;
    setDeleting(id);
    await fetch(`/api/historial/${id}`, { method: "DELETE" });
    router.refresh();
    setDeleting(null);
  };

  return (
    <div className="space-y-3">
      {historial.map(h => (
        <div key={h.id}>
          {editing === h.id ? (
            <div className="border border-primary-500/30 bg-primary-500/5 rounded-xl p-4">
              <div className="flex items-center justify-between mb-4">
                <p className="text-primary-300 text-sm font-semibold">Editando experiencia</p>
                <button onClick={() => setEditing(null)} className="btn-ghost btn-xs">
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
              <HistorialForm
                idEgresado={idEgresado}
                historial={h}
                onSuccess={() => { setEditing(null); router.refresh(); }}
              />
            </div>
          ) : (
            <div className={cn(
              "rounded-xl p-4 border group",
              h.fechaFin === null
                ? "bg-emerald-500/5 border-emerald-500/20"
                : "bg-slate-800/40 border-slate-700/50"
            )}>
              <div className="flex items-start justify-between gap-3">
                <div className="flex gap-3 flex-1 min-w-0">
                  <div className="w-9 h-9 bg-slate-700 rounded-xl flex items-center justify-center shrink-0">
                    <Building2 className="w-4 h-4 text-slate-400" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-white font-semibold text-sm">{h.cargo}</p>
                    <p className="text-slate-400 text-sm">{h.empresa}</p>
                    <div className="flex flex-wrap gap-x-3 gap-y-0.5 mt-1.5">
                      {h.area && (
                        <span className="text-slate-500 text-xs flex items-center gap-1">
                          <Briefcase className="w-3 h-3" /> {h.area}
                        </span>
                      )}
                      {h.ciudad && (
                        <span className="text-slate-500 text-xs flex items-center gap-1">
                          <MapPin className="w-3 h-3" /> {h.ciudad}
                        </span>
                      )}
                      {h.sector && (
                        <span className={cn(
                          "text-xs px-1.5 py-0.5 rounded-md font-medium",
                          h.sector === "Publico"
                            ? "bg-blue-500/10 text-blue-400"
                            : h.sector === "Privado"
                            ? "bg-purple-500/10 text-purple-400"
                            : "bg-slate-700 text-slate-400"
                        )}>
                          {h.sector}
                        </span>
                      )}
                      {h.tipoContrato && (
                        <span className="text-slate-600 text-xs">{h.tipoContrato}</span>
                      )}
                    </div>
                    <VerificacionBadge estado={h.verificacionEstado} motivo={h.rechazoMotivo} />
                  </div>
                </div>

                <div className="flex items-start gap-2 shrink-0">
                  <div className="text-right">
                    {h.fechaFin === null
                      ? <span className="badge badge-green">Actual</span>
                      : <span className="badge badge-slate">Finalizado</span>}
                    <p className="text-slate-600 text-xs mt-1.5">
                      {fmtDate(h.fechaInicio)} — {h.fechaFin ? fmtDate(h.fechaFin) : "presente"}
                    </p>
                  </div>
                  <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button onClick={() => setEditing(h.id)} className="btn-slate btn-xs">
                      <Pencil className="w-3 h-3" />
                    </button>
                    <button
                      onClick={() => handleDelete(h.id)}
                      disabled={deleting === h.id}
                      className="btn-danger btn-xs">
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}