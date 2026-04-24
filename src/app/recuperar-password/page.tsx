"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { KeyRound, RefreshCw, Eye, EyeOff, ArrowLeft } from "lucide-react";
import { cn } from "@/lib/utils";

type Paso = "correo" | "codigo" | "password" | "exito";

export default function RecuperarPasswordPage() {
  const router = useRouter();

  const [paso,   setPaso]   = useState<Paso>("correo");
  const [correo, setCorreo] = useState("");
  const [codigo, setCodigo] = useState("");
  const [pass1,  setPass1]  = useState("");
  const [pass2,  setPass2]  = useState("");
  const [show1,  setShow1]  = useState(false);
  const [show2,  setShow2]  = useState(false);
  const [error,  setError]  = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // ── Paso 1: solicitar código ──────────────────────────────────────────────
  const solicitarCodigo = async () => {
    if (!correo) { setError("Ingresa tu correo."); return; }
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/auth/solicitar-codigo", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ correo, tipo: "reset_password" }),
      });
      const json = await res.json();
      if (!res.ok) { setError(json.error); return; }
      setPaso("codigo");
    } catch { setError("Error al enviar el código."); }
    finally { setLoading(false); }
  };

  // ── Paso 2: verificar código (avanzar a paso 3) ───────────────────────────
  const verificarCodigo = () => {
    if (codigo.length !== 6) { setError("El código debe tener 6 dígitos."); return; }
    setError(null);
    setPaso("password");
  };

  // ── Paso 3: cambiar contraseña ────────────────────────────────────────────
  const cambiarPassword = async () => {
    setError(null);
    if (pass1.length < 8) { setError("La contraseña debe tener al menos 8 caracteres."); return; }
    if (pass1 !== pass2)  { setError("Las contraseñas no coinciden."); return; }

    setLoading(true);
    try {
      const res  = await fetch("/api/auth/cambiar-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          correo,
          codigo,
          nuevaPassword:     pass1,
          confirmarPassword: pass2,
          tipo:              "reset_password",
        }),
      });
      const json = await res.json();
      if (!res.ok) { setError(json.error); return; }
      setPaso("exito");
    } catch { setError("Error al cambiar la contraseña."); }
    finally { setLoading(false); }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4">
      <div className="w-full max-w-md animate-fade-up">

        {/* Encabezado */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl
                          bg-amber-500/20 border border-amber-500/30 mb-4">
            <KeyRound className="w-8 h-8 text-amber-400" />
          </div>
          <h1 className="text-2xl font-bold text-white mb-1">Recuperar contraseña</h1>
          <p className="text-slate-500 text-sm">
            {paso === "correo"   && "Ingresa tu correo para recibir un código de recuperación"}
            {paso === "codigo"   && "Ingresa el código que enviamos a tu correo"}
            {paso === "password" && "Elige tu nueva contraseña"}
            {paso === "exito"    && "¡Contraseña actualizada!"}
          </p>
        </div>

        <div className="card space-y-5">

          {/* ── Paso 1: correo ── */}
          {paso === "correo" && (
            <>
              <div>
                <label className="label">Correo electrónico</label>
                <input
                  type="email"
                  value={correo}
                  onChange={e => setCorreo(e.target.value)}
                  onKeyDown={e => e.key === "Enter" && solicitarCodigo()}
                  placeholder="correo@ejemplo.com"
                  className="field"
                  autoFocus
                />
              </div>
              {error && <p className="error-box">{error}</p>}
              <button onClick={solicitarCodigo} disabled={loading || !correo}
                className="btn-primary w-full py-3">
                {loading ? <><span className="spinner" /> Enviando...</> : "Enviar código"}
              </button>
              <Link href="/login" className="btn-ghost w-full text-sm flex items-center justify-center gap-2">
                <ArrowLeft className="w-4 h-4" /> Volver al login
              </Link>
            </>
          )}

          {/* ── Paso 2: código ── */}
          {paso === "codigo" && (
            <>
              <div className="bg-slate-800/60 rounded-xl px-4 py-3">
                <p className="text-slate-500 text-xs">Enviamos el código a</p>
                <p className="text-slate-200 text-sm font-medium">{correo}</p>
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
              <button onClick={verificarCodigo} disabled={codigo.length !== 6}
                className="btn-primary w-full py-3">
                Verificar código
              </button>
              <button onClick={() => { setPaso("correo"); setCodigo(""); setError(null); }}
                className="btn-ghost w-full text-sm">
                <ArrowLeft className="w-4 h-4" /> Cambiar correo
              </button>
            </>
          )}

          {/* ── Paso 3: nueva contraseña ── */}
          {paso === "password" && (
            <>
              <div>
                <label className="label">Nueva contraseña</label>
                <div className="relative">
                  <input
                    type={show1 ? "text" : "password"}
                    value={pass1}
                    onChange={e => setPass1(e.target.value)}
                    placeholder="Mínimo 8 caracteres"
                    className="field pr-10"
                    autoFocus
                  />
                  <button type="button" onClick={() => setShow1(!show1)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300">
                    {show1 ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>
              <div>
                <label className="label">Confirmar contraseña</label>
                <div className="relative">
                  <input
                    type={show2 ? "text" : "password"}
                    value={pass2}
                    onChange={e => setPass2(e.target.value)}
                    placeholder="Repite la contraseña"
                    className={cn("field pr-10", pass2 && pass1 !== pass2 && "field-err")}
                  />
                  <button type="button" onClick={() => setShow2(!show2)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300">
                    {show2 ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                {pass2 && pass1 !== pass2 && <p className="hint">Las contraseñas no coinciden</p>}
              </div>

              {pass1.length > 0 && (
                <div className="space-y-2">
                  <div className="flex gap-1">
                    {[
                      pass1.length >= 8,
                      /[A-Z]/.test(pass1) && /[a-z]/.test(pass1),
                      /[0-9]/.test(pass1),
                    ].map((ok, i) => (
                      <div key={i} className={cn(
                        "h-1 flex-1 rounded-full transition-colors",
                        ok ? (
                          i === 0 ? "bg-amber-500" :
                          i === 1 ? "bg-blue-500" : "bg-emerald-500"
                        ) : "bg-slate-700"
                      )} />
                    ))}
                  </div>
                  <div className="space-y-1">
                    {[
                      { ok: pass1.length >= 8,          txt: "Mínimo 8 caracteres" },
                      { ok: /[A-Z]/.test(pass1) && /[a-z]/.test(pass1), txt: "Mayúscula y minúscula" },
                      { ok: /[0-9]/.test(pass1),        txt: "Al menos un número" },
                    ].map(({ ok: cumple, txt }) => (
                      <p key={txt} className={cn("text-xs flex items-center gap-1.5",
                        cumple ? "text-emerald-400" : "text-slate-500")}>
                        <span>{cumple ? "✓" : "○"}</span> {txt}
                      </p>
                    ))}
                  </div>
                </div>
              )}
              {error && <p className="error-box">{error}</p>}
              <button
                onClick={cambiarPassword}
                disabled={
                  loading ||
                  pass1.length < 8 ||
                  pass1 !== pass2 ||
                  !/[A-Z]/.test(pass1) ||
                  !/[a-z]/.test(pass1) ||
                  !/[0-9]/.test(pass1)
                }
                className="btn-primary w-full py-3">
                {loading ? <><span className="spinner" /> Actualizando...</> : "Cambiar contraseña"}
              </button>
            </>
          )}

          {/* ── Paso 4: éxito ── */}
          {paso === "exito" && (
            <>
              <div className="text-center py-4">
                <div className="w-16 h-16 bg-emerald-500/20 border border-emerald-500/30 rounded-2xl
                                flex items-center justify-center mx-auto mb-4">
                  <span className="text-emerald-400 text-3xl">✓</span>
                </div>
                <p className="text-white font-semibold mb-1">¡Listo!</p>
                <p className="text-slate-500 text-sm">
                  Tu contraseña fue actualizada correctamente.
                </p>
              </div>
              <Link href="/login" className="btn-primary w-full py-3 flex items-center justify-center gap-2">
                Ir al login
              </Link>
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
