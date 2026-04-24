"use client";
import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { GraduationCap, ShieldCheck, RefreshCw, Eye, EyeOff } from "lucide-react";
import { cn } from "@/lib/utils";

type Paso = "codigo" | "password";

export default function ActivarCuentaPage() {
  const router      = useRouter();
  const searchParams = useSearchParams();
  const correoParam = searchParams.get("correo") ?? "";

  const [paso,   setPaso]   = useState<Paso>("codigo");
  const [correo, setCorreo] = useState(correoParam);
  const [codigo, setCodigo] = useState("");
  const [pass1,  setPass1]  = useState("");
  const [pass2,  setPass2]  = useState("");
  const [show1,  setShow1]  = useState(false);
  const [show2,  setShow2]  = useState(false);
  const [error,  setError]  = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [reenvioOk, setReenvioOk] = useState(false);

  // ── Paso 1: validar código ────────────────────────────────────────────────
  const verificarCodigo = async () => {
    if (codigo.length !== 6) { setError("El código debe tener 6 dígitos."); return; }
    // Solo pasamos al paso 2, la validación real ocurre al cambiar contraseña
    setError(null);
    setPaso("password");
  };

  // ── Reenviar código ───────────────────────────────────────────────────────
  const reenviarCodigo = async () => {
    setLoading(true);
    setError(null);
    try {
      await fetch("/api/auth/solicitar-codigo", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ correo, tipo: "primer_login" }),
      });
      setReenvioOk(true);
      setTimeout(() => setReenvioOk(false), 5000);
    } catch { setError("No se pudo reenviar el código."); }
    finally { setLoading(false); }
  };

  // ── Paso 2: cambiar contraseña ────────────────────────────────────────────
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
          tipo:              "primer_login",
        }),
      });
      const json = await res.json();
      if (!res.ok) { setError(json.error); return; }
      router.push(json.data?.redirigir ?? "/mi-perfil");
      router.refresh();
    } catch { setError("Error al cambiar la contraseña."); }
    finally { setLoading(false); }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4">
      <div className="w-full max-w-md animate-fade-up">

        {/* Encabezado */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl
                          bg-primary-600/20 border border-primary-500/30 mb-4">
            <ShieldCheck className="w-8 h-8 text-primary-400" />
          </div>
          <h1 className="text-2xl font-bold text-white mb-1">Activa tu cuenta</h1>
          <p className="text-slate-500 text-sm">
            {paso === "codigo"
              ? "Ingresa el código de 6 dígitos que enviamos a tu correo"
              : "Elige una contraseña segura para tu cuenta"}
          </p>
        </div>

        <div className="card space-y-5">

          {/* Correo (solo lectura si vino como param) */}
          {!correoParam && (
            <div>
              <label className="label">Correo electrónico</label>
              <input
                type="email"
                value={correo}
                onChange={e => setCorreo(e.target.value)}
                placeholder="correo@ejemplo.com"
                className="field"
              />
            </div>
          )}
          {correoParam && (
            <div className="bg-slate-800/60 rounded-xl px-4 py-3">
              <p className="text-slate-500 text-xs">Enviamos el código a</p>
              <p className="text-slate-200 text-sm font-medium">{correo}</p>
            </div>
          )}

          {/* ── Paso 1: código ── */}
          {paso === "codigo" && (
            <>
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
                />
              </div>

              {error && <p className="error-box">{error}</p>}
              {reenvioOk && (
                <p className="bg-emerald-500/10 border border-emerald-500/25 rounded-xl
                               px-4 py-3 text-emerald-400 text-sm">
                  Código reenviado. Revisa tu correo.
                </p>
              )}

              <button
                onClick={verificarCodigo}
                disabled={loading || codigo.length !== 6}
                className="btn-primary w-full py-3"
              >
                Continuar
              </button>

              <button
                onClick={reenviarCodigo}
                disabled={loading}
                className="btn-ghost w-full text-sm"
              >
                <RefreshCw className={cn("w-4 h-4", loading && "animate-spin")} />
                Reenviar código
              </button>
            </>
          )}

          {/* ── Paso 2: nueva contraseña ── */}
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
                {pass2 && pass1 !== pass2 && (
                  <p className="hint">Las contraseñas no coinciden</p>
                )}
              </div>

              {/* Indicador de fortaleza simple */}
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
                className="btn-primary w-full py-3"
              >
                {loading
                  ? <><span className="spinner" /> Activando...</>
                  : "Activar cuenta"}
              </button>

              <button onClick={() => { setPaso("codigo"); setError(null); }}
                className="btn-ghost w-full text-sm">
                Volver a ingresar el código
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
