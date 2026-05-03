"use client";
import { useState } from "react";
import { Send, CheckCircle } from "lucide-react";

export default function SugerenciaForm() {
  const [mensaje,   setMensaje]   = useState("");
  const [loading,   setLoading]   = useState(false);
  const [enviado,   setEnviado]   = useState(false);
  const [error,     setError]     = useState<string | null>(null);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (mensaje.trim().length < 10) { setError("Mínimo 10 caracteres"); return; }
    setLoading(true);
    setError(null);
    try {
      const res  = await fetch("/api/sugerencias", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tipo: "Sugerencia general", mensaje, esAnonima: false }),
      });
      const json = await res.json();
      if (!res.ok) { setError(json.error); return; }
      setEnviado(true);
      setMensaje("");
    } catch { setError("Error al enviar"); }
    finally { setLoading(false); }
  };

  if (enviado) return (
    <div className="text-center py-8">
      <CheckCircle className="w-12 h-12 mx-auto mb-3" style={{ color: "var(--verde)" }} />
      <p className="font-semibold" style={{ color: "var(--azul-pizarra)", fontFamily: "'Source Serif 4', serif" }}>
        ¡Sugerencia enviada!
      </p>
      <p className="text-sm mt-1 mb-4" style={{ color: "var(--gris-grafito)" }}>
        Gracias por tu aporte a la carrera.
      </p>
      <button onClick={() => setEnviado(false)} className="btn-slate btn-sm">
        Enviar otra
      </button>
    </div>
  );

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      {error && <p className="error-box">{error}</p>}

      <div>
        <label className="label">Mensaje</label>
        <textarea
          value={mensaje}
          onChange={e => setMensaje(e.target.value)}
          rows={5}
          placeholder="Escribe tu sugerencia, comentario o recomendación..."
          className="field resize-none"
          style={{ background: "var(--humo)", color: "var(--azul-pizarra)" }}
        />
        <p className="text-xs mt-1" style={{ color: "var(--placeholder)" }}>
          {mensaje.length}/2000 caracteres {mensaje.length < 10 && mensaje.length > 0 && "— mínimo 10"}
        </p>
      </div>

      <button
        type="submit"
        disabled={loading || mensaje.trim().length < 10}
        className="btn-primary w-full"
      >
        {loading
          ? <><span className="spinner" /> Enviando...</>
          : <><Send className="w-4 h-4" /> Enviar sugerencia</>}
      </button>
    </form>
  );
}