"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Shield, Mail, Phone, CheckCircle, AlertTriangle,
  X, ArrowRight, RefreshCw, Pencil,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface Props {
  correo:            string | null | undefined;
  celular:           string | null | undefined;
  correoVerificado:  boolean;
  celularVerificado: boolean;
}

type Vista = "resumen" | "cambiar_correo" | "cambiar_celular" | "verificar_correo" | "verificar_celular";

export default function ContactoVerificacionModal({
  correo: correoInicial,
  celular: celularInicial,
  correoVerificado: correoVerIni,
  celularVerificado: celularVerIni,
}: Props) {
  const router  = useRouter();
  const [open,  setOpen]  = useState(false);

  // Estado local mutable
  const [correo,            setCorreo]            = useState(correoInicial ?? "");
  const [celular,           setCelular]           = useState(celularInicial ?? "");
  const [correoVerificado,  setCorreoVerificado]  = useState(correoVerIni);
  const [celularVerificado, setCelularVerificado] = useState(celularVerIni);

  const [vista,   setVista]   = useState<Vista>("resumen");
  const [valor,   setValor]   = useState("");
  const [codigo,  setCodigo]  = useState("");
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState<string | null>(null);
  const [okMsg,   setOkMsg]   = useState<string | null>(null);

  const reset = () => {
    setVista("resumen");
    setValor("");
    setCodigo("");
    setError(null);
    setOkMsg(null);
  };

  // ── Enviar código de verificación ────────────────────────────────────────
  const enviarCodigo = async (tipo: "verificar_correo" | "verificar_celular", val: string) => {
    setError(null);
    setLoading(true);
    try {
      const body = tipo === "verificar_correo"
        ? { tipo, correo: val }
        : { tipo, celular: val };

      const res  = await fetch("/api/auth/solicitar-codigo", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const json = await res.json();
      if (!res.ok) { setError(json.error); return false; }
      return true;
    } finally { setLoading(false); }
  };

  // ── Verificar código ─────────────────────────────────────────────────────
  const verificarCodigo = async (tipo: "verificar_correo" | "verificar_celular") => {
    if (codigo.length !== 6) { setError("El código debe tener 6 dígitos"); return; }
    setError(null);
    setLoading(true);
    try {
      const res  = await fetch("/api/auth/verificar-contacto", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tipo, codigo }),
      });
      const json = await res.json();
      if (!res.ok) { setError(json.error); return; }

      if (tipo === "verificar_correo") {
        setCorreo(valor || correo);
        setCorreoVerificado(true);
        setOkMsg("✓ Correo verificado correctamente");
      } else {
        setCelular(valor || celular);
        setCelularVerificado(true);
        setOkMsg("✓ Celular verificado correctamente");
      }
      setCodigo("");
      setValor("");
      setVista("resumen");
      router.refresh();
    } finally { setLoading(false); }
  };

  // ── Iniciar cambio de correo ─────────────────────────────────────────────
  const iniciarCambioCorreo = async () => {
    if (!valor.trim()) { setError("Ingresa el nuevo correo"); return; }
    const ok = await enviarCodigo("verificar_correo", valor.trim());
    if (ok) setVista("verificar_correo");
  };

  // ── Iniciar cambio de celular ────────────────────────────────────────────
  const iniciarCambioCelular = async () => {
    if (!valor.trim()) { setError("Ingresa el nuevo celular"); return; }
    const ok = await enviarCodigo("verificar_celular", valor.trim());
    if (ok) setVista("verificar_celular");
  };

  // ── Indicador de estado ──────────────────────────────────────────────────
  const totalVerificados = (correoVerificado ? 1 : 0) + (celularVerificado ? 1 : 0);
  const todoOk = totalVerificados === 2;
  const ninguno = totalVerificados === 0;

  return (
    <>
      {/* ── Botón trigger ── */}
      <button
        onClick={() => { setOpen(true); reset(); }}
        className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all w-full"
        style={{
          background: ninguno
            ? "rgba(245,158,11,0.08)"
            : todoOk
            ? "var(--verde-light)"
            : "var(--turquesa-pale)",
          border: `1px solid ${
            ninguno ? "#fed7aa"
            : todoOk ? "#86efac"
            : "rgba(0,165,168,0.25)"
          }`,
          color: ninguno
            ? "var(--naranja)"
            : todoOk
            ? "var(--verde)"
            : "var(--turquesa-dark)",
        }}
      >
        <Shield className="w-4 h-4 shrink-0" />
        <span className="flex-1 text-left">
          {ninguno
            ? "⚠ Sin métodos de contacto verificados"
            : todoOk
            ? "✓ Cuenta completamente verificada"
            : "Verificación de cuenta"}
        </span>
        <span className="text-xs opacity-70">
          {totalVerificados}/2 verificados
        </span>
      </button>

      {/* ── Modal ── */}
      {open && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ background: "rgba(30,43,59,0.70)", backdropFilter: "blur(4px)" }}
          onClick={e => { if (e.currentTarget === e.target) { setOpen(false); reset(); } }}
        >
          <div
            className="w-full max-w-md rounded-3xl overflow-hidden animate-fade-up"
            style={{
              background: "var(--blanco)",
              boxShadow: "0 25px 60px rgba(30,43,59,0.25)",
            }}
          >
            {/* Header */}
            <div
              className="px-6 py-5 flex items-center justify-between"
              style={{ background: "var(--marino)", borderBottom: "1px solid rgba(255,255,255,0.07)" }}
            >
              <div className="flex items-center gap-3">
                <Shield className="w-5 h-5" style={{ color: "var(--turquesa)" }} />
                <div>
                  <p className="text-white font-bold text-sm" style={{ fontFamily: "'Source Serif 4', serif" }}>
                    Verificación de cuenta
                  </p>
                  <p className="text-xs" style={{ color: "rgba(255,255,255,0.50)" }}>
                    Administra tus métodos de contacto
                  </p>
                </div>
              </div>
              <button
                onClick={() => { setOpen(false); reset(); }}
                className="w-8 h-8 flex items-center justify-center rounded-xl"
                style={{ color: "rgba(255,255,255,0.55)", background: "rgba(255,255,255,0.07)" }}
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-6 space-y-5">

              {okMsg && (
                <div className="flex items-center gap-2 px-4 py-3 rounded-xl"
                  style={{ background: "var(--verde-light)", border: "1px solid #86efac" }}>
                  <CheckCircle className="w-4 h-4 shrink-0" style={{ color: "var(--verde)" }} />
                  <p className="text-sm font-medium" style={{ color: "var(--verde)" }}>{okMsg}</p>
                </div>
              )}

              {/* ── RESUMEN ── */}
              {vista === "resumen" && (
                <div className="space-y-3">
                  {/* Correo */}
                  <div
                    className="flex items-center gap-3 p-4 rounded-xl"
                    style={{
                      background: correoVerificado ? "var(--verde-light)" : "var(--naranja-light)",
                      border: `1px solid ${correoVerificado ? "#86efac" : "#fed7aa"}`,
                    }}
                  >
                    <Mail className="w-5 h-5 shrink-0"
                      style={{ color: correoVerificado ? "var(--verde)" : "var(--naranja)" }} />
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-semibold uppercase tracking-wide"
                        style={{ color: correoVerificado ? "var(--verde)" : "var(--naranja)" }}>
                        Correo electrónico
                      </p>
                      <p className="text-sm truncate" style={{ color: "var(--azul-pizarra)" }}>
                        {correo || <span style={{ color: "var(--placeholder)" }}>Sin correo registrado</span>}
                      </p>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      {correoVerificado
                        ? <CheckCircle className="w-5 h-5" style={{ color: "var(--verde)" }} />
                        : <AlertTriangle className="w-5 h-5" style={{ color: "var(--naranja)" }} />
                      }
                      <button
                        onClick={() => { setVista("cambiar_correo"); setValor(""); setError(null); setOkMsg(null); }}
                        className="p-1.5 rounded-lg transition-all"
                        style={{ background: "rgba(0,0,0,0.06)" }}
                        title={correoVerificado ? "Cambiar correo" : "Agregar y verificar correo"}
                      >
                        <Pencil className="w-3.5 h-3.5" style={{ color: "var(--gris-grafito)" }} />
                      </button>
                    </div>
                  </div>

                  {/* Celular */}
                  <div
                    className="flex items-center gap-3 p-4 rounded-xl"
                    style={{
                      background: celularVerificado ? "var(--verde-light)" : "var(--naranja-light)",
                      border: `1px solid ${celularVerificado ? "#86efac" : "#fed7aa"}`,
                    }}
                  >
                    <Phone className="w-5 h-5 shrink-0"
                      style={{ color: celularVerificado ? "var(--verde)" : "var(--naranja)" }} />
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-semibold uppercase tracking-wide"
                        style={{ color: celularVerificado ? "var(--verde)" : "var(--naranja)" }}>
                        Celular
                      </p>
                      <p className="text-sm truncate" style={{ color: "var(--azul-pizarra)" }}>
                        {celular || <span style={{ color: "var(--placeholder)" }}>Sin celular registrado</span>}
                      </p>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      {celularVerificado
                        ? <CheckCircle className="w-5 h-5" style={{ color: "var(--verde)" }} />
                        : <AlertTriangle className="w-5 h-5" style={{ color: "var(--naranja)" }} />
                      }
                      <button
                        onClick={() => { setVista("cambiar_celular"); setValor(""); setError(null); setOkMsg(null); }}
                        className="p-1.5 rounded-lg transition-all"
                        style={{ background: "rgba(0,0,0,0.06)" }}
                        title={celularVerificado ? "Cambiar celular" : "Agregar y verificar celular"}
                      >
                        <Pencil className="w-3.5 h-3.5" style={{ color: "var(--gris-grafito)" }} />
                      </button>
                    </div>
                  </div>

                  {!correoVerificado && !celularVerificado && (
                    <div className="rounded-xl px-4 py-3 text-sm"
                      style={{ background: "rgba(245,158,11,0.08)", border: "1px solid #fed7aa", color: "var(--naranja)" }}>
                      ⚠ Sin métodos verificados no podrás recuperar tu contraseña si la olvidas.
                    </div>
                  )}
                </div>
              )}

              {/* ── CAMBIAR CORREO ── */}
              {vista === "cambiar_correo" && (
                <div className="space-y-4">
                  <button onClick={reset} className="flex items-center gap-1.5 text-xs"
                    style={{ color: "var(--gris-grafito)" }}>
                    ← Volver
                  </button>
                  <div>
                    <label className="label">
                      {correoVerificado ? "Nuevo correo electrónico" : "Correo electrónico"}
                    </label>
                    {correoVerificado && correo && (
                      <p className="text-xs mb-2" style={{ color: "var(--placeholder)" }}>
                        Actual: <strong style={{ color: "var(--azul-pizarra)" }}>{correo}</strong>
                      </p>
                    )}
                    <input
                      type="email"
                      value={valor}
                      onChange={e => setValor(e.target.value)}
                      placeholder="nuevo@correo.com"
                      className="field"
                      autoFocus
                    />
                  </div>
                  {error && <p className="error-box">{error}</p>}
                  <button
                    onClick={iniciarCambioCorreo}
                    disabled={loading || !valor.trim()}
                    className="btn-primary w-full py-2.5"
                  >
                    {loading
                      ? <><span className="spinner" /> Enviando...</>
                      : <><ArrowRight className="w-4 h-4" /> Enviar código de verificación</>}
                  </button>
                  <p className="text-xs text-center" style={{ color: "var(--placeholder)" }}>
                    Se enviará un código al nuevo correo para confirmarlo
                  </p>
                </div>
              )}

              {/* ── CAMBIAR CELULAR ── */}
              {vista === "cambiar_celular" && (
                <div className="space-y-4">
                  <button onClick={reset} className="flex items-center gap-1.5 text-xs"
                    style={{ color: "var(--gris-grafito)" }}>
                    ← Volver
                  </button>
                  <div>
                    <label className="label">
                      {celularVerificado ? "Nuevo número de celular" : "Número de celular"}
                    </label>
                    {celularVerificado && celular && (
                      <p className="text-xs mb-2" style={{ color: "var(--placeholder)" }}>
                        Actual: <strong style={{ color: "var(--azul-pizarra)" }}>{celular}</strong>
                      </p>
                    )}
                    <input
                      type="tel"
                      value={valor}
                      onChange={e => setValor(e.target.value)}
                      placeholder="7XXXXXXX"
                      className="field"
                      autoFocus
                    />
                  </div>
                  {error && <p className="error-box">{error}</p>}
                  <button
                    onClick={iniciarCambioCelular}
                    disabled={loading || !valor.trim()}
                    className="btn-primary w-full py-2.5"
                  >
                    {loading
                      ? <><span className="spinner" /> Enviando...</>
                      : <><ArrowRight className="w-4 h-4" /> Enviar código al celular</>}
                  </button>
                  <p className="text-xs text-center" style={{ color: "var(--placeholder)" }}>
                    Se enviará un SMS al nuevo número para confirmarlo
                  </p>
                </div>
              )}

              {/* ── VERIFICAR CORREO ── */}
              {vista === "verificar_correo" && (
                <div className="space-y-4">
                  <div className="rounded-xl px-4 py-3 text-sm"
                    style={{ background: "var(--turquesa-pale)", border: "1px solid rgba(0,165,168,0.20)" }}>
                    Código enviado a <strong>{valor}</strong>
                  </div>
                  <div>
                    <label className="label">Código de verificación</label>
                    <input
                      type="text"
                      inputMode="numeric"
                      maxLength={6}
                      value={codigo}
                      onChange={e => setCodigo(e.target.value.replace(/\D/g, ""))}
                      placeholder="000000"
                      className="field text-center text-2xl tracking-[0.5em] font-mono"
                      autoFocus
                    />
                  </div>
                  {error && <p className="error-box">{error}</p>}
                  <button
                    onClick={() => verificarCodigo("verificar_correo")}
                    disabled={loading || codigo.length !== 6}
                    className="btn-primary w-full py-2.5"
                  >
                    {loading ? <><span className="spinner" /> Verificando...</> : "Confirmar correo"}
                  </button>
                  <button
                    onClick={() => { enviarCodigo("verificar_correo", valor); setCodigo(""); }}
                    disabled={loading}
                    className="btn-ghost w-full text-sm flex items-center justify-center gap-1.5"
                  >
                    <RefreshCw className="w-3.5 h-3.5" /> Reenviar código
                  </button>
                </div>
              )}

              {/* ── VERIFICAR CELULAR ── */}
              {vista === "verificar_celular" && (
                <div className="space-y-4">
                  <div className="rounded-xl px-4 py-3 text-sm"
                    style={{ background: "var(--turquesa-pale)", border: "1px solid rgba(0,165,168,0.20)" }}>
                    Código enviado al celular <strong>{valor}</strong>
                  </div>
                  <div>
                    <label className="label">Código de verificación</label>
                    <input
                      type="text"
                      inputMode="numeric"
                      maxLength={6}
                      value={codigo}
                      onChange={e => setCodigo(e.target.value.replace(/\D/g, ""))}
                      placeholder="000000"
                      className="field text-center text-2xl tracking-[0.5em] font-mono"
                      autoFocus
                    />
                  </div>
                  {error && <p className="error-box">{error}</p>}
                  <button
                    onClick={() => verificarCodigo("verificar_celular")}
                    disabled={loading || codigo.length !== 6}
                    className="btn-primary w-full py-2.5"
                  >
                    {loading ? <><span className="spinner" /> Verificando...</> : "Confirmar celular"}
                  </button>
                  <button
                    onClick={() => { enviarCodigo("verificar_celular", valor); setCodigo(""); }}
                    disabled={loading}
                    className="btn-ghost w-full text-sm flex items-center justify-center gap-1.5"
                  >
                    <RefreshCw className="w-3.5 h-3.5" /> Reenviar código
                  </button>
                </div>
              )}

            </div>
          </div>
        </div>
      )}
    </>
  );
}