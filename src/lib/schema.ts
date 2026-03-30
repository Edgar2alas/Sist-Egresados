/**
 * Schema Drizzle — espejo exacto de las tablas PostgreSQL del proyecto.
 *
 * Tablas:
 *   plan_estudios   → planEstudios
 *   egresado        → egresado
 *   historial_laboral → historialLaboral
 *   usuario         → usuario
 */
import {
  pgTable, serial, varchar, text, integer, date,
  timestamp, boolean, pgEnum, index, uniqueIndex,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";

// ── Enums ─────────────────────────────────────────────────────────────────────
export const planEstadoEnum  = pgEnum("plan_estado",  ["Activo", "Inactivo", "En revisión"]);
export const usuarioRolEnum  = pgEnum("usuario_rol",  ["admin", "egresado"]);
export const usuarioEstEnum  = pgEnum("usuario_est",  ["activo", "inactivo", "bloqueado"]);

// ── plan_estudios ─────────────────────────────────────────────────────────────
export const planEstudios = pgTable("plan_estudios", {
  id:              serial("id").primaryKey(),
  nombre:          varchar("nombre",          { length: 150 }).notNull(),
  anioAprobacion:  integer("anio_aprobacion").notNull(),
  descripcion:     text("descripcion"),
  estado:          planEstadoEnum("estado").notNull().default("Activo"),
  creadoEn:        timestamp("creado_en").notNull().defaultNow(),
});

// ── egresado ──────────────────────────────────────────────────────────────────
export const egresado = pgTable("egresado", {
  id:               serial("id").primaryKey(),
  nombres:          varchar("nombres",    { length: 100 }).notNull(),
  apellidos:        varchar("apellidos",  { length: 100 }).notNull(),
  ci:               varchar("ci",         { length: 20  }).notNull().unique(),
  telefono:         varchar("telefono",   { length: 20  }),
  direccion:        varchar("direccion",  { length: 200 }),
  fechaNacimiento:  date("fecha_nacimiento").notNull(),
  fechaGraduacion:  date("fecha_graduacion").notNull(),
  fechaRegistro:    timestamp("fecha_registro").notNull().defaultNow(),
  idPlan:           integer("id_plan").notNull().references(() => planEstudios.id),
}, (t) => ({
  ciIdx: uniqueIndex("egresado_ci_idx").on(t.ci),
}));

// ── historial_laboral ─────────────────────────────────────────────────────────
export const historialLaboral = pgTable("historial_laboral", {
  id:          serial("id").primaryKey(),
  idEgresado:  integer("id_egresado").notNull()
    .references(() => egresado.id, { onDelete: "cascade" }),
  empresa:     varchar("empresa",  { length: 150 }).notNull(),
  cargo:       varchar("cargo",    { length: 100 }).notNull(),
  area:        varchar("area",     { length: 100 }),
  fechaInicio: date("fecha_inicio").notNull(),
  fechaFin:    date("fecha_fin"),          // NULL = trabaja actualmente
  creadoEn:    timestamp("creado_en").notNull().defaultNow(),
});

// ── usuario ───────────────────────────────────────────────────────────────────
export const usuario = pgTable("usuario", {
  id:           serial("id").primaryKey(),
  correo:       varchar("correo",       { length: 150 }).notNull().unique(),
  passwordHash: varchar("password_hash",{ length: 255 }).notNull(),
  rol:          usuarioRolEnum("rol").notNull().default("egresado"),
  estado:       usuarioEstEnum("estado").notNull().default("activo"),
  idEgresado:   integer("id_egresado")
    .references(() => egresado.id, { onDelete: "set null" }),
  creadoEn:     timestamp("creado_en").notNull().defaultNow(),
});

// ── Relations ─────────────────────────────────────────────────────────────────
export const planRelations = relations(planEstudios, ({ many }) => ({
  egresados: many(egresado),
}));

export const egresadoRelations = relations(egresado, ({ one, many }) => ({
  plan:      one(planEstudios, { fields: [egresado.idPlan], references: [planEstudios.id] }),
  historial: many(historialLaboral),
  usuario:   many(usuario),
}));

export const historialRelations = relations(historialLaboral, ({ one }) => ({
  egresado: one(egresado, { fields: [historialLaboral.idEgresado], references: [egresado.id] }),
}));

export const usuarioRelations = relations(usuario, ({ one }) => ({
  egresado: one(egresado, { fields: [usuario.idEgresado], references: [egresado.id] }),
}));

// ── Tipos inferidos ───────────────────────────────────────────────────────────
export type PlanEstudios     = typeof planEstudios.$inferSelect;
export type NuevoPlan        = typeof planEstudios.$inferInsert;
export type Egresado         = typeof egresado.$inferSelect;
export type NuevoEgresado    = typeof egresado.$inferInsert;
export type HistorialLaboral = typeof historialLaboral.$inferSelect;
export type NuevoHistorial   = typeof historialLaboral.$inferInsert;
export type Usuario          = typeof usuario.$inferSelect;
export type NuevoUsuario     = typeof usuario.$inferInsert;
