import { z } from "zod";

export const loginSchema = z.object({
  correo:   z.string().email("Correo inválido"),
  password: z.string().min(1, "Contraseña requerida"),
});

export const planSchema = z.object({
  nombre:         z.string().min(3, "Mínimo 3 caracteres").max(150),
  anioAprobacion: z.number().int().min(1900).max(new Date().getFullYear() + 5),
  descripcion:    z.string().max(2000).nullable().optional(),
  estado:         z.enum(["Activo", "Inactivo", "En revisión"]),
});

export const egresadoSchema = z.object({
  nombres:         z.string().min(2, "Requerido").max(100),
  apellidos:       z.string().min(2, "Requerido").max(100),
  ci:              z.string().min(4, "CI inválido").max(20),
  telefono:        z.string().max(20).nullable().optional(),
  direccion:       z.string().max(200).nullable().optional(),
  fechaNacimiento: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Fecha inválida"),
  fechaGraduacion: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Fecha inválida"),
  idPlan:          z.number().int().positive("Selecciona un plan"),
}).refine(
  d => new Date(d.fechaGraduacion) > new Date(d.fechaNacimiento),
  { message: "La fecha de graduación debe ser posterior a la de nacimiento", path: ["fechaGraduacion"] }
);

export const historialSchema = z.object({
  idEgresado:       z.number().int().positive(),
  empresa:          z.string().min(2, "Requerido").max(150),
  cargo:            z.string().min(2, "Requerido").max(100),
  area:             z.string().max(100).nullable().optional(),
  fechaInicio:      z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Fecha inválida"),
  fechaFin:         z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Fecha inválida").nullable().optional(),
  actualmenteTrabaja: z.boolean().default(false),
}).refine(
  d => {
    if (d.actualmenteTrabaja || !d.fechaFin) return true;
    return new Date(d.fechaFin) > new Date(d.fechaInicio);
  },
  { message: "La fecha fin debe ser posterior a la de inicio", path: ["fechaFin"] }
);

export const usuarioSchema = z.object({
  correo:            z.string().email("Correo inválido").max(150),
  password:          z.string().min(8, "Mínimo 8 caracteres"),
  confirmarPassword: z.string(),
  rol:               z.enum(["admin", "egresado"]),
  estado:            z.enum(["activo", "inactivo", "bloqueado"]),
  idEgresado:        z.number().int().positive().nullable().optional(),
}).refine(d => d.password === d.confirmarPassword, {
  message: "Las contraseñas no coinciden", path: ["confirmarPassword"],
});

export const usuarioEditSchema = z.object({
  rol:            z.enum(["admin", "egresado"]),
  estado:         z.enum(["activo", "inactivo", "bloqueado"]),
  idEgresado:     z.number().int().positive().nullable().optional(),
  nuevaPassword:  z.string().min(8).optional().or(z.literal("")),
});

export type LoginInput    = z.infer<typeof loginSchema>;
export type PlanInput     = z.infer<typeof planSchema>;
export type EgresadoInput = z.infer<typeof egresadoSchema>;
export type HistorialInput = z.infer<typeof historialSchema>;
export type UsuarioInput  = z.infer<typeof usuarioSchema>;
export type UsuarioEditInput = z.infer<typeof usuarioEditSchema>;
