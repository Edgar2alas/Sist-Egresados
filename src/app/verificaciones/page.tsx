// src/app/verificaciones/page.tsx
import { getSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { historialLaboral, egresado } from "@/lib/schema";
import { eq } from "drizzle-orm";
import AdminLayout from "@/components/shared/AdminLayout";
import VerificacionesClient from "@/components/verificaciones/VerificacionesClient";
import { sql } from "drizzle-orm";

export default async function VerificacionesPage() {
  const session = await getSession();
  if (!session || session.rol !== "admin") redirect("/login");

  const pendientes = await db.select({
    id:               historialLaboral.id,
    empresa:          historialLaboral.empresa,
    cargo:            historialLaboral.cargo,
    area:             historialLaboral.area,
    ciudad:           historialLaboral.ciudad,
    sector:           historialLaboral.sector,
    fechaInicio:      historialLaboral.fechaInicio,
    fechaFin:         historialLaboral.fechaFin,
    documentoNombre:  historialLaboral.documentoNombre,
    documentoTipo:    historialLaboral.documentoTipo,
    documentoSubidoEn:historialLaboral.documentoSubidoEn,
    verificacionEstado:historialLaboral.verificacionEstado,
    // Datos del egresado
    egresadoId:       egresado.id,
    nombres:          egresado.nombres,
    apellidos:        egresado.apellidos,
    apellidoPaterno:  egresado.apellidoPaterno,
    ci:               egresado.ci,
  })
  .from(historialLaboral)
  .innerJoin(egresado, eq(historialLaboral.idEgresado, egresado.id))
  .where(eq(historialLaboral.verificacionEstado, "pendiente"))
  .orderBy(historialLaboral.documentoSubidoEn);

  const [{ totalPendientes }] = await db
    .select({ totalPendientes: sql<number>`count(*)::int` })
    .from(historialLaboral)
    .where(eq(historialLaboral.verificacionEstado, "pendiente"));

  return (
    <AdminLayout correo={session.correo}>
      <div className="page">
        <div>
          <h1 className="page-title">Verificaciones</h1>
          <p className="page-sub">
            {totalPendientes} experiencia(s) laboral(es) pendiente(s) de verificación
          </p>
        </div>
        <VerificacionesClient pendientes={pendientes} />
      </div>
    </AdminLayout>
  );
}
