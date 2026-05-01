"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { ShieldCheck, RefreshCw, Eye, EyeOff, Mail, Phone, Check } from "lucide-react";
import { cn } from "@/lib/utils";

type Paso = "contacto" | "verificar" | "password" | "opcionTelefono";

export default function ActivarCuentaPage() {
  const router = useRouter();

  // Viene del login con idUsuario en lugar de correo
  const [idUsuario, setIdUsuario] = useState<number | null>(null);

  const [paso,    setPaso]    = useState<Paso>("contacto");
  const [correo,  setCorreo]  = useState("");
  const [celular, setCelular] = useState("");
  const [metodo,  setMetodo]  = useState<"correo" | "celular">("correo");
  const [correoVerificado,  setCorreoVerificado]  = useState(false);
  const [celularVerificado, setCelularVerificado] = useState(false);

  const [codigo,  setCodigo]  = useState("");
  const [pass1,   setPass1]   = useState("");
  const [pass2,   setPass2]   = useState("");
  const [show1,   setShow1]   = useState(false);
  const [show2,   setShow2]   = useState(false);
  const [error,   setError]   = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // Leer idUsuario de sessionStorage (lo guarda el login)
  useState(() => {
    const stored = sessionStorage.getItem("activacion_idUsuario");
    if (stored) setIdUsuario(parseInt(stored));
  });

  // ── Paso 1: enviar contacto ───────────────────────────────────────────────
  const enviarContacto = async () => {
    setError(null);
    if (!correo && !celular) {
      setError("Ingresa al menos un correo o celular"); return;
    }
    if (correo && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(correo)) {
      setError("Correo inválido"); return;
    }
    if (!idUsuario) { setError("Sesión inválida. Vuelve a iniciar sesión."); return; }

    setLoading(true);
    try {
      const res  = await fetch("/api/auth/agregar-contacto", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          idUsuario,
          correo:  correo || undefined,
          celular: celular || undefined,
        }),
      });
      const json = await res.json();
      if (!res.ok) { setError(json.error); return; }

      // El método principal es correo si existe, sino celular
      const m = correo ? "correo" : "celular";
      setMetodo(m);
      setPaso("verificar");
    } catch { setError("Error al enviar. Intenta de nuevo."); }
    finally { setLoading(false); }
  };

  // ── Paso 2: verificar código ──────────────────────────────────────────────
  const verificarCodigo = async () => {
    setError(null);
    if (codigo.length !== 6) { setError("El código debe tener 6 dígitos"); return; }
    if (!idUsuario) { setError("Sesión inválida"); return; }

    setLoading(true);
    try {
      const res  = await fetch("/api/auth/verificar-contacto", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ idUsuario, codigo, metodo }),
      });
      const json = await res.json();
      if (!res.ok) { setError(json.error); return; }

      if (metodo === "correo") setCorreoVerificado(true);
      if (metodo === "celular") setCelularVerificado(true);

      // Si verificó correo y también tiene celular ingresado, ofrecer verificar celular
      if (metodo === "correo" && celular && !celularVerificado) {
        setPaso("opcionTelefono");
      } else {
        // Pasar directo a cambiar contraseña
        setPaso("password");
      }
      setCodigo("");
    } catch { setError("Error al verificar."); }
    finally { setLoading(false); }
  };

  // ── Verificar teléfono (opcional) ─────────────────────────────────────────
  const verificarTelefono = async () => {
    if (!idUsuario) return;
    setLoading(true);
    setError(null);
    try {
      // Pedir código para celular
      const res = await fetch("/api/auth/agregar-contacto", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ idUsuario, celular }),
      });
      const json = await res.json();
      if (!res.ok) { setError(json.error); return; }
      setMetodo("celular");
      setPaso("verificar");
    } catch { setError("Error"); }
    finally { setLoading(false); }
  };

  // ── Paso 3: cambiar contraseña ────────────────────────────────────────────
  const activarCuenta = async () => {
    setError(null);
    if (pass1.length < 8) { setError("Mínimo 8 caracteres"); return; }
    if (pass1 !== pass2)  { setError("Las contraseñas no coinciden"); return; }
    if (!idUsuario) { setError("Sesión inválida"); return; }

    setLoading(true);
    try {
      const res  = await fetch("/api/auth/activar-cuenta", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ idUsuario, nuevaPassword: pass1, confirmarPassword: pass2 }),
      });
      const json = await res.json();
      if (!res.ok) { setError(json.error); return; }
      sessionStorage.removeItem("activacion_idUsuario");
      router.push(json.data?.redirigir ?? "/mi-perfil");
      router.refresh();
    } catch { setError("Error al activar la cuenta."); }
    finally { setLoading(false); }
  };

  const reenviarCodigo = async () => {
    if (!idUsuario) return;
    setLoading(true);
    try {
      await fetch("/api/auth/agregar-contacto", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          idUsuario,
          correo:  metodo === "correo"  ? correo  : undefined,
          celular: metodo === "celular" ? celular : undefined,
        }),
      });
    } finally { setLoading(false); }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4">
      <div className="w-full max-w-md animate-fade-up">

        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl
                          bg-primary-600/20 border border-primary-500/30 mb-4">
            <ShieldCheck className="w-8 h-8 text-primary-400" />
          </div>
          <h1 className="text-2xl font-bold text-white mb-1">Activa tu cuenta</h1>
          <p className="text-slate-500 text-sm">
            {paso === "contacto"       && "Agrega al menos un método de contacto para continuar"}
            {paso === "verificar"      && `Ingresa el código enviado a tu ${metodo}`}
            {paso === "opcionTelefono" && "¿Quieres también verificar tu celular?"}
            {paso === "password"       && "Elige una contraseña segura"}
          </p>
        </div>

        <div className="card space-y-5">

          {/* ── Indicador de pasos ── */}
          <div className="flex items-center gap-2">
            {[
              { label: "Contacto",     activo: paso === "contacto" },
              { label: "Verificación", activo: paso === "verificar" || paso === "opcionTelefono" },
              { label: "Contraseña",   activo: paso === "password" },
            ].map((s, i) => (
              <div key={i} className="flex items-center gap-2 flex-1">
                <div className={cn(
                  "w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold shrink-0",
                  s.activo
                    ? "bg-primary-500 text-white"
                    : (
                        (i === 0 && paso !== "contacto") ||
                        (i === 1 && paso === "password")
                      )
                      ? "bg-emerald-500 text-white"
                      : "bg-slate-700 text-slate-500"
                )}>
                  {(
                    (i === 0 && paso !== "contacto") ||
                    (i === 1 && paso === "password")
                  ) ? <Check className="w-3 h-3" /> : i + 1}
                </div>
                <span className="text-xs text-slate-500 hidden sm:block">{s.label}</span>
                {i < 2 && <div className="flex-1 h-px bg-slate-700" />}
              </div>
            ))}
          </div>

          {/* ── PASO 1: Contacto ── */}
          {paso === "contacto" && (
            <>
              <div>
                <label className="label flex items-center gap-2">
                  <Mail className="w-3.5 h-3.5" /> Correo electrónico
                </label>
                <input
                  type="email"
                  value={correo}
                  onChange={e => setCorreo(e.target.value)}
                  placeholder="tu@correo.com"
                  className="field"
                  autoFocus
                />
              </div>

              <div className="flex items-center gap-3">
                <div className="flex-1 h-px bg-slate-700" />
                <span className="text-xs text-slate-500">y/o</span>
                <div className="flex-1 h-px bg-slate-700" />
              </div>

              <div>
                <label className="label flex items-center gap-2">
                  <Phone className="w-3.5 h-3.5" /> Celular
                </label>
                <input
                  type="tel"
                  value={celular}
                  onChange={e => setCelular(e.target.value)}
                  placeholder="7XXXXXXX"
                  className="field"
                />
              </div>

              <p className="text-xs text-slate-500 text-center">
                Necesitas al menos uno para poder recuperar tu cuenta en el futuro
              </p>

              {error && <p className="error-box">{error}</p>}

              <button
                onClick={enviarContacto}
                disabled={loading || (!correo && !celular)}
                className="btn-primary w-full py-3"
              >
                {loading ? <><span className="spinner" /> Enviando...</> : "Continuar"}
              </button>
            </>
          )}

          {/* ── PASO 2: Verificar código ── */}
          {paso === "verificar" && (
            <>
              <div className="bg-slate-800/60 rounded-xl px-4 py-3">
                <p className="text-slate-500 text-xs">Código enviado a</p>
                <p className="text-slate-200 text-sm font-medium">
                  {metodo === "correo" ? correo : celular}
                </p>
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
                onClick={reenviarCodigo}
                disabled={loading}
                className="btn-ghost w-full text-sm"
              >
                <RefreshCw className={cn("w-4 h-4", loading && "animate-spin")} />
                Reenviar código
              </button>
            </>
          )}

          {/* ── PASO 2b: Opción de verificar teléfono ── */}
          {paso === "opcionTelefono" && (
            <>
              <div className="rounded-xl p-4 text-center"
                style={{ background: "var(--verde-light)", border: "1px solid #86efac" }}>
                <Check className="w-8 h-8 mx-auto mb-2" style={{ color: "var(--verde)" }} />
                <p className="font-semibold text-sm" style={{ color: "var(--verde)" }}>
                  Correo verificado
                </p>
                <p className="text-xs mt-1 text-slate-500">{correo}</p>
              </div>

              {celular && (
                <div>
                  <p className="text-sm text-slate-300 text-center mb-4">
                    ¿También quieres verificar tu celular <strong>{celular}</strong>?
                  </p>
                  <button
                    onClick={verificarTelefono}
                    disabled={loading}
                    className="btn-slate w-full mb-2"
                  >
                    {loading ? <><span className="spinner-turq" /> Enviando...</> : "Sí, verificar celular"}
                  </button>
                </div>
              )}

              <button
                onClick={() => setPaso("password")}
                className="btn-primary w-full py-3"
              >
                Continuar sin verificar celular →
              </button>
            </>
          )}

          {/* ── PASO 3: Contraseña ── */}
          {paso === "password" && (
            <>
              {(correoVerificado || celularVerificado) && (
                <div className="flex gap-2 flex-wrap">
                  {correoVerificado && (
                    <span className="inline-flex items-center gap-1 text-xs px-2.5 py-1 rounded-full"
                      style={{ background: "var(--verde-light)", color: "var(--verde)", border: "1px solid #86efac" }}>
                      <Check className="w-3 h-3" /> Correo verificado
                    </span>
                  )}
                  {celularVerificado && (
                    <span className="inline-flex items-center gap-1 text-xs px-2.5 py-1 rounded-full"
                      style={{ background: "var(--verde-light)", color: "var(--verde)", border: "1px solid #86efac" }}>
                      <Check className="w-3 h-3" /> Celular verificado
                    </span>
                  )}
                </div>
              )}

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
                    {[pass1.length >= 8, /[A-Z]/.test(pass1) && /[a-z]/.test(pass1), /[0-9]/.test(pass1)].map((ok, i) => (
                      <div key={i} className={cn("h-1 flex-1 rounded-full transition-colors",
                        ok ? (i === 0 ? "bg-amber-500" : i === 1 ? "bg-blue-500" : "bg-emerald-500") : "bg-slate-700")} />
                    ))}
                  </div>
                  <div className="space-y-1">
                    {[
                      { ok: pass1.length >= 8,                           txt: "Mínimo 8 caracteres" },
                      { ok: /[A-Z]/.test(pass1) && /[a-z]/.test(pass1), txt: "Mayúscula y minúscula" },
                      { ok: /[0-9]/.test(pass1),                         txt: "Al menos un número" },
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
                onClick={activarCuenta}
                disabled={
                  loading || pass1.length < 8 || pass1 !== pass2 ||
                  !/[A-Z]/.test(pass1) || !/[a-z]/.test(pass1) || !/[0-9]/.test(pass1)
                }
                className="btn-primary w-full py-3"
              >
                {loading ? <><span className="spinner" /> Activando...</> : "Activar cuenta"}
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