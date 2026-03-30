import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { db } from "@/lib/db";
import { planEstudios } from "@/lib/schema";
import { eq } from "drizzle-orm";
import { GraduationCap } from "lucide-react";
import RegistroInicialForm from "@/components/perfil/RegistroInicialForm";

export default async function RegistroInicialPage() {
  const session = await getSession();
  if (!session || session.rol !== "egresado") redirect("/login");

  // Si ya tiene egresado → ir al perfil
  if (session.idEgresado) redirect("/mi-perfil");

  const planes = await db.select({ id: planEstudios.id, nombre: planEstudios.nombre })
    .from(planEstudios).where(eq(planEstudios.estado, "Activo")).orderBy(planEstudios.anioAprobacion);

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4">
      <div className="w-full max-w-xl animate-fade-up">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl
                          bg-primary-600/20 border border-primary-500/30 mb-4">
            <GraduationCap className="w-8 h-8 text-primary-400" />
          </div>
          <h1 className="text-2xl font-bold text-white mb-2">Completa tu perfil</h1>
          <p className="text-slate-500 text-sm">
            Para continuar, necesitas registrar tus datos de egresado.
          </p>
        </div>

        <div className="card">
          <RegistroInicialForm planes={planes} />
        </div>
      </div>
    </div>
  );
}
