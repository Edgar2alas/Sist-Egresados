import { db } from "@/lib/db";
import { verificacionTokens, usuario, egresado } from "@/lib/schema";
import { eq, and, gt } from "drizzle-orm";

// Genera un código numérico de 6 dígitos
export function generarCodigo(): string {
  return String(Math.floor(100000 + Math.random() * 900000));
}

// Crea un nuevo token en BD (invalida los anteriores del mismo tipo)
export async function crearToken(opts: {
  idUsuario: number;
  tipo: "primer_login" | "reset_password";
  minutos?: number; // default: 30 para primer_login, 15 para reset
}): Promise<string> {
  const minutos = opts.minutos ?? (opts.tipo === "primer_login" ? 30 : 15);
  const expiraEn = new Date(Date.now() + minutos * 60 * 1000);
  const codigo = generarCodigo();

  // Marcar como usados los tokens anteriores del mismo tipo para este usuario
  await db
    .update(verificacionTokens)
    .set({ usado: true })
    .where(
      and(
        eq(verificacionTokens.idUsuario, opts.idUsuario),
        eq(verificacionTokens.tipo, opts.tipo),
        eq(verificacionTokens.usado, false)
      )
    );

  await db.insert(verificacionTokens).values({
    idUsuario: opts.idUsuario,
    token: codigo,
    tipo: opts.tipo,
    expiraEn,
    usado: false,
  });

  return codigo;
}

// Valida un token: retorna true si es correcto, vigente y no usado
export async function validarToken(opts: {
  idUsuario: number;
  codigo: string;
  tipo: "primer_login" | "reset_password";
}): Promise<{ valido: boolean; error?: string }> {
  const ahora = new Date();

  const [token] = await db
    .select()
    .from(verificacionTokens)
    .where(
      and(
        eq(verificacionTokens.idUsuario, opts.idUsuario),
        eq(verificacionTokens.token, opts.codigo),
        eq(verificacionTokens.tipo, opts.tipo),
        eq(verificacionTokens.usado, false),
        gt(verificacionTokens.expiraEn, ahora)
      )
    )
    .limit(1);

  if (!token) {
    // Distinguir entre código incorrecto y expirado
    const [expirado] = await db
      .select()
      .from(verificacionTokens)
      .where(
        and(
          eq(verificacionTokens.idUsuario, opts.idUsuario),
          eq(verificacionTokens.token, opts.codigo),
          eq(verificacionTokens.tipo, opts.tipo)
        )
      )
      .limit(1);

    if (expirado && expirado.expiraEn < ahora) {
      return { valido: false, error: "El código ha expirado. Solicita uno nuevo." };
    }
    return { valido: false, error: "Código incorrecto. Verifica e intenta de nuevo." };
  }

  return { valido: true };
}

// Marca el token como usado (llamar DESPUÉS de validar y procesar)
export async function consumirToken(opts: {
  idUsuario: number;
  codigo: string;
  tipo: "primer_login" | "reset_password";
}): Promise<void> {
  await db
    .update(verificacionTokens)
    .set({ usado: true })
    .where(
      and(
        eq(verificacionTokens.idUsuario, opts.idUsuario),
        eq(verificacionTokens.token, opts.codigo),
        eq(verificacionTokens.tipo, opts.tipo)
      )
    );
}

// Obtiene datos del usuario + egresado para enviar el correo
export async function getDatosUsuarioParaEmail(idUsuario: number) {
  const [row] = await db
    .select({
      id:      usuario.id,
      correo:  usuario.correo,
      nombres: egresado.nombres,
    })
    .from(usuario)
    .leftJoin(egresado, eq(usuario.idEgresado, egresado.id))
    .where(eq(usuario.id, idUsuario))
    .limit(1);

  return row ?? null;
}
