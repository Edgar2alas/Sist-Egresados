/**
 * Schema Drizzle V3 — Sistema de Egresados
 *
 * Cambios respecto a V2:
 *   - Eliminadas: plan_estudios, historial_planes
 *   - egresado: +plan_estudios_nombre (varchar), +modalidad_titulacion (enum),
 *               +anio_titulacion (int), id_plan ahora nullable/legacy
 *   - Nueva tabla: sugerencias
 */
import {
  pgTable, serial, varchar, text, integer, smallint,
  date, timestamp, boolean, numeric, pgEnum,
  uniqueIndex, index,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";

// ── Enums ─────────────────────────────────────────────────────────────────────
export const usuarioRolEnum      = pgEnum("usuario_rol",           ["admin", "egresado"]);
export const usuarioEstEnum      = pgEnum("usuario_est",           ["activo", "inactivo", "bloqueado"]);
export const generoEnum          = pgEnum("genero_enum",           ["Masculino", "Femenino", "Otro", "Prefiero no decir"]);
export const sectorEnum          = pgEnum("sector_enum",           ["Publico", "Privado", "Independiente", "ONG", "Otro"]);
export const contratoEnum        = pgEnum("contrato_enum",         ["Indefinido", "Fijo", "Por obra", "Consultor", "Pasante", "Otro"]);
export const postgradoTipoEnum   = pgEnum("postgrado_tipo_enum",   ["Diplomado", "Especialidad", "Maestria", "Doctorado", "Postdoctorado", "Otro"]);
export const postgradoEstadoEnum = pgEnum("postgrado_estado_enum", ["En curso", "Finalizado", "Abandonado"]);
export const tokenTipoEnum       = pgEnum("token_tipo_enum",       ["primer_login", "reset_password"]);
export const modalidadEnum       = pgEnum("modalidad_titulacion_enum", [
  "Tesis",
  "Proyecto de grado",
  "Trabajo dirigido",
  "Excelencia",
]);
export const sugerenciaTipoEnum  = pgEnum("sugerencia_tipo_enum",  [
  "Sugerencia general",
  "Sugerencia para el sistema",
  "Especializacion recomendada",
]);

// Planes de estudio disponibles (constante en código, no tabla en BD)
export const PLANES_ESTUDIO = ["1994", "2008", "2020"] as const;
export type PlanEstudiosNombre = typeof PLANES_ESTUDIO[number];

// Modalidades de titulación disponibles
export const MODALIDADES_TITULACION = [
  "Tesis",
  "Proyecto de grado",
  "Trabajo dirigido",
  "Excelencia",
] as const;

// ── egresado ──────────────────────────────────────────────────────────────────
export const egresado = pgTable("egresado", {
  id:              serial("id").primaryKey(),

  // Datos personales RF-02
  nombres:         varchar("nombres",          { length: 100 }).notNull(),
  apellidos:       varchar("apellidos",        { length: 100 }).notNull(),  // legacy
  apellidoPaterno: varchar("apellido_paterno", { length: 100 }),
  apellidoMaterno: varchar("apellido_materno", { length: 100 }),
  ci:              varchar("ci",               { length: 20  }).notNull().unique(),
  nacionalidad:    varchar("nacionalidad",     { length: 80  }),
  genero:          generoEnum("genero"),
  correoElectronico: varchar("correo_electronico", { length: 150 }),
  telefono:        varchar("telefono",         { length: 20  }),            // legacy
  celular:         varchar("celular",          { length: 20  }),
  direccion:       varchar("direccion",        { length: 200 }),
  tituloAcademico: varchar("titulo_academico", { length: 150 }),
  fechaNacimiento: date("fecha_nacimiento").notNull(),

  // Plan de estudios — ahora texto simple (lista sugerida en el front)
  // Ej: "1994", "2008", "2020"
  planEstudiosNombre: varchar("plan_estudios_nombre", { length: 50 }),
  idPlan:             integer("id_plan"),  // legacy, nullable, ya sin FK

  // Datos académicos RF-03
  anioIngreso:     integer("anio_ingreso"),
  semestreIngreso: smallint("semestre_ingreso"),
  anioEgreso:      integer("anio_egreso"),
  semestreEgreso:  smallint("semestre_egreso"),

  // Titulación
  fechaTitulacion:     date("fecha_titulacion"),
  anioTitulacion:      integer("anio_titulacion"),    // campo rápido para filtros
  modalidadTitulacion: modalidadEnum("modalidad_titulacion"),
  fechaGraduacion:     date("fecha_graduacion").notNull(), // legacy

  // Auditoría RF-12
  fechaRegistro:       timestamp("fecha_registro").notNull().defaultNow(),
  ultimaActualizacion: timestamp("ultima_actualizacion").defaultNow(),
}, (t) => ({
  ciIdx:         uniqueIndex("egresado_ci_idx").on(t.ci),
  anioEgresoIdx: index("idx_egresado_anio_egreso").on(t.anioEgreso),
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
  fechaFin:    date("fecha_fin"),

  // Campos RF-06
  tipoContrato:      contratoEnum("tipo_contrato"),
  ciudad:            varchar("ciudad",          { length: 100 }),
  sector:            sectorEnum("sector"),
  ingresoAproximado: numeric("ingreso_aproximado", { precision: 10, scale: 2 }),

  ultimaActualizacion: timestamp("ultima_actualizacion").defaultNow(),
  creadoEn:            timestamp("creado_en").notNull().defaultNow(),
});

// ── postgrado (RF-08) ─────────────────────────────────────────────────────────
export const postgrado = pgTable("postgrado", {
  id:                  serial("id").primaryKey(),
  idEgresado:          integer("id_egresado").notNull()
    .references(() => egresado.id, { onDelete: "cascade" }),
  tipo:                postgradoTipoEnum("tipo").notNull(),
  institucion:         varchar("institucion", { length: 200 }).notNull(),
  pais:                varchar("pais",        { length: 100 }).notNull().default("Bolivia"),
  anioInicio:          integer("anio_inicio").notNull(),
  anioFin:             integer("anio_fin"),
  estado:              postgradoEstadoEnum("estado").notNull().default("En curso"),
  ultimaActualizacion: timestamp("ultima_actualizacion").defaultNow(),
  creadoEn:            timestamp("creado_en").notNull().defaultNow(),
});

// ── sugerencias ───────────────────────────────────────────────────────────────
export const sugerencias = pgTable("sugerencias", {
  id:          serial("id").primaryKey(),
  idEgresado:  integer("id_egresado")
    .references(() => egresado.id, { onDelete: "set null" }),
  tipo:        sugerenciaTipoEnum("tipo").notNull().default("Sugerencia general"),
  mensaje:     text("mensaje").notNull(),
  esAnonima:   boolean("es_anonima").notNull().default(false),
  leida:       boolean("leida").notNull().default(false),
  creadoEn:    timestamp("creado_en").notNull().defaultNow(),
});

// ── usuario ───────────────────────────────────────────────────────────────────
export const usuario = pgTable("usuario", {
  id:           serial("id").primaryKey(),
  correo:       varchar("correo",        { length: 150 }).notNull().unique(),
  passwordHash: varchar("password_hash", { length: 255 }).notNull(),
  rol:          usuarioRolEnum("rol").notNull().default("egresado"),
  estado:       usuarioEstEnum("estado").notNull().default("activo"),
  idEgresado:   integer("id_egresado")
    .references(() => egresado.id, { onDelete: "set null" }),
  primerLogin:  boolean("primer_login").notNull().default(true),
  creadoEn:     timestamp("creado_en").notNull().defaultNow(),
});

// ── verificacion_tokens ───────────────────────────────────────────────────────
export const verificacionTokens = pgTable("verificacion_tokens", {
  id:        serial("id").primaryKey(),
  idUsuario: integer("id_usuario").notNull()
    .references(() => usuario.id, { onDelete: "cascade" }),
  token:     varchar("token",    { length: 8 }).notNull(),
  tipo:      tokenTipoEnum("tipo").notNull(),
  expiraEn:  timestamp("expira_en").notNull(),
  usado:     boolean("usado").notNull().default(false),
  creadoEn:  timestamp("creado_en").notNull().defaultNow(),
});

// ── Relations ─────────────────────────────────────────────────────────────────
export const egresadoRelations = relations(egresado, ({ many }) => ({
  historial:   many(historialLaboral),
  postgrados:  many(postgrado),
  sugerencias: many(sugerencias),
  usuarios:    many(usuario),
}));

export const historialRelations = relations(historialLaboral, ({ one }) => ({
  egresado: one(egresado, { fields: [historialLaboral.idEgresado], references: [egresado.id] }),
}));

export const postgradoRelations = relations(postgrado, ({ one }) => ({
  egresado: one(egresado, { fields: [postgrado.idEgresado], references: [egresado.id] }),
}));

export const sugerenciasRelations = relations(sugerencias, ({ one }) => ({
  egresado: one(egresado, { fields: [sugerencias.idEgresado], references: [egresado.id] }),
}));

export const usuarioRelations = relations(usuario, ({ one, many }) => ({
  egresado:           one(egresado, { fields: [usuario.idEgresado], references: [egresado.id] }),
  verificacionTokens: many(verificacionTokens),
}));

export const verificacionTokensRelations = relations(verificacionTokens, ({ one }) => ({
  usuario: one(usuario, { fields: [verificacionTokens.idUsuario], references: [usuario.id] }),
}));

// ── Tipos inferidos ───────────────────────────────────────────────────────────
export type Egresado            = typeof egresado.$inferSelect;
export type NuevoEgresado       = typeof egresado.$inferInsert;
export type HistorialLaboral    = typeof historialLaboral.$inferSelect;
export type NuevoHistorial      = typeof historialLaboral.$inferInsert;
export type Postgrado           = typeof postgrado.$inferSelect;
export type NuevoPostgrado      = typeof postgrado.$inferInsert;
export type Sugerencia          = typeof sugerencias.$inferSelect;
export type NuevaSugerencia     = typeof sugerencias.$inferInsert;
export type Usuario             = typeof usuario.$inferSelect;
export type NuevoUsuario        = typeof usuario.$inferInsert;
export type VerificacionToken   = typeof verificacionTokens.$inferSelect;
export type NuevoToken          = typeof verificacionTokens.$inferInsert;

// ── Helpers ───────────────────────────────────────────────────────────────────
export const fmtGestion = (anio: number | null, semestre: number | null): string => {
  if (!anio) return "—";
  if (!semestre) return String(anio);
  return `${anio}-${semestre}`;
};
