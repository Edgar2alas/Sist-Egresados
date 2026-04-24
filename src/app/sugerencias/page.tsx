import { getSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { sugerencias, egresado } from "@/lib/schema";
import { eq, desc } from "drizzle-orm";
import AdminLayout from "@/components/shared/AdminLayout";
import SugerenciasClient from "@/components/sugerencias/SugerenciasClient";

export default async function SugerenciasPage() {
  const session = await getSession();
  if (!session || session.rol !== "admin") redirect("/login");

  const rows = await db.select({
    id:         sugerencias.id,
    tipo:       sugerencias.tipo,
    mensaje:    sugerencias.mensaje,
    esAnonima:  sugerencias.esAnonima,
    leida:      sugerencias.leida,
    creadoEn:   sugerencias.creadoEn,
    nombres:    egresado.nombres,
    apellidos:  egresado.apellidos,
    apellidoPaterno: egresado.apellidoPaterno,
  })
  .from(sugerencias)
  .leftJoin(egresado, eq(sugerencias.idEgresado, egresado.id))
  .orderBy(desc(sugerencias.creadoEn));

  const noLeidas = rows.filter(r => !r.leida).length;

  return (
    <AdminLayout correo={session.correo}>
      <div className="page">
        <div>
          <h1 className="page-title">Sugerencias</h1>
          <p className="page-sub">
            {noLeidas > 0
              ? `${noLeidas} sugerencia(s) sin leer de ${rows.length} en total`
              : `${rows.length} sugerencia(s) — todas leídas`}
          </p>
        </div>
        <SugerenciasClient sugerencias={rows} />
      </div>
    </AdminLayout>
  );
}