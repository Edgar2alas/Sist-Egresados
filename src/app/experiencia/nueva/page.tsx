import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import Link from "next/link";
import { ArrowLeft, GraduationCap } from "lucide-react";
import HistorialForm from "@/components/perfil/HistorialForm";

export default async function NuevaExperienciaPage() {
  const session = await getSession();
  if (!session || session.rol !== "egresado") redirect("/login");
  if (!session.idEgresado) redirect("/registro-inicial");

  return (
    <div className="min-h-screen bg-slate-950">
      <header className="h-14 bg-slate-900/80 border-b border-slate-800 flex items-center px-6 gap-3">
        <div className="w-8 h-8 bg-primary-600/20 border border-primary-500/30 rounded-xl
                        flex items-center justify-center">
          <GraduationCap className="w-4 h-4 text-primary-400" />
        </div>
        <span className="text-white font-semibold text-sm">Agregar Experiencia</span>
      </header>

      <main className="max-w-2xl mx-auto p-6 lg:p-8 space-y-6 animate-fade-up">
        <Link href="/mi-perfil" className="btn-ghost btn-sm inline-flex">
          <ArrowLeft className="w-4 h-4" /> Volver a Mi Perfil
        </Link>

        <div>
          <h1 className="page-title">Nueva Experiencia Laboral</h1>
          <p className="page-sub">Registra tu experiencia en el historial laboral</p>
        </div>

        <div className="card">
          <HistorialForm idEgresado={session.idEgresado} />
        </div>
      </main>
    </div>
  );
}
