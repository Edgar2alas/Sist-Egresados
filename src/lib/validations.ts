import { z } from "zod";
import { PLANES_ESTUDIO, MODALIDADES_TITULACION } from "@/lib/schema";

// ── Auth ──────────────────────────────────────────────────────────────────────
export const loginSchema = z.object({
  correo:   z.string().email("Correo inválido"),
  password: z.string().min(1, "Contraseña requerida"),
});

// ── Egresado ──────────────────────────────────────────────────────────────────
export const egresadoSchema = z.object({
  // Datos personales RF-02
  nombres:           z.string().min(2, "Requerido").max(100),
  apellidos:         z.string().min(2, "Requerido").max(100),   // legacy, se calcula desde pat+mat
  apellidoPaterno:   z.string().max(100).optional().nullable(),
  apellidoMaterno:   z.string().max(100).optional().nullable(),
  ci:                z.string().min(4, "CI inválido").max(20),
  nacionalidad:      z.string().max(80).optional().nullable(),
  genero:            z.enum(["Masculino", "Femenino", "Otro", "Prefiero no decir"]).optional().nullable(),
  correoElectronico: z.string().email("Correo inválido").max(150).optional().nullable(),
  celular:           z.string().max(20).optional().nullable(),
  direccion:         z.string().max(200).optional().nullable(),
  tituloAcademico:   z.string().max(150).optional().nullable(),
  fechaNacimiento:   z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Fecha inválida"),

  // Plan de estudios — texto libre con lista sugerida
  planEstudiosNombre: z.string().max(50).optional().nullable(),

  // Datos académicos RF-03
  anioIngreso:     z.number().int().min(1998).max(new Date().getFullYear()).optional().nullable(),
  semestreIngreso: z.number().int().min(1).max(2).optional().nullable(),
  anioEgreso:      z.number().int().min(1998).max(new Date().getFullYear() + 1).optional().nullable(),
  semestreEgreso:  z.number().int().min(1).max(2).optional().nullable(),

  // Titulación
  fechaTitulacion:     z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Fecha inválida").optional().nullable(),
  anioTitulacion:      z.number().int().min(1998).max(new Date().getFullYear() + 1).optional().nullable(),
  modalidadTitulacion: z.enum([
    "Tesis",
    "Proyecto de grado",
    "Trabajo dirigido",
    "Excelencia",
  ]).optional().nullable(),
}).refine(
  d => {
    if (!d.fechaTitulacion) return true;
    return new Date(d.fechaTitulacion) > new Date(d.fechaNacimiento);
  },
  { message: "La fecha de titulación debe ser posterior a la de nacimiento", path: ["fechaTitulacion"] }
).refine(
  d => {
    if (!d.anioEgreso || !d.anioIngreso) return true;
    return d.anioEgreso >= d.anioIngreso;
  },
  { message: "El año de egreso no puede ser anterior al de ingreso", path: ["anioEgreso"] }
);

// ── Historial laboral ─────────────────────────────────────────────────────────
export const historialSchema = z.object({
  idEgresado:         z.number().int().positive(),
  empresa:            z.string().min(2, "Requerido").max(150),
  cargo:              z.string().min(2, "Requerido").max(100),
  area:               z.string().max(100).optional().nullable(),
  tipoContrato:       z.enum(["Indefinido", "Fijo", "Por obra", "Consultor", "Pasante", "Otro"]).optional().nullable(),
  ciudad:             z.string().max(100).optional().nullable(),
  sector:             z.enum(["Publico", "Privado", "Independiente", "ONG", "Otro"]).optional().nullable(),
  ingresoAproximado:  z.number().positive().optional().nullable(),
  fechaInicio:        z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Fecha inválida"),
  fechaFin:           z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Fecha inválida").optional().nullable(),
  actualmenteTrabaja: z.boolean().default(false),
}).refine(
  d => {
    if (d.actualmenteTrabaja || !d.fechaFin) return true;
    return new Date(d.fechaFin) > new Date(d.fechaInicio);
  },
  { message: "La fecha fin debe ser posterior a la de inicio", path: ["fechaFin"] }
);

// ── Postgrado ─────────────────────────────────────────────────────────────────
export const postgradoSchema = z.object({
  idEgresado:  z.number().int().positive(),
  tipo:        z.enum(["Diplomado", "Especialidad", "Maestria", "Doctorado", "Postdoctorado", "Otro"]),
  institucion: z.string().min(2, "Requerido").max(200),
  pais:        z.string().min(2, "Requerido").max(100).default("Bolivia"),
  anioInicio:  z.number().int().min(1990).max(new Date().getFullYear() + 1),
  anioFin:     z.number().int().min(1990).max(new Date().getFullYear() + 5).optional().nullable(),
  estado:      z.enum(["En curso", "Finalizado", "Abandonado"]).default("En curso"),
}).refine(
  d => {
    if (!d.anioFin) return true;
    return d.anioFin >= d.anioInicio;
  },
  { message: "El año de finalización no puede ser anterior al de inicio", path: ["anioFin"] }
);

// ── Sugerencias ───────────────────────────────────────────────────────────────
export const sugerenciaSchema = z.object({
  tipo:       z.enum([
    "Sugerencia general",
    "Sugerencia para el sistema",
    "Especializacion recomendada",
  ]).default("Sugerencia general"),
  mensaje:   z.string().min(10, "El mensaje debe tener al menos 10 caracteres").max(2000),
  esAnonima: z.boolean().default(false),
});

// ── Usuario ───────────────────────────────────────────────────────────────────
export const usuarioSchema = z.object({
  correo:            z.string().email("Correo inválido").max(150),
  password:          z.string().min(8, "Mínimo 8 caracteres"),
  confirmarPassword: z.string(),
  rol:               z.enum(["admin", "egresado"]),
  estado:            z.enum(["activo", "inactivo", "bloqueado"]),
  idEgresado:        z.number().int().positive().optional().nullable(),
}).refine(d => d.password === d.confirmarPassword, {
  message: "Las contraseñas no coinciden", path: ["confirmarPassword"],
});

export const usuarioEditSchema = z.object({
  rol:           z.enum(["admin", "egresado"]),
  estado:        z.enum(["activo", "inactivo", "bloqueado"]),
  idEgresado:    z.number().int().positive().optional().nullable(),
  nuevaPassword: z.string().min(8).optional().or(z.literal("")),
});

// ── Importación Excel (para subida masiva) ────────────────────────────────────
// Esquema de cada fila del Excel de Google Forms
export const excelRowSchema = z.object({
  nombres:             z.string().min(1),
  apellidoPaterno:     z.string().optional(),
  apellidoMaterno:     z.string().optional(),
  ci:                  z.string().min(4),
  correoElectronico:   z.string().email().optional(),
  celular:             z.string().optional(),
  fechaNacimiento:     z.string().optional(),
  planEstudiosNombre:  z.string().optional(),
  anioIngreso:         z.number().optional(),
  semestreIngreso:     z.number().optional(),
  anioEgreso:          z.number().optional(),
  semestreEgreso:      z.number().optional(),
  fechaTitulacion:     z.string().optional(),
  anioTitulacion:      z.number().optional(),
  modalidadTitulacion: z.enum(["Tesis", "Proyecto de grado", "Trabajo dirigido", "Excelencia"]).optional(),
  genero:              z.enum(["Masculino", "Femenino", "Otro", "Prefiero no decir"]).optional(),
  nacionalidad:        z.string().optional(),
});

// ── Tipos exportados ──────────────────────────────────────────────────────────
export type LoginInput       = z.infer<typeof loginSchema>;
export type EgresadoInput    = z.infer<typeof egresadoSchema>;
export type HistorialInput   = z.infer<typeof historialSchema>;
export type PostgradoInput   = z.infer<typeof postgradoSchema>;
export type SugerenciaInput  = z.infer<typeof sugerenciaSchema>;
export type UsuarioInput     = z.infer<typeof usuarioSchema>;
export type UsuarioEditInput = z.infer<typeof usuarioEditSchema>;
export type ExcelRowInput    = z.infer<typeof excelRowSchema>;
