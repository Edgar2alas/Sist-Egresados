import { getSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { planEstudios } from "@/lib/schema";
import AdminLayout from "@/components/shared/AdminLayout";
import ReportesClient from "@/components/reportes/ReportesClient";

export default async function ReportesPage() {
  const session = await getSession();
  if (!session || session.rol !== "admin") redirect("/login");

  const planes = await db.select({ id: planEstudios.id, nombre: planEstudios.nombre })
    .from(planEstudios).orderBy(planEstudios.anioAprobacion);

  return (
    <AdminLayout correo={session.correo}>
      <div className="page">
        <div>
          <h1 className="page-title">Reportes</h1>
          <p className="page-sub">Filtra, visualiza y exporta información de egresados</p>
        </div>
        <ReportesClient planes={planes} />
      </div>
    </AdminLayout>
  );
}
