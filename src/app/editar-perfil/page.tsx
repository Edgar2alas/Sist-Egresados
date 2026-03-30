import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { db } from "@/lib/db";
import { egresado, planEstudios } from "@/lib/schema";
import { eq } from "drizzle-orm";
import Link from "next/link";
import { ArrowLeft, GraduationCap } from "lucide-react";
import EgresadoForm from "@/components/egresados/EgresadoForm";
import LogoutButton from "@/components/shared/LogoutButton";

export default async function EditarPerfilPage() {
  const session = await getSession();
  if (!session || session.rol !== "egresado") redirect("/login");
  if (!session.idEgresado) redirect("/registro-inicial");

  const [egresados, planes] = await Promise.all([
    db.select().from(egresado).where(eq(egresado.id, session.idEgresado)).limit(1),
    db.select({ id: planEstudios.id, nombre: planEstudios.nombre })
      .from(planEstudios).orderBy(planEstudios.anioAprobacion),
  ]);

  const eg = egresados[0];
  if (!eg) redirect("/registro-inicial");

  return (
    <div className="min-h-screen bg-slate-950">
      <header className="h-14 bg-slate-900/80 border-b border-slate-800 flex items-center justify-between px-6">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-primary-600/20 border border-primary-500/30 rounded-xl
                          flex items-center justify-center">
            <GraduationCap className="w-4 h-4 text-primary-400" />
          </div>
          <span className="text-white font-semibold text-sm">Editar Perfil</span>
        </div>
        <LogoutButton />
      </header>

      <main className="max-w-2xl mx-auto p-6 lg:p-8 space-y-6 animate-fade-up">
        <Link href="/mi-perfil" className="btn-ghost btn-sm inline-flex">
          <ArrowLeft className="w-4 h-4" /> Volver a Mi Perfil
        </Link>

        <div>
          <h1 className="page-title">Editar mis datos</h1>
          <p className="page-sub">{eg.apellidos}, {eg.nombres}</p>
        </div>

        <div className="card">
          <EgresadoForm
            egresado={eg}
            planes={planes}
            redirectTo="/mi-perfil"
          />
        </div>
      </main>
    </div>
  );
}
