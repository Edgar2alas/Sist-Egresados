"use client";
// src/components/perfil/DirectorioToggle.tsx
import { useState } from "react";
import { Globe, EyeOff } from "lucide-react";

export default function DirectorioToggle({ inicial }: { inicial: boolean }) {
  const [activo, setActivo] = useState(inicial);
  const [loading, setLoading] = useState(false);

  const toggle = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/egresados/directorio", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ mostrar: !activo }),
      });
      if (res.ok) setActivo(v => !v);
    } finally { setLoading(false); }
  };

  return (
    <div
      className="rounded-xl p-4 flex items-start gap-3"
      style={{
        background: activo ? "var(--turquesa-pale)" : "var(--humo)",
        border: `1px solid ${activo ? "rgba(0,165,168,0.25)" : "var(--borde)"}`,
        transition: "all 0.2s",
      }}
    >
      <div
        className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0"
        style={{
          background: activo ? "rgba(0,165,168,0.15)" : "var(--borde)",
          color: activo ? "var(--turquesa)" : "var(--placeholder)",
        }}
      >
        {activo ? <Globe className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold" style={{ color: "var(--azul-pizarra)" }}>
          {activo ? "Visible en el directorio" : "No visible en el directorio"}
        </p>
        <p className="text-xs mt-0.5" style={{ color: "var(--gris-grafito)" }}>
          {activo
            ? "Tu perfil aparece en el directorio público. Los empleadores y colegas pueden encontrarte."
            : "Tu perfil está oculto. Actívalo para aparecer en el directorio y ser más visible."}
        </p>
      </div>
      <button
        onClick={toggle}
        disabled={loading}
        className="btn-sm shrink-0"
        style={{
          background: activo ? "var(--blanco)" : "var(--turquesa)",
          color: activo ? "var(--gris-grafito)" : "white",
          border: activo ? "1px solid var(--borde)" : "none",
          padding: "0.375rem 0.875rem",
          borderRadius: "0.5rem",
          fontSize: "0.75rem",
          fontWeight: 600,
          cursor: loading ? "not-allowed" : "pointer",
          opacity: loading ? 0.7 : 1,
          transition: "all 0.15s",
        }}
      >
        {loading
          ? "..."
          : activo
          ? "Ocultar"
          : "Activar visibilidad"
        }
      </button>
    </div>
  );
}
