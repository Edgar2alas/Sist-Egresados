import { getSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { historialLaboral, egresado, postgrado } from "@/lib/schema";
import { eq, sql } from "drizzle-orm";
import AdminLayout from "@/components/shared/AdminLayout";
import VerificacionesClient from "@/components/verificaciones/VerificacionesClient";
import VerificacionesPostgradoClient from "@/components/verificaciones/VerificacionesPostgradoClient";

export default async function VerificacionesPage() {
  const session = await getSession();
  if (!session || session.rol !== "admin") redirect("/login");

  const [pendientesLaboral, pendientesPostgrado] = await Promise.all([
    db.select({
      id:                historialLaboral.id,
      empresa:           historialLaboral.empresa,
      cargo:             historialLaboral.cargo,
      area:              historialLaboral.area,
      ciudad:            historialLaboral.ciudad,
      sector:            historialLaboral.sector,
      fechaInicio:       historialLaboral.fechaInicio,
      fechaFin:          historialLaboral.fechaFin,
      documentoNombre:   historialLaboral.documentoNombre,
      documentoTipo:     historialLaboral.documentoTipo,
      documentoSubidoEn: historialLaboral.documentoSubidoEn,
      verificacionEstado:historialLaboral.verificacionEstado,
      egresadoId:        egresado.id,
      nombres:           egresado.nombres,
      apellidos:         egresado.apellidos,
      apellidoPaterno:   egresado.apellidoPaterno,
      ci:                egresado.ci,
    })
    .from(historialLaboral)
    .innerJoin(egresado, eq(historialLaboral.idEgresado, egresado.id))
    .where(eq(historialLaboral.verificacionEstado, "pendiente"))
    .orderBy(historialLaboral.documentoSubidoEn),

    db.select({
      id:                postgrado.id,
      tipo:              postgrado.tipo,
      institucion:       postgrado.institucion,
      pais:              postgrado.pais,
      anioInicio:        postgrado.anioInicio,
      anioFin:           postgrado.anioFin,
      estado:            postgrado.estado,
      verificacionEstado:postgrado.verificacionEstado,
      documentoNombre:   postgrado.documentoNombre,
      documentoTipo:     postgrado.documentoTipo,
      documentoSubidoEn: postgrado.documentoSubidoEn,
      esSolicitudCambio: postgrado.esSolicitudCambio,
      datosPropuestos:   postgrado.datosPropuestos,
      egresadoId:        egresado.id,
      nombres:           egresado.nombres,
      apellidos:         egresado.apellidos,
      apellidoPaterno:   egresado.apellidoPaterno,
      ci:                egresado.ci,
    })
    .from(postgrado)
    .innerJoin(egresado, eq(postgrado.idEgresado, egresado.id))
    .where(eq(postgrado.verificacionEstado, "pendiente"))
    .orderBy(postgrado.documentoSubidoEn),
  ]);

  const totalPendientes = pendientesLaboral.length + pendientesPostgrado.length;

  return (
    <AdminLayout correo={session.correo}>
      <div className="page">
        <div>
          <h1 className="page-title">Verificaciones</h1>
          <p className="page-sub">{totalPendientes} verificación(es) pendiente(s) en total</p>
        </div>

        {/* Experiencia laboral */}
        <div>
          <h2 className="text-base font-bold mb-3" style={{ color: "var(--azul-pizarra)", fontFamily: "'Source Serif 4', serif" }}>
            Experiencia Laboral
            <span className="ml-2 text-xs font-normal px-2 py-0.5 rounded-full"
              style={{ background: "var(--humo)", color: "var(--gris-grafito)", border: "1px solid var(--borde)" }}>
              {pendientesLaboral.length} pendiente(s)
            </span>
          </h2>
          <VerificacionesClient pendientes={pendientesLaboral} />
        </div>

        {/* Postgrados */}
        <div>
          <h2 className="text-base font-bold mb-3" style={{ color: "var(--azul-pizarra)", fontFamily: "'Source Serif 4', serif" }}>
            Estudios de Postgrado
            <span className="ml-2 text-xs font-normal px-2 py-0.5 rounded-full"
              style={{ background: "var(--humo)", color: "var(--gris-grafito)", border: "1px solid var(--borde)" }}>
              {pendientesPostgrado.length} pendiente(s)
            </span>
          </h2>
          <VerificacionesPostgradoClient pendientes={pendientesPostgrado} />
        </div>
      </div>
    </AdminLayout>
  );
}