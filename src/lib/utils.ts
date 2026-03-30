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

export const ok  = <T>(data: T, status = 200) =>
  Response.json({ data }, { status });

export const err = (message: string, status = 400) =>
  Response.json({ error: message }, { status });
