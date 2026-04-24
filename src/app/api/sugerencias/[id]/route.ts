import { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { sugerencias } from "@/lib/schema";
import { eq } from "drizzle-orm";
import { getSession } from "@/lib/auth";
import { ok, err } from "@/lib/utils";

export async function PATCH(_: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await getSession();
    if (!session || session.rol !== "admin") return err("No autorizado", 403);

    const id = parseInt(params.id);
    if (isNaN(id)) return err("ID inválido");

    const [updated] = await db.update(sugerencias)
      .set({ leida: true })
      .where(eq(sugerencias.id, id))
      .returning();

    if (!updated) return err("No encontrado", 404);
    return ok(updated);
  } catch (e) { console.error(e); return err("Error", 500); }
}

export async function DELETE(_: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await getSession();
    if (!session || session.rol !== "admin") return err("No autorizado", 403);

    const id = parseInt(params.id);
    if (isNaN(id)) return err("ID inválido");

    await db.delete(sugerencias).where(eq(sugerencias.id, id));
    return ok({ message: "Eliminado" });
  } catch (e) { console.error(e); return err("Error", 500); }
}