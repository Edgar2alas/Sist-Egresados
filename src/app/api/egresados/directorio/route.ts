// src/app/api/egresados/directorio/route.ts
import { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { egresado } from "@/lib/schema";
import { eq } from "drizzle-orm";
import { getSession } from "@/lib/auth";
import { ok, err } from "@/lib/utils";

export async function POST(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session || session.rol !== "egresado" || !session.idEgresado)
      return err("No autorizado", 403);

    const { mostrar } = await req.json();
    if (typeof mostrar !== "boolean") return err("Valor inválido");

    await db.update(egresado)
      .set({ mostrarEnDirectorio: mostrar })
      .where(eq(egresado.id, session.idEgresado));

    return ok({ mostrarEnDirectorio: mostrar });
  } catch (e) { console.error(e); return err("Error", 500); }
}
