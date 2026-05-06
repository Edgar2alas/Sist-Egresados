import { relations } from "drizzle-orm";
import {
  pgTable, serial, varchar, text, integer, smallint,
  date, timestamp, boolean, numeric, pgEnum,
  uniqueIndex, index, customType,
} from "drizzle-orm/pg-core";

const bytea = customType<{ data: Buffer; driverData: Buffer }>({
  dataType() { return "bytea"; },
});

// ── Enums ─────────────────────────────────────────────────────────────────────
export const usuarioRolEnum      = pgEnum("usuario_rol",           ["admin", "egresado"]);
export const usuarioEstEnum      = pgEnum("usuario_est",           ["activo", "inactivo", "bloqueado"]);
export const generoEnum          = pgEnum("genero_enum",           ["Masculino", "Femenino", "Otro", "Prefiero no decir"]);
export const sectorEnum          = pgEnum("sector_enum",           ["Publico", "Privado", "Independiente", "ONG", "Otro"]);
export const contratoEnum        = pgEnum("contrato_enum",         ["Indefinido", "Fijo", "Por obra", "Consultor", "Pasante", "Otro"]);
export const postgradoTipoEnum   = pgEnum("postgrado_tipo_enum",   ["Diplomado", "Especialidad", "Maestria", "Doctorado", "Postdoctorado", "Otro"]);
export const postgradoEstadoEnum = pgEnum("postgrado_estado_enum", ["En curso", "Finalizado", "Abandonado"]);
export const tokenTipoEnum = pgEnum("token_tipo_enum", [
  "primer_login", "reset_password", "verificar_correo", "verificar_celular",
]);
export const modalidadEnum = pgEnum("modalidad_titulacion_enum", [
  "Tesis", "Proyecto de grado", "Trabajo dirigido", "Excelencia",
]);
export const personaTipoEnum = pgEnum("persona_tipo_enum", ["Titulado", "Egresado"]);

export const PLANES_ESTUDIO = ["1994", "2008", "2020"] as const;
export type PlanEstudiosNombre = typeof PLANES_ESTUDIO[number];

export const MODALIDADES_TITULACION = [
  "Tesis", "Proyecto de grado", "Trabajo dirigido", "Excelencia",
] as const;

// ── egresado ──────────────────────────────────────────────────────────────────
export const egresado = pgTable("egresado", {
  id:              serial("id").primaryKey(),
  nombres:         varchar("nombres",          { length: 100 }).notNull(),
  apellidos:       varchar("apellidos",        { length: 100 }).notNull(),
  apellidoPaterno: varchar("apellido_paterno", { length: 100 }),
  apellidoMaterno: varchar("apellido_materno", { length: 100 }),
  ci:              varchar("ci",               { length: 20  }).notNull().unique(),
  nacionalidad:    varchar("nacionalidad",     { length: 80  }),
  genero:          generoEnum("genero"),
  correoElectronico: varchar("correo_electronico", { length: 150 }),
  telefono:        varchar("telefono",         { length: 20  }),
  celular:         varchar("celular",          { length: 20  }),
  direccion:       varchar("direccion",        { length: 200 }),
  tituloAcademico: varchar("titulo_academico", { length: 150 }),
  fechaNacimiento: date("fecha_nacimiento").notNull(),
  planEstudiosNombre: varchar("plan_estudios_nombre", { length: 50 }),
  idPlan:             integer("id_plan"),
  anioIngreso:    integer("anio_ingreso"),
  anioEgreso:     integer("anio_egreso"),
  anioTitulacion: integer("anio_titulacion"),
  semestreIngreso: smallint("semestre_ingreso"),
  semestreEgreso:  smallint("semestre_egreso"),
  promedio: numeric("promedio", { precision: 4, scale: 2 }),
  modalidadTitulacion: modalidadEnum("modalidad_titulacion"),
  fechaTitulacion: date("fecha_titulacion"),
  fechaGraduacion: date("fecha_graduacion").notNull(),
  mostrarEnDirectorio: boolean("mostrar_en_directorio").notNull().default(false),
  fechaRegistro:       timestamp("fecha_registro").notNull().defaultNow(),
  ultimaActualizacion: timestamp("ultima_actualizacion").defaultNow(),
  tipo:                 personaTipoEnum("tipo").notNull().default("Titulado"),
  inicioProceso:        boolean("inicio_proceso"),
  motivoNoTitulacion:   text("motivo_no_titulacion"),
  planeaTitularse:      boolean("planea_titularse"),
  facebook:             varchar("facebook",             { length: 200 }),
  linkedin:             varchar("linkedin",             { length: 200 }),
  areaEspecializacion:  varchar("area_especializacion", { length: 150 }),
  observaciones:        text("observaciones"),
  estadoLaboral:        varchar("estado_laboral",       { length: 30 }),
  ciudadResidencia:     varchar("ciudad_residencia",    { length: 100 }),
  regionResidencia:     varchar("region_residencia",    { length: 100 }),
  fallecido:            boolean("fallecido").notNull().default(false),
}, (t) => ({
  ciIdx:         uniqueIndex("egresado_ci_idx").on(t.ci),
  anioEgresoIdx: index("idx_egresado_anio_egreso").on(t.anioEgreso),
  generoIdx:     index("idx_egresado_genero").on(t.genero),
  planNombreIdx: index("idx_egresado_plan_nombre").on(t.planEstudiosNombre),
  tipoIdx:       index("idx_egresado_tipo").on(t.tipo),
  fallecidoIdx:  index("idx_egresado_fallecido").on(t.fallecido),
}));

// ── historial_laboral ────────────────────────────────────────────────────────
export const historialLaboral = pgTable("historial_laboral", {
  id:          serial("id").primaryKey(),
  idEgresado:  integer("id_egresado").notNull()
    .references(() => egresado.id, { onDelete: "cascade" }),
  empresa:     varchar("empresa",  { length: 150 }).notNull(),
  cargo:       varchar("cargo",    { length: 100 }).notNull(),
  area:        varchar("area",     { length: 100 }),
  fechaInicio: date("fecha_inicio").notNull(),
  fechaFin:    date("fecha_fin"),
  tipoContrato:      contratoEnum("tipo_contrato"),
  ciudad:            varchar("ciudad",          { length: 100 }),
  sector:            sectorEnum("sector"),
  ultimaActualizacion: timestamp("ultima_actualizacion").defaultNow(),
  creadoEn:            timestamp("creado_en").notNull().defaultNow(),
}, (t) => ({
  sectorIdx: index("idx_historial_sector").on(t.sector),
  ciudadIdx: index("idx_historial_ciudad").on(t.ciudad),
}));

// ── postgrado ─────────────────────────────────────────────────────────────────
export const postgrado = pgTable("postgrado", {
  id:          serial("id").primaryKey(),
  idEgresado:  integer("id_egresado").notNull()
    .references(() => egresado.id, { onDelete: "cascade" }),
  tipo:        postgradoTipoEnum("tipo").notNull(),
  institucion: varchar("institucion", { length: 200 }).notNull(),
  pais:        varchar("pais",        { length: 100 }).notNull().default("Bolivia"),
  anioInicio:  integer("anio_inicio").notNull(),
  anioFin:     integer("anio_fin"),
  estado:      postgradoEstadoEnum("estado").notNull().default("En curso"),
  ultimaActualizacion: timestamp("ultima_actualizacion").defaultNow(),
  creadoEn:            timestamp("creado_en").notNull().defaultNow(),
});

// ── usuario ───────────────────────────────────────────────────────────────────
export const usuario = pgTable("usuario", {
  id:                serial("id").primaryKey(),
  ci:                varchar("ci",            { length: 20  }),
  correo:            varchar("correo",        { length: 150 }).notNull().unique(),
  passwordHash:      varchar("password_hash", { length: 255 }).notNull(),
  rol:               usuarioRolEnum("rol").notNull().default("egresado"),
  estado:            usuarioEstEnum("estado").notNull().default("activo"),
  idEgresado:        integer("id_egresado")
    .references(() => egresado.id, { onDelete: "set null" }),
  primerLogin:       boolean("primer_login").notNull().default(true),
  celular:           varchar("celular",       { length: 20  }),
  correoVerificado:  boolean("correo_verificado").notNull().default(false),
  celularVerificado: boolean("celular_verificado").notNull().default(false),
  creadoEn:          timestamp("creado_en").notNull().defaultNow(),
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
  historial:  many(historialLaboral),
  postgrados: many(postgrado),
  usuarios:   many(usuario),
}));
export const historialRelations = relations(historialLaboral, ({ one }) => ({
  egresado: one(egresado, { fields: [historialLaboral.idEgresado], references: [egresado.id] }),
}));
export const postgradoRelations = relations(postgrado, ({ one }) => ({
  egresado: one(egresado, { fields: [postgrado.idEgresado], references: [egresado.id] }),
}));
export const usuarioRelations = relations(usuario, ({ one, many }) => ({
  egresado:           one(egresado, { fields: [usuario.idEgresado], references: [egresado.id] }),
  verificacionTokens: many(verificacionTokens),
}));
export const verificacionTokensRelations = relations(verificacionTokens, ({ one }) => ({
  usuario: one(usuario, { fields: [verificacionTokens.idUsuario], references: [usuario.id] }),
}));

// ── Tipos inferidos ───────────────────────────────────────────────────────────
export type Egresado          = typeof egresado.$inferSelect;
export type NuevoEgresado     = typeof egresado.$inferInsert;
export type HistorialLaboral  = typeof historialLaboral.$inferSelect;
export type NuevoHistorial    = typeof historialLaboral.$inferInsert;
export type Postgrado         = typeof postgrado.$inferSelect;
export type NuevoPostgrado    = typeof postgrado.$inferInsert;
export type Usuario           = typeof usuario.$inferSelect;
export type NuevoUsuario      = typeof usuario.$inferInsert;
export type VerificacionToken = typeof verificacionTokens.$inferSelect;
export type NuevoToken        = typeof verificacionTokens.$inferInsert;

// ── noticias ──────────────────────────────────────────────────────────────────
export const noticiasTipoEnum = pgEnum("noticias_tipo_enum", [
  "noticia_institucional",
  "curso_evento",
  "noticia_social",
]);

export const noticias = pgTable("noticias", {
  id:           serial("id").primaryKey(),
  titulo:       varchar("titulo",    { length: 200 }).notNull(),
  cuerpo:       text("cuerpo").notNull(),
  tipo:         noticiasTipoEnum("tipo").notNull().default("noticia_institucional"),
  fecha:        date("fecha").notNull(),
  imagenUrl:    varchar("imagen_url",  { length: 500 }),
  publicado:    boolean("publicado").notNull().default(false),
  creadoEn:     timestamp("creado_en").notNull().defaultNow(),
  actualizadoEn: timestamp("actualizado_en").defaultNow(),
}, (t) => ({
  tipoIdx:      index("idx_noticias_tipo").on(t.tipo),
  publicadoIdx: index("idx_noticias_publicado").on(t.publicado),
  fechaIdx:     index("idx_noticias_fecha").on(t.fecha),
}));

export type Noticia      = typeof noticias.$inferSelect;
export type NuevaNoticia = typeof noticias.$inferInsert;

export const fmtGestion = (anio: number | null | undefined, semestre: number | null | undefined): string => {
  if (!anio) return "—";
  if (!semestre) return String(anio);
  return `${anio}/${semestre}`;
};