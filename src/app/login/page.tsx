"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { loginSchema, type LoginInput } from "@/lib/validations";
import { Eye, EyeOff, LogIn, GraduationCap } from "lucide-react";
import { cn } from "@/lib/utils";

export default function LoginPage() {
  const router = useRouter();
  const [show, setShow]   = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { register, handleSubmit, formState: { errors, isSubmitting } } =
    useForm<LoginInput>({ resolver: zodResolver(loginSchema) });

  const onSubmit = async (d: LoginInput) => {
    setError(null);
    const res  = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ correo: d.correo, password: d.password }),
    });
    const json = await res.json();
    if (!res.ok) { setError(json.error); return; }

    // Primer login: redirigir a activación de cuenta
    if (json.data?.primerLogin) {
      const params = new URLSearchParams({ correo: d.correo });
      router.push(`/activar-cuenta?${params}`);
      return;
    }

    // Login normal: redirigir según rol
    if (json.data.rol === "admin") router.push("/dashboard");
    else                           router.push("/mi-perfil");
    router.refresh();
  };

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4">
      <div className="w-full max-w-md animate-fade-up">

        {/* Logo + título */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl
                          bg-primary-600/20 border border-primary-500/30 mb-4">
            <GraduationCap className="w-8 h-8 text-primary-400" />
          </div>
          <h1 className="text-3xl font-bold text-white mb-1">Bienvenido</h1>
          <p className="text-slate-500 text-sm">
            Sistema de Egresados · Carrera de Estadística
          </p>
        </div>

        {/* Formulario */}
        <div className="card">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">

            {/* Correo */}
            <div>
              <label className="label">Correo electrónico</label>
              <input
                {...register("correo")}
                type="email"
                autoComplete="email"
                placeholder="correo@ejemplo.com"
                className={cn("field", errors.correo && "field-err")}
              />
              {errors.correo && <p className="hint">{errors.correo.message}</p>}
            </div>

            {/* Contraseña */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="label mb-0">Contraseña</label>
                <Link href="/recuperar-password"
                  className="text-xs text-primary-400 hover:text-primary-300 transition-colors">
                  ¿Olvidaste tu contraseña?
                </Link>
              </div>
              <div className="relative">
                <input
                  {...register("password")}
                  type={show ? "text" : "password"}
                  autoComplete="current-password"
                  placeholder="••••••••"
                  className={cn("field pr-10", errors.password && "field-err")}
                />
                <button type="button" onClick={() => setShow(!show)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300">
                  {show ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {errors.password && <p className="hint">{errors.password.message}</p>}
            </div>

            {error && <p className="error-box">{error}</p>}

            <button type="submit" disabled={isSubmitting} className="btn-primary w-full py-3">
              {isSubmitting
                ? <><span className="spinner" /> Ingresando...</>
                : <><LogIn className="w-4 h-4" /> Ingresar</>}
            </button>
          </form>
        </div>

        <p className="text-center mt-6 text-slate-700 text-xs">
          Universidad Mayor de San Andrés · FCPN
        </p>
      </div>
    </div>
  );
}
