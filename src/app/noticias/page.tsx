import { db } from "@/lib/db";
import { noticias } from "@/lib/schema";
import { eq, desc, and, sql } from "drizzle-orm";
import PublicLayout from "@/components/shared/PublicLayout";
import NoticiasClient from "@/components/noticias/NoticiasClient";

export default async function NoticiasPage({
  searchParams,
}: {
  searchParams: { tipo?: string };
}) {
  const tipo = searchParams.tipo;

  const conds: any[] = [eq(noticias.publicado, true)];
  if (tipo) conds.push(sql`${noticias.tipo}::text = ${tipo}`);

  const rows = await db.select().from(noticias)
    .where(and(...conds))
    .orderBy(desc(noticias.fecha));

  return (
    <PublicLayout>
      <NoticiasClient noticias={rows} tipoFiltro={tipo} />
    </PublicLayout>
  );
}