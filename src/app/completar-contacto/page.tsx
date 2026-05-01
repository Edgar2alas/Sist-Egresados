"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Phone, Mail, CheckCircle, ArrowRight, Shield } from "lucide-react";
import { cn } from "@/lib/utils";

type Paso = "elegir" | "ingresar" | "verificar" | "listo";
type Canal = "correo" | "celular";

export default function CompletarContactoPage() {
  const router  = useRouter();
  const [paso,   setPaso]   = useState<Paso>("elegir");
  const [canal,  setCanal]  = useState<Canal>("correo");
  const [valor,  setValor]  = useState("");
  const [codigo, setCodigo] = useState("");
  const [error,  setError]  = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [correoVerificado,  setCorreoVerificado]  = useState(false);
  const [celularVerificado, setCelularVerificado] = useState(false);

  const enviarCodigo = async () => {
    setError(null);
    if (!valor.trim()) { setError("Ingresa un valor"); return; }

    setLoading(true);
    try {
      const body = canal === "correo"
        ? { tipo: "verificar_correo",   correo:  valor.trim() }
        : { tipo: "verificar_celular",  celular: valor.trim() };

      const res  = await fetch("/api/auth/solicitar-codigo", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const json = await res.json();
      if (!res.ok) { setError(json.error); return; }
      setPaso("verificar");
    } finally { setLoading(false); }
  };

  const verificarCodigo = async () => {
    setError(null);
    if (codigo.length !== 6) { setError("El código debe tener 6 dígitos"); return; }

    setLoading(true);
    try {
      const tipo = canal === "correo" ? "verificar_correo" : "verificar_celular";
      const res  = await fetch("/api/auth/verificar-contacto", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tipo, codigo }),
      });
      const json = await res.json();
      if (!res.ok) { setError(json.error); return; }

      if (canal === "correo")   setCorreoVerificado(true);
      if (canal === "celular")  setCelularVerificado(true);

      setCodigo("");
      setValor("");
      setPaso("elegir");
    } finally { setLoading(false); }
  };

  const continuar = () => {
    router.push("/activar-cuenta");
  };

  const tieneAlMenosUno = correoVerificado || celularVerificado;

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4">
      <div className="w-full max-w-md animate-fade-up">

        {/* Encabezado */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl
                          bg-primary-600/20 border border-primary-500/30 mb-4">
            <Shield className="w-8 h-8 text-primary-400" />
          </div>
          <h1 className="text-2xl font-bold text-white mb-1">Agrega un método de contacto</h1>
          <p className="text-slate-400 text-sm">
            Necesitas al menos uno para recuperar tu cuenta y cambiar tu contraseña
          </p>
        </div>

        <div className="card space-y-5">

          {/* Estado de verificación */}
          {(correoVerificado || celularVerificado) && (
            <div className="space-y-2">
              {correoVerificado && (
                <div className="flex items-center gap-2 px-3 py-2 rounded-xl"
                  style={{ background: "var(--verde-light)", border: "1px solid #86efac" }}>
                  <CheckCircle className="w-4 h-4 shrink-0" style={{ color: "var(--verde)" }} />
                  <span className="text-sm font-medium" style={{ color: "var(--verde)" }}>
                    Correo verificado
                  </span>
                </div>
              )}
              {celularVerificado && (
                <div className="flex items-center gap-2 px-3 py-2 rounded-xl"
                  style={{ background: "var(--verde-light)", border: "1px solid #86efac" }}>
                  <CheckCircle className="w-4 h-4 shrink-0" style={{ color: "var(--verde)" }} />
                  <span className="text-sm font-medium" style={{ color: "var(--verde)" }}>
                    Celular verificado
                  </span>
                </div>
              )}
            </div>
          )}

          {/* Paso: elegir canal */}
          {paso === "elegir" && (
            <>
              <p className="text-sm text-slate-400">
                {tieneAlMenosUno
                  ? "Ya tienes un método verificado. Puedes agregar otro o continuar."
                  : "Elige cómo quieres que te contactemos:"}
              </p>

              <div className="grid grid-cols-2 gap-3">
                {/* Correo */}
                {!correoVerificado && (
                  <button
                    onClick={() => { setCanal("correo"); setPaso("ingresar"); setError(null); }}
                    className="flex flex-col items-center gap-2 p-4 rounded-xl transition-all"
                    style={{
                      background: "var(--humo)",
                      border: "1.5px solid var(--borde)",
                    }}
                  >
                    <Mail className="w-6 h-6" style={{ color: "var(--turquesa)" }} />
                    <span className="text-sm font-medium" style={{ color: "var(--azul-pizarra)" }}>
                      Correo
                    </span>
                  </button>
                )}
                {/* Celular */}
                {!celularVerificado && (
                  <button
                    onClick={() => { setCanal("celular"); setPaso("ingresar"); setError(null); }}
                    className="flex flex-col items-center gap-2 p-4 rounded-xl transition-all"
                    style={{
                      background: "var(--humo)",
                      border: "1.5px solid var(--borde)",
                    }}
                  >
                    <Phone className="w-6 h-6" style={{ color: "var(--turquesa)" }} />
                    <span className="text-sm font-medium" style={{ color: "var(--azul-pizarra)" }}>
                      Celular
                    </span>
                  </button>
                )}
              </div>

              {tieneAlMenosUno && (
                <button
                  onClick={continuar}
                  className="btn-primary w-full py-3"
                >
                  Continuar a cambiar contraseña <ArrowRight className="w-4 h-4 inline ml-1" />
                </button>
              )}
            </>
          )}

          {/* Paso: ingresar valor */}
          {paso === "ingresar" && (
            <>
              <div>
                <label className="label">
                  {canal === "correo" ? "Correo electrónico" : "Número de celular"}
                </label>
                <input
                  type={canal === "correo" ? "email" : "tel"}
                  value={valor}
                  onChange={e => setValor(e.target.value)}
                  placeholder={canal === "correo" ? "tu@correo.com" : "7XXXXXXX"}
                  className="field"
                  autoFocus
                />
              </div>
              {error && <p className="error-box">{error}</p>}
              <button
                onClick={enviarCodigo}
                disabled={loading || !valor.trim()}
                className="btn-primary w-full py-3"
              >
                {loading ? <><span className="spinner" /> Enviando...</> : "Enviar código de verificación"}
              </button>
              <button
                onClick={() => { setPaso("elegir"); setError(null); setValor(""); }}
                className="btn-ghost w-full text-sm"
              >
                Volver
              </button>
            </>
          )}

          {/* Paso: verificar código */}
          {paso === "verificar" && (
            <>
              <div
                className="rounded-xl px-4 py-3 text-sm"
                style={{ background: "var(--turquesa-pale)", border: "1px solid rgba(0,165,168,0.20)" }}
              >
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
                onClick={verificarCodigo}
                disabled={loading || codigo.length !== 6}
                className="btn-primary w-full py-3"
              >
                {loading ? <><span className="spinner" /> Verificando...</> : "Verificar"}
              </button>
              <button
                onClick={() => { setPaso("ingresar"); setError(null); setCodigo(""); }}
                className="btn-ghost w-full text-sm"
              >
                Cambiar {canal === "correo" ? "correo" : "celular"}
              </button>
            </>
          )}
        </div>

        <p className="text-center mt-6 text-slate-700 text-xs">
          Universidad Mayor de San Andrés · FCPN
        </p>
      </div>
    </div>
  );
}