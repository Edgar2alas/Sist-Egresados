import { getSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import AdminLayout from "@/components/shared/AdminLayout";
import DashboardClient from "@/components/dashboard/DashboardClient";

export default async function DashboardPage() {
  const session = await getSession();
  if (!session || session.rol !== "admin") redirect("/login");

  return (
    <AdminLayout correo={session.correo}>
      <div className="page">
        <div>
          <h1 className="page-title">Dashboard</h1>
          <p className="page-sub">
            Estadísticas y seguimiento de egresados — Carrera de Estadística UMSA
          </p>
        </div>
        <DashboardClient />
      </div>
    </AdminLayout>
  );
}