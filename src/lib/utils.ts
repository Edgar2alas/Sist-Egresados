import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { format, parseISO } from "date-fns";
import { es } from "date-fns/locale";

export const cn = (...i: ClassValue[]) => twMerge(clsx(i));

export const fmtDate = (d: string | null | undefined) => {
  if (!d) return "—";
  try { return format(parseISO(d), "dd/MM/yyyy"); } catch { return d; }
};

export const fmtDateLong = (d: string | null | undefined) => {
  if (!d) return "—";
  try { return format(parseISO(d), "dd 'de' MMMM 'de' yyyy", { locale: es }); }
  catch { return d; }
};

/** Formatea año + semestre como "2024/1". Ej: fmtGestion(2024, 1) → "2024/1" */
export const fmtGestion = (anio: number | null | undefined, semestre: number | null | undefined): string => {
  if (!anio) return "—";
  if (!semestre) return String(anio);
  return `${anio}/${semestre}`;
};

export const ok  = <T>(data: T, status = 200) =>
  Response.json({ data }, { status });

export const err = (message: string, status = 400) =>
  Response.json({ error: message }, { status });

/** Genera contraseña inicial: CI + iniciales en mayúscula
 *  Ej: ci="12345678", nombres="Ana", apellidos="Mamani" → "12345678AM"
 */
export function generarPasswordInicial(
  ci: string,
  nombres: string,
  apellidoPaterno?: string | null,
  apellidoMaterno?: string | null,
  apellidos?: string | null,
): string {
  // Primera letra del primer nombre
  const inicialNombre = nombres.trim()[0]?.toUpperCase() ?? "";
  // Primera letra del apellido paterno, o primer apellido si no hay paterno
  const primerApellido = apellidoPaterno?.trim() || apellidos?.trim() || "";
  const inicialApellido = primerApellido[0]?.toUpperCase() ?? "";
  return `${ci}${inicialNombre}${inicialApellido}`;
}