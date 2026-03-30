import { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { usuario } from "@/lib/schema";
import { eq } from "drizzle-orm";
import { getSession, signToken, setSession } from "@/lib/auth";
import { ok, err } from "@/lib/utils";

export async function POST(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session || session.rol !== "egresado") return err("No autorizado", 403);

    const { idEgresado } = await req.json();
    if (!idEgresado || typeof idEgresado !== "number") return err("idEgresado requerido");

    // Actualizar el usuario en BD
    await db.update(usuario)
      .set({ idEgresado })
      .where(eq(usuario.id, session.idUsuario));

    // Re-firmar token con el nuevo idEgresado
    const newToken = await signToken({
      idUsuario:  session.idUsuario,
      correo:     session.correo,
      rol:        "egresado",
      idEgresado,
    });
    setSession(newToken);

    return ok({ idEgresado });
  } catch (e) {
    console.error(e);
    return err("Error al vincular egresado", 500);
  }
}
