// scripts/seed.ts — Seed completo con datos amplios para testing de filtros

import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import * as schema from "../src/lib/schema";
import bcrypt from "bcryptjs";
import * as dotenv from "dotenv";
import { eq } from "drizzle-orm";

dotenv.config({ path: ".env.local" });

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const db   = drizzle(pool, { schema });

async function main() {
  console.log("\n🌱 Limpiando BD y sembrando datos amplios...\n");

  await db.delete(schema.verificacionTokens);
  await db.delete(schema.sugerencias);
  await db.delete(schema.postgrado);
  await db.delete(schema.historialLaboral);
  await db.delete(schema.usuario);
  await db.delete(schema.egresado);
  console.log("🗑️  Tablas limpiadas\n");

  // ── EGRESADOS ─────────────────────────────────────────────────────────────
  const egresadosData = [
    // ── PLAN 2008 — TITULADOS ─────────────────────────────────────────────
    {
      tipo: "Titulado" as const,
      nombres: "Carlos Alberto", apellidos: "Mamani Quispe",
      apellidoPaterno: "Mamani", apellidoMaterno: "Quispe",
      ci: "10000001", celular: "71000001", correoElectronico: "carlos.mamani@gmail.com",
      direccion: "Av. Arce 123, La Paz", fechaNacimiento: "1990-03-15",
      fechaGraduacion: "2015-11-20", anioTitulacion: 2015,
      planEstudiosNombre: "2008", modalidadTitulacion: "Tesis" as const,
      anioIngreso: 2008, semestreIngreso: 1, anioEgreso: 2014, semestreEgreso: 2,
      tituloAcademico: "Lic. en Estadística",
      linkedin: "https://linkedin.com/in/carlos-mamani",
      areaEspecializacion: "Estadística oficial",
      ciudadResidencia: "La Paz", regionResidencia: "La Paz",
      inicioProceso: null, motivoNoTitulacion: null, planeaTitularse: null,
    },
    {
      tipo: "Titulado" as const,
      nombres: "María Elena", apellidos: "Flores Condori",
      apellidoPaterno: "Flores", apellidoMaterno: "Condori",
      ci: "10000002", celular: "71000002", correoElectronico: "maria.flores@gmail.com",
      direccion: "Calle Loayza 456, La Paz", fechaNacimiento: "1992-07-22",
      fechaGraduacion: "2017-06-10", anioTitulacion: 2017,
      planEstudiosNombre: "2008", modalidadTitulacion: "Proyecto de grado" as const,
      anioIngreso: 2010, semestreIngreso: 2, anioEgreso: 2016, semestreEgreso: 1,
      tituloAcademico: "Lic. en Estadística",
      areaEspecializacion: "Econometría",
      ciudadResidencia: "La Paz", regionResidencia: "La Paz",
      inicioProceso: null, motivoNoTitulacion: null, planeaTitularse: null,
    },
    {
      tipo: "Titulado" as const,
      nombres: "Roberto Andrés", apellidos: "Vargas Torrez",
      apellidoPaterno: "Vargas", apellidoMaterno: "Torrez",
      ci: "10000003", celular: "71000003", correoElectronico: "roberto.vargas@gmail.com",
      direccion: "Av. Montes 789, La Paz", fechaNacimiento: "1988-11-05",
      fechaGraduacion: "2013-04-18", anioTitulacion: 2013,
      planEstudiosNombre: "2008", modalidadTitulacion: "Trabajo dirigido" as const,
      anioIngreso: 2006, semestreIngreso: 1, anioEgreso: 2012, semestreEgreso: 2,
      tituloAcademico: "Lic. en Estadística",
      areaEspecializacion: "Consultoría estadística",
      ciudadResidencia: "La Paz", regionResidencia: "La Paz",
      inicioProceso: null, motivoNoTitulacion: null, planeaTitularse: null,
    },
    {
      tipo: "Titulado" as const,
      nombres: "Lucía Patricia", apellidos: "Choque Apaza",
      apellidoPaterno: "Choque", apellidoMaterno: "Apaza",
      ci: "10000004", celular: "71000004", correoElectronico: "lucia.choque@gmail.com",
      direccion: "Calle Murillo 321, El Alto", fechaNacimiento: "1995-02-28",
      fechaGraduacion: "2020-12-01", anioTitulacion: 2020,
      planEstudiosNombre: "2020", modalidadTitulacion: "Tesis" as const,
      anioIngreso: 2013, semestreIngreso: 1, anioEgreso: 2019, semestreEgreso: 1,
      tituloAcademico: "Lic. en Estadística",
      areaEspecializacion: "Epidemiología",
      ciudadResidencia: "El Alto", regionResidencia: "La Paz",
      inicioProceso: null, motivoNoTitulacion: null, planeaTitularse: null,
    },
    {
      tipo: "Titulado" as const,
      nombres: "Diego Fernando", apellidos: "Quispe Limachi",
      apellidoPaterno: "Quispe", apellidoMaterno: "Limachi",
      ci: "10000005", celular: "71000005", correoElectronico: "diego.quispe@gmail.com",
      direccion: "Av. Bush 654, La Paz", fechaNacimiento: "1993-09-14",
      fechaGraduacion: "2019-08-25", anioTitulacion: 2019,
      planEstudiosNombre: "2008", modalidadTitulacion: "Proyecto de grado" as const,
      anioIngreso: 2011, semestreIngreso: 2, anioEgreso: 2018, semestreEgreso: 2,
      tituloAcademico: "Lic. en Estadística",
      areaEspecializacion: "Riesgo crediticio",
      ciudadResidencia: "La Paz", regionResidencia: "La Paz",
      inicioProceso: null, motivoNoTitulacion: null, planeaTitularse: null,
    },
    // ── PLAN 2020 — TITULADOS recientes ───────────────────────────────────
    {
      tipo: "Titulado" as const,
      nombres: "Ana Sofía", apellidos: "Condori Mamani",
      apellidoPaterno: "Condori", apellidoMaterno: "Mamani",
      ci: "10000006", celular: "71000006", correoElectronico: "ana.condori@gmail.com",
      direccion: "Calle Potosí 100, La Paz", fechaNacimiento: "1998-04-12",
      fechaGraduacion: "2022-06-15", anioTitulacion: 2022,
      planEstudiosNombre: "2020", modalidadTitulacion: "Excelencia" as const,
      anioIngreso: 2016, semestreIngreso: 1, anioEgreso: 2021, semestreEgreso: 2,
      tituloAcademico: "Lic. en Estadística",
      areaEspecializacion: "Machine Learning",
      ciudadResidencia: "La Paz", regionResidencia: "La Paz",
      inicioProceso: null, motivoNoTitulacion: null, planeaTitularse: null,
    },
    {
      tipo: "Titulado" as const,
      nombres: "Jorge Luis", apellidos: "Ticona Mendoza",
      apellidoPaterno: "Ticona", apellidoMaterno: "Mendoza",
      ci: "10000007", celular: "71000007", correoElectronico: "jorge.ticona@gmail.com",
      direccion: "Zona Sur, La Paz", fechaNacimiento: "1997-08-20",
      fechaGraduacion: "2022-11-30", anioTitulacion: 2022,
      planEstudiosNombre: "2020", modalidadTitulacion: "Excelencia" as const,
      anioIngreso: 2016, semestreIngreso: 2, anioEgreso: 2021, semestreEgreso: 1,
      tituloAcademico: "Lic. en Estadística",
      areaEspecializacion: "Data Science",
      ciudadResidencia: "La Paz", regionResidencia: "La Paz",
      inicioProceso: null, motivoNoTitulacion: null, planeaTitularse: null,
    },
    {
      tipo: "Titulado" as const,
      nombres: "Valeria", apellidos: "Huanca Ramos",
      apellidoPaterno: "Huanca", apellidoMaterno: "Ramos",
      ci: "10000008", celular: "71000008", correoElectronico: "valeria.huanca@gmail.com",
      direccion: "Av. Periférica 200, El Alto", fechaNacimiento: "1996-01-15",
      fechaGraduacion: "2021-05-20", anioTitulacion: 2021,
      planEstudiosNombre: "2020", modalidadTitulacion: "Tesis" as const,
      anioIngreso: 2015, semestreIngreso: 1, anioEgreso: 2020, semestreEgreso: 2,
      tituloAcademico: "Lic. en Estadística",
      areaEspecializacion: "Estadística social",
      ciudadResidencia: "El Alto", regionResidencia: "La Paz",
      inicioProceso: null, motivoNoTitulacion: null, planeaTitularse: null,
    },
    {
      tipo: "Titulado" as const,
      nombres: "Rodrigo", apellidos: "Aliaga Poma",
      apellidoPaterno: "Aliaga", apellidoMaterno: "Poma",
      ci: "10000009", celular: "71000009", correoElectronico: "rodrigo.aliaga@gmail.com",
      direccion: "Cochabamba Centro", fechaNacimiento: "1994-06-30",
      fechaGraduacion: "2020-03-10", anioTitulacion: 2020,
      planEstudiosNombre: "2008", modalidadTitulacion: "Proyecto de grado" as const,
      anioIngreso: 2012, semestreIngreso: 1, anioEgreso: 2019, semestreEgreso: 1,
      tituloAcademico: "Lic. en Estadística",
      areaEspecializacion: "Bioestadística",
      ciudadResidencia: "Cochabamba", regionResidencia: "Cochabamba",
      inicioProceso: null, motivoNoTitulacion: null, planeaTitularse: null,
    },
    {
      tipo: "Titulado" as const,
      nombres: "Camila", apellidos: "Rojas Salinas",
      apellidoPaterno: "Rojas", apellidoMaterno: "Salinas",
      ci: "10000010", celular: "71000010", correoElectronico: "camila.rojas@gmail.com",
      direccion: "Santa Cruz Centro", fechaNacimiento: "1991-11-22",
      fechaGraduacion: "2018-09-15", anioTitulacion: 2018,
      planEstudiosNombre: "2008", modalidadTitulacion: "Tesis" as const,
      anioIngreso: 2010, semestreIngreso: 1, anioEgreso: 2017, semestreEgreso: 2,
      tituloAcademico: "Lic. en Estadística",
      areaEspecializacion: "Estadística empresarial",
      ciudadResidencia: "Santa Cruz", regionResidencia: "Santa Cruz",
      inicioProceso: null, motivoNoTitulacion: null, planeaTitularse: null,
    },
    {
      tipo: "Titulado" as const,
      nombres: "Pablo", apellidos: "Morales Cruz",
      apellidoPaterno: "Morales", apellidoMaterno: "Cruz",
      ci: "10000011", celular: "71000011", correoElectronico: "pablo.morales@gmail.com",
      direccion: "Av. 6 de Agosto, La Paz", fechaNacimiento: "1989-05-18",
      fechaGraduacion: "2016-12-05", anioTitulacion: 2016,
      planEstudiosNombre: "2008", modalidadTitulacion: "Trabajo dirigido" as const,
      anioIngreso: 2008, semestreIngreso: 2, anioEgreso: 2015, semestreEgreso: 1,
      tituloAcademico: "Lic. en Estadística",
      areaEspecializacion: "Finanzas cuantitativas",
      ciudadResidencia: "La Paz", regionResidencia: "La Paz",
      inicioProceso: null, motivoNoTitulacion: null, planeaTitularse: null,
    },
    {
      tipo: "Titulado" as const,
      nombres: "Fernanda", apellidos: "López Torrico",
      apellidoPaterno: "López", apellidoMaterno: "Torrico",
      ci: "10000012", celular: "71000012", correoElectronico: "fernanda.lopez@gmail.com",
      direccion: "Oruro Centro", fechaNacimiento: "1993-03-08",
      fechaGraduacion: "2021-10-20", anioTitulacion: 2021,
      planEstudiosNombre: "2020", modalidadTitulacion: "Proyecto de grado" as const,
      anioIngreso: 2014, semestreIngreso: 1, anioEgreso: 2020, semestreEgreso: 1,
      tituloAcademico: "Lic. en Estadística",
      areaEspecializacion: "Estadística educativa",
      ciudadResidencia: "Oruro", regionResidencia: "Oruro",
      inicioProceso: null, motivoNoTitulacion: null, planeaTitularse: null,
    },
    {
      tipo: "Titulado" as const,
      nombres: "Sebastián", apellidos: "Gutierrez Nina",
      apellidoPaterno: "Gutierrez", apellidoMaterno: "Nina",
      ci: "10000013", celular: "71000013", correoElectronico: "sebastian.gutierrez@gmail.com",
      direccion: "Zona Norte, La Paz", fechaNacimiento: "1996-09-05",
      fechaGraduacion: "2023-04-10", anioTitulacion: 2023,
      planEstudiosNombre: "2020", modalidadTitulacion: "Excelencia" as const,
      anioIngreso: 2017, semestreIngreso: 1, anioEgreso: 2022, semestreEgreso: 2,
      tituloAcademico: "Lic. en Estadística",
      areaEspecializacion: "Inteligencia artificial",
      ciudadResidencia: "La Paz", regionResidencia: "La Paz",
      inicioProceso: null, motivoNoTitulacion: null, planeaTitularse: null,
    },
    {
      tipo: "Titulado" as const,
      nombres: "Daniela", apellidos: "Arce Flores",
      apellidoPaterno: "Arce", apellidoMaterno: "Flores",
      ci: "10000014", celular: "71000014", correoElectronico: "daniela.arce@gmail.com",
      direccion: "Av. Hernando Siles, La Paz", fechaNacimiento: "1997-12-01",
      fechaGraduacion: "2023-11-15", anioTitulacion: 2023,
      planEstudiosNombre: "2020", modalidadTitulacion: "Tesis" as const,
      anioIngreso: 2017, semestreIngreso: 2, anioEgreso: 2022, semestreEgreso: 1,
      tituloAcademico: "Lic. en Estadística",
      areaEspecializacion: "Estadística sanitaria",
      ciudadResidencia: "La Paz", regionResidencia: "La Paz",
      inicioProceso: null, motivoNoTitulacion: null, planeaTitularse: null,
    },
    {
      tipo: "Titulado" as const,
      nombres: "Miguel Ángel", apellidos: "Ramos Villca",
      apellidoPaterno: "Ramos", apellidoMaterno: "Villca",
      ci: "10000015", celular: "71000015", correoElectronico: "miguel.ramos@gmail.com",
      direccion: "Tarija Centro", fechaNacimiento: "1990-07-14",
      fechaGraduacion: "2016-07-20", anioTitulacion: 2016,
      planEstudiosNombre: "2008", modalidadTitulacion: "Excelencia" as const,
      anioIngreso: 2009, semestreIngreso: 1, anioEgreso: 2015, semestreEgreso: 2,
      tituloAcademico: "Lic. en Estadística",
      areaEspecializacion: "Estadística agraria",
      ciudadResidencia: "Tarija", regionResidencia: "Tarija",
      inicioProceso: null, motivoNoTitulacion: null, planeaTitularse: null,
    },
    {
      tipo: "Titulado" as const,
      nombres: "Patricia", apellidos: "Zenteno Abad",
      apellidoPaterno: "Zenteno", apellidoMaterno: "Abad",
      ci: "10000016", celular: "71000016", correoElectronico: "patricia.zenteno@gmail.com",
      direccion: "Sucre Centro", fechaNacimiento: "1987-02-25",
      fechaGraduacion: "2014-03-12", anioTitulacion: 2014,
      planEstudiosNombre: "2008", modalidadTitulacion: "Tesis" as const,
      anioIngreso: 2006, semestreIngreso: 2, anioEgreso: 2013, semestreEgreso: 1,
      tituloAcademico: "Lic. en Estadística",
      areaEspecializacion: "Estadística gubernamental",
      ciudadResidencia: "Sucre", regionResidencia: "Chuquisaca",
      inicioProceso: null, motivoNoTitulacion: null, planeaTitularse: null,
    },
    {
      tipo: "Titulado" as const,
      nombres: "Gonzalo", apellidos: "Pardo Lozano",
      apellidoPaterno: "Pardo", apellidoMaterno: "Lozano",
      ci: "10000017", celular: "71000017", correoElectronico: "gonzalo.pardo@gmail.com",
      direccion: "Trinidad, Beni", fechaNacimiento: "1991-10-30",
      fechaGraduacion: "2019-02-28", anioTitulacion: 2019,
      planEstudiosNombre: "2008", modalidadTitulacion: "Trabajo dirigido" as const,
      anioIngreso: 2011, semestreIngreso: 1, anioEgreso: 2018, semestreEgreso: 1,
      tituloAcademico: "Lic. en Estadística",
      areaEspecializacion: "Estadística ambiental",
      ciudadResidencia: "Trinidad", regionResidencia: "Beni",
      inicioProceso: null, motivoNoTitulacion: null, planeaTitularse: null,
    },
    {
      tipo: "Titulado" as const,
      nombres: "Natalia", apellidos: "Vega Herrera",
      apellidoPaterno: "Vega", apellidoMaterno: "Herrera",
      ci: "10000018", celular: "71000018", correoElectronico: "natalia.vega@gmail.com",
      direccion: "Cobija, Pando", fechaNacimiento: "1994-08-17",
      fechaGraduacion: "2022-03-25", anioTitulacion: 2022,
      planEstudiosNombre: "2020", modalidadTitulacion: "Proyecto de grado" as const,
      anioIngreso: 2015, semestreIngreso: 2, anioEgreso: 2021, semestreEgreso: 1,
      tituloAcademico: "Lic. en Estadística",
      areaEspecializacion: "Estadística forestal",
      ciudadResidencia: "Cobija", regionResidencia: "Pando",
      inicioProceso: null, motivoNoTitulacion: null, planeaTitularse: null,
    },
    {
      tipo: "Titulado" as const,
      nombres: "Iván", apellidos: "Medina Calle",
      apellidoPaterno: "Medina", apellidoMaterno: "Calle",
      ci: "10000019", celular: "71000019", correoElectronico: "ivan.medina@gmail.com",
      direccion: "Potosí Centro", fechaNacimiento: "1985-12-03",
      fechaGraduacion: "2012-08-14", anioTitulacion: 2012,
      planEstudiosNombre: "2008", modalidadTitulacion: "Tesis" as const,
      anioIngreso: 2004, semestreIngreso: 1, anioEgreso: 2011, semestreEgreso: 2,
      tituloAcademico: "Lic. en Estadística",
      areaEspecializacion: "Estadística minera",
      ciudadResidencia: "Potosí", regionResidencia: "Potosí",
      inicioProceso: null, motivoNoTitulacion: null, planeaTitularse: null,
    },
    {
      tipo: "Titulado" as const,
      nombres: "Claudia", apellidos: "Soria Balboa",
      apellidoPaterno: "Soria", apellidoMaterno: "Balboa",
      ci: "10000020", celular: "71000020", correoElectronico: "claudia.soria@gmail.com",
      direccion: "Av. Ballivián, La Paz", fechaNacimiento: "1999-05-10",
      fechaGraduacion: "2024-05-30", anioTitulacion: 2024,
      planEstudiosNombre: "2020", modalidadTitulacion: "Excelencia" as const,
      anioIngreso: 2018, semestreIngreso: 1, anioEgreso: 2023, semestreEgreso: 2,
      tituloAcademico: "Lic. en Estadística",
      areaEspecializacion: "Big Data",
      ciudadResidencia: "La Paz", regionResidencia: "La Paz",
      inicioProceso: null, motivoNoTitulacion: null, planeaTitularse: null,
    },
    // ── EGRESADOS SIN TÍTULO ───────────────────────────────────────────────
    {
      tipo: "Egresado" as const,
      nombres: "Paola Vanessa", apellidos: "Huanca Mendoza",
      apellidoPaterno: "Huanca", apellidoMaterno: "Mendoza",
      ci: "10000021", celular: "71000021", correoElectronico: "paola.huanca@gmail.com",
      direccion: "Calle Yungas 200, La Paz", fechaNacimiento: "1994-06-10",
      fechaGraduacion: "2020-01-01", anioTitulacion: null,
      planEstudiosNombre: "2008", modalidadTitulacion: null,
      anioIngreso: 2012, semestreIngreso: 1, anioEgreso: 2019, semestreEgreso: 2,
      tituloAcademico: null,
      areaEspecializacion: "Estadística social",
      ciudadResidencia: "La Paz", regionResidencia: "La Paz",
      inicioProceso: true, motivoNoTitulacion: "Dificultades económicas.", planeaTitularse: true,
    },
    {
      tipo: "Egresado" as const,
      nombres: "Marcos Antonio", apellidos: "Ticona Ramos",
      apellidoPaterno: "Ticona", apellidoMaterno: "Ramos",
      ci: "10000022", celular: "71000022", correoElectronico: "marcos.ticona@gmail.com",
      direccion: "Av. Periférica 1500, El Alto", fechaNacimiento: "1991-12-03",
      fechaGraduacion: "2018-06-01", anioTitulacion: null,
      planEstudiosNombre: "2008", modalidadTitulacion: null,
      anioIngreso: 2009, semestreIngreso: 2, anioEgreso: 2017, semestreEgreso: 1,
      tituloAcademico: null,
      areaEspecializacion: "Análisis empresarial",
      ciudadResidencia: "El Alto", regionResidencia: "La Paz",
      inicioProceso: false, motivoNoTitulacion: "Se incorporó al mercado laboral.", planeaTitularse: false,
    },
    {
      tipo: "Egresado" as const,
      nombres: "Laura", apellidos: "Apaza Choque",
      apellidoPaterno: "Apaza", apellidoMaterno: "Choque",
      ci: "10000023", celular: "71000023", correoElectronico: "laura.apaza@gmail.com",
      direccion: "Cochabamba Norte", fechaNacimiento: "1995-04-20",
      fechaGraduacion: "2021-01-01", anioTitulacion: null,
      planEstudiosNombre: "2020", modalidadTitulacion: null,
      anioIngreso: 2014, semestreIngreso: 1, anioEgreso: 2020, semestreEgreso: 2,
      tituloAcademico: null,
      areaEspecializacion: "Estadística de salud",
      ciudadResidencia: "Cochabamba", regionResidencia: "Cochabamba",
      inicioProceso: true, motivoNoTitulacion: "Trabajo a tiempo completo.", planeaTitularse: true,
    },
    {
      tipo: "Egresado" as const,
      nombres: "Ernesto", apellidos: "Callisaya Lima",
      apellidoPaterno: "Callisaya", apellidoMaterno: "Lima",
      ci: "10000024", celular: "71000024", correoElectronico: "ernesto.callisaya@gmail.com",
      direccion: "Santa Cruz Este", fechaNacimiento: "1993-08-14",
      fechaGraduacion: "2019-06-01", anioTitulacion: null,
      planEstudiosNombre: "2008", modalidadTitulacion: null,
      anioIngreso: 2011, semestreIngreso: 2, anioEgreso: 2018, semestreEgreso: 2,
      tituloAcademico: null,
      areaEspecializacion: "Business Intelligence",
      ciudadResidencia: "Santa Cruz", regionResidencia: "Santa Cruz",
      inicioProceso: false, motivoNoTitulacion: "Migración al extranjero.", planeaTitularse: false,
    },
    {
      tipo: "Egresado" as const,
      nombres: "Silvia", apellidos: "Mamani Torres",
      apellidoPaterno: "Mamani", apellidoMaterno: "Torres",
      ci: "10000025", celular: "71000025", correoElectronico: "silvia.mamani@gmail.com",
      direccion: "Av. Montes 500, La Paz", fechaNacimiento: "1997-01-29",
      fechaGraduacion: "2023-01-01", anioTitulacion: null,
      planEstudiosNombre: "2020", modalidadTitulacion: null,
      anioIngreso: 2016, semestreIngreso: 1, anioEgreso: 2022, semestreEgreso: 1,
      tituloAcademico: null,
      areaEspecializacion: "Estadística educativa",
      ciudadResidencia: "La Paz", regionResidencia: "La Paz",
      inicioProceso: true, motivoNoTitulacion: "Pendiente de requisitos.", planeaTitularse: true,
    },
  ];

  const egresadosCreados = await db.insert(schema.egresado)
    .values(egresadosData)
    .returning();

  console.log(`✅ ${egresadosCreados.length} egresados creados`);

  // ── HISTORIAL LABORAL ─────────────────────────────────────────────────────
  const historialData = [
    // Carlos Mamani (10000001) — Público
    { idEgresado: egresadosCreados[0].id, empresa: "INE Bolivia", cargo: "Estadístico Senior", area: "Censos", ciudad: "La Paz", sector: "Publico" as const, tipoContrato: "Indefinido" as const, fechaInicio: "2015-03-01", fechaFin: null },
    // María Flores (10000002) — Público
    { idEgresado: egresadosCreados[1].id, empresa: "UDAPE", cargo: "Investigadora Senior", area: "Macroeconomía", ciudad: "La Paz", sector: "Publico" as const, tipoContrato: "Fijo" as const, fechaInicio: "2017-08-01", fechaFin: null },
    // Roberto Vargas (10000003) — Privado
    { idEgresado: egresadosCreados[2].id, empresa: "Deloitte Bolivia", cargo: "Consultor", area: "Auditoría", ciudad: "La Paz", sector: "Privado" as const, tipoContrato: "Indefinido" as const, fechaInicio: "2014-05-01", fechaFin: "2018-12-31" },
    { idEgresado: egresadosCreados[2].id, empresa: "PwC Bolivia", cargo: "Senior Consultant", area: "Riesgo", ciudad: "La Paz", sector: "Privado" as const, tipoContrato: "Indefinido" as const, fechaInicio: "2019-02-01", fechaFin: null },
    // Lucía Choque (10000004) — Público
    { idEgresado: egresadosCreados[3].id, empresa: "Ministerio de Salud", cargo: "Analista Epidemiología", area: "Epidemiología", ciudad: "La Paz", sector: "Publico" as const, tipoContrato: "Fijo" as const, fechaInicio: "2021-03-01", fechaFin: null },
    // Diego Quispe (10000005) — Privado
    { idEgresado: egresadosCreados[4].id, empresa: "BancoSol", cargo: "Analista de Riesgo", area: "Riesgo Crediticio", ciudad: "La Paz", sector: "Privado" as const, tipoContrato: "Indefinido" as const, fechaInicio: "2019-06-01", fechaFin: null },
    // Ana Condori (10000006) — Privado (sin empleo actual — finalizó)
    { idEgresado: egresadosCreados[5].id, empresa: "Tigo Bolivia", cargo: "Data Analyst", area: "BI", ciudad: "La Paz", sector: "Privado" as const, tipoContrato: "Fijo" as const, fechaInicio: "2022-07-01", fechaFin: "2023-06-30" },
    // Jorge Ticona (10000007) — Independiente
    { idEgresado: egresadosCreados[6].id, empresa: "Consultoría JT", cargo: "Consultor Independiente", area: "Estadística", ciudad: "La Paz", sector: "Independiente" as const, tipoContrato: "Consultor" as const, fechaInicio: "2023-01-01", fechaFin: null },
    // Valeria Huanca (10000008) — ONG
    { idEgresado: egresadosCreados[7].id, empresa: "UNICEF Bolivia", cargo: "Oficial de M&E", area: "Monitoreo", ciudad: "La Paz", sector: "ONG" as const, tipoContrato: "Fijo" as const, fechaInicio: "2021-06-01", fechaFin: null },
    // Rodrigo Aliaga (10000009) — Privado
    { idEgresado: egresadosCreados[8].id, empresa: "Clínica Los Andes", cargo: "Bioestadístico", area: "Investigación", ciudad: "Cochabamba", sector: "Privado" as const, tipoContrato: "Indefinido" as const, fechaInicio: "2020-04-01", fechaFin: null },
    // Camila Rojas (10000010) — Privado
    { idEgresado: egresadosCreados[9].id, empresa: "Cervecería Boliviana", cargo: "Analista de Datos", area: "Operaciones", ciudad: "Santa Cruz", sector: "Privado" as const, tipoContrato: "Indefinido" as const, fechaInicio: "2018-10-01", fechaFin: null },
    // Pablo Morales (10000011) — Privado (banco)
    { idEgresado: egresadosCreados[10].id, empresa: "Banco Mercantil", cargo: "Analista Cuantitativo", area: "Finanzas", ciudad: "La Paz", sector: "Privado" as const, tipoContrato: "Indefinido" as const, fechaInicio: "2017-01-01", fechaFin: null },
    // Fernanda López (10000012) — Público
    { idEgresado: egresadosCreados[11].id, empresa: "Ministerio de Educación", cargo: "Analista Estadístico", area: "Planificación", ciudad: "La Paz", sector: "Publico" as const, tipoContrato: "Fijo" as const, fechaInicio: "2022-01-01", fechaFin: null },
    // Sebastián Gutierrez (10000013) — Privado (tech)
    { idEgresado: egresadosCreados[12].id, empresa: "Quantum Labs", cargo: "ML Engineer", area: "IA", ciudad: "La Paz", sector: "Privado" as const, tipoContrato: "Indefinido" as const, fechaInicio: "2023-05-01", fechaFin: null },
    // Daniela Arce (10000014) — sin empleo aún
    // Miguel Ramos (10000015) — Público
    { idEgresado: egresadosCreados[14].id, empresa: "Gobernación Tarija", cargo: "Director Estadística", area: "Planificación", ciudad: "Tarija", sector: "Publico" as const, tipoContrato: "Indefinido" as const, fechaInicio: "2016-08-01", fechaFin: null },
    // Patricia Zenteno (10000016) — Público
    { idEgresado: egresadosCreados[15].id, empresa: "Tribunal Supremo Electoral", cargo: "Estadística Electoral", area: "Datos", ciudad: "Sucre", sector: "Publico" as const, tipoContrato: "Fijo" as const, fechaInicio: "2015-01-01", fechaFin: null },
    // Gonzalo Pardo (10000017) — ONG
    { idEgresado: egresadosCreados[16].id, empresa: "WWF Bolivia", cargo: "Analista Ambiental", area: "Biodiversidad", ciudad: "Trinidad", sector: "ONG" as const, tipoContrato: "Fijo" as const, fechaInicio: "2019-04-01", fechaFin: null },
    // Natalia Vega (10000018) — Público
    { idEgresado: egresadosCreados[17].id, empresa: "Gobernación Pando", cargo: "Técnica Estadística", area: "Planificación", ciudad: "Cobija", sector: "Publico" as const, tipoContrato: "Fijo" as const, fechaInicio: "2022-06-01", fechaFin: null },
    // Iván Medina (10000019) — Privado
    { idEgresado: egresadosCreados[18].id, empresa: "COMIBOL", cargo: "Analista Minero", area: "Producción", ciudad: "Potosí", sector: "Privado" as const, tipoContrato: "Indefinido" as const, fechaInicio: "2013-01-01", fechaFin: null },
    // Claudia Soria (10000020) — Privado (tech)
    { idEgresado: egresadosCreados[19].id, empresa: "Datalab Bolivia", cargo: "Data Scientist", area: "Analytics", ciudad: "La Paz", sector: "Privado" as const, tipoContrato: "Indefinido" as const, fechaInicio: "2024-06-01", fechaFin: null },
    // Paola Huanca (10000021) — Público
    { idEgresado: egresadosCreados[20].id, empresa: "UDAPE", cargo: "Técnica Social", area: "Social", ciudad: "La Paz", sector: "Publico" as const, tipoContrato: "Fijo" as const, fechaInicio: "2019-10-01", fechaFin: null },
    // Marcos Ticona (10000022) — Privado
    { idEgresado: egresadosCreados[21].id, empresa: "ENTEL", cargo: "Analista BI", area: "TI", ciudad: "La Paz", sector: "Privado" as const, tipoContrato: "Indefinido" as const, fechaInicio: "2018-03-15", fechaFin: null },
    // Laura Apaza (10000023) — Público
    { idEgresado: egresadosCreados[22].id, empresa: "Ministerio de Salud Cbba", cargo: "Estadística Salud", area: "Salud", ciudad: "Cochabamba", sector: "Publico" as const, tipoContrato: "Fijo" as const, fechaInicio: "2021-02-01", fechaFin: null },
    // Ernesto Callisaya (10000024) — Privado
    { idEgresado: egresadosCreados[23].id, empresa: "Saguapac", cargo: "Analista Datos", area: "Operaciones", ciudad: "Santa Cruz", sector: "Privado" as const, tipoContrato: "Indefinido" as const, fechaInicio: "2019-07-01", fechaFin: null },
    // Silvia Mamani (10000025) — ONG
    { idEgresado: egresadosCreados[24].id, empresa: "Plan Internacional Bolivia", cargo: "Oficial M&E", area: "Educación", ciudad: "La Paz", sector: "ONG" as const, tipoContrato: "Fijo" as const, fechaInicio: "2023-02-01", fechaFin: null },
  ];

  await db.insert(schema.historialLaboral).values(historialData);
  console.log(`✅ ${historialData.length} registros de historial laboral creados`);

  // ── POSTGRADOS ────────────────────────────────────────────────────────────
  await db.insert(schema.postgrado).values([
    { idEgresado: egresadosCreados[0].id,  tipo: "Maestria",    institucion: "UMSA",           pais: "Bolivia",    anioInicio: 2018, anioFin: 2020, estado: "Finalizado" },
    { idEgresado: egresadosCreados[1].id,  tipo: "Maestria",    institucion: "FLACSO",          pais: "Argentina",  anioInicio: 2019, anioFin: 2021, estado: "Finalizado" },
    { idEgresado: egresadosCreados[2].id,  tipo: "Diplomado",   institucion: "FLACSO Argentina",pais: "Argentina",  anioInicio: 2016, anioFin: 2017, estado: "Finalizado" },
    { idEgresado: egresadosCreados[4].id,  tipo: "Especialidad",institucion: "PUCP",            pais: "Perú",       anioInicio: 2022, estado: "En curso" },
    { idEgresado: egresadosCreados[5].id,  tipo: "Maestria",    institucion: "Universidad de Chile", pais: "Chile", anioInicio: 2023, estado: "En curso" },
    { idEgresado: egresadosCreados[7].id,  tipo: "Diplomado",   institucion: "UPB",             pais: "Bolivia",    anioInicio: 2021, anioFin: 2022, estado: "Finalizado" },
    { idEgresado: egresadosCreados[9].id,  tipo: "Maestria",    institucion: "Universidad Austral", pais: "Argentina", anioInicio: 2020, anioFin: 2022, estado: "Finalizado" },
    { idEgresado: egresadosCreados[12].id, tipo: "Maestria",    institucion: "UPC",             pais: "España",     anioInicio: 2024, estado: "En curso" },
    { idEgresado: egresadosCreados[20].id, tipo: "Diplomado",   institucion: "UPB",             pais: "Bolivia",    anioInicio: 2021, anioFin: 2022, estado: "Finalizado" },
  ]);
  console.log("✅ Postgrados creados");

  // ── Activar directorio ────────────────────────────────────────────────────
  for (const eg of egresadosCreados) {
    await db.update(schema.egresado)
      .set({ mostrarEnDirectorio: true })
      .where(eq(schema.egresado.id, eg.id));
  }

  // ── USUARIOS ──────────────────────────────────────────────────────────────
  const adminEmail = process.env.ADMIN_EMAIL ?? "admin@estadistica.bo";
  const adminPass  = process.env.ADMIN_PASSWORD ?? "Admin1234!";

  await db.insert(schema.usuario).values({
    ci: "admin", correo: adminEmail,
    passwordHash: await bcrypt.hash(adminPass, 12),
    rol: "admin", estado: "activo", primerLogin: false,
    correoVerificado: true, celularVerificado: false,
  });

  for (const eg of egresadosCreados) {
    await db.insert(schema.usuario).values({
      ci: eg.ci, correo: eg.correoElectronico!,
      passwordHash: await bcrypt.hash(eg.ci, 12),
      rol: "egresado", estado: "activo", idEgresado: eg.id,
      primerLogin: true, correoVerificado: false, celularVerificado: false,
    });
  }

  console.log(`✅ ${egresadosCreados.length + 1} usuarios creados\n`);
  console.log("━".repeat(60));
  console.log(`👑 Admin: ${adminEmail} / ${adminPass}`);
  console.log("━".repeat(60) + "\n");
}

main()
  .catch(e => { console.error("❌ Error:", e); process.exit(1); })
  .finally(() => pool.end());