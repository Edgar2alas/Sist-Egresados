// src/app/(egresado)/editar-perfil/page.tsx
import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { db } from "@/lib/db";
import { egresado } from "@/lib/schema";
import { eq } from "drizzle-orm";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import EgresadoForm from "@/components/egresados/EgresadoForm";

export default async function EditarPerfilPage() {
  const session = await getSession();
  if (!session || session.rol !== "egresado") redirect("/login");
  if (!session.idEgresado) redirect("/registro-inicial");

  const [eg] = await db.select().from(egresado)
    .where(eq(egresado.id, session.idEgresado)).limit(1);
  if (!eg) redirect("/registro-inicial");

  return (
    <div className="max-w-2xl mx-auto px-4 py-8 space-y-6 animate-fade-up">
      <Link href="/mi-perfil" className="btn-ghost btn-sm inline-flex">
        <ArrowLeft className="w-4 h-4" /> Volver a Mi Perfil
      </Link>
      <div>
        <h1 className="page-title">Editar mis datos</h1>
        <p className="page-sub">{eg.apellidoPaterno ?? eg.apellidos}, {eg.nombres}</p>
      </div>
      <div className="card">
        <EgresadoForm egresado={eg} redirectTo="/mi-perfil" />
      </div>
    </div>
  );
}
