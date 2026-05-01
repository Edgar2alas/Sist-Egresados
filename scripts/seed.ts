// scripts/seed.ts
// Actualizado — Bloque 0: incluye ejemplos de Titulados y Egresados

import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import * as schema from "../src/lib/schema";
import bcrypt from "bcryptjs";
import * as dotenv from "dotenv";
import { eq } from "drizzle-orm";

dotenv.config({ path: ".env.local" });

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const db   = drizzle(pool, { schema });

function generarPasswordInicial(ci: string): string {
  return ci;
}

async function main() {
  console.log("\n🌱 Limpiando BD y sembrando datos...\n");

  // ── Limpiar en orden por FK ──────────────────────────────────────────────
  await db.delete(schema.verificacionTokens);
  await db.delete(schema.sugerencias);
  await db.delete(schema.postgrado);
  await db.delete(schema.historialLaboral);
  await db.delete(schema.usuario);
  await db.delete(schema.egresado);
  console.log("🗑️  Tablas limpiadas\n");

  // ── Egresados — mezcla de Titulados y Egresados (Bloque 0) ───────────────
  console.log("👥 Creando egresados (Titulados y Egresados)...");

  const egresadosData = [
    // ── TITULADOS ─────────────────────────────────────────────────────────
    {
      tipo:                "Titulado" as const,
      nombres:             "Carlos Alberto",
      apellidos:           "Mamani Quispe",
      apellidoPaterno:     "Mamani",
      apellidoMaterno:     "Quispe",
      ci:                  "12345678",
      celular:             "72345678",
      correoElectronico:   "edgarslsasbirrueta@gmail.com",
      direccion:           "Av. Arce 123, La Paz",
      fechaNacimiento:     "1990-03-15",
      fechaGraduacion:     "2015-11-20",
      anioTitulacion:      2015,
      planEstudiosNombre:  "2008",
      modalidadTitulacion: "Tesis" as const,
      anioIngreso:         2008,
      semestreIngreso:     1,
      anioEgreso:          2014,
      semestreEgreso:      2,
      tituloAcademico:     "Lic. en Estadística",
      linkedin:            "https://linkedin.com/in/carlos-mamani",
      areaEspecializacion: "Estadística oficial y censos",
      // Campos exclusivos Egresado → null para Titulados
      inicioProceso:       null,
      motivoNoTitulacion:  null,
      planeaTitularse:     null,
    },
    {
      tipo:                "Titulado" as const,
      nombres:             "María Elena",
      apellidos:           "Flores Condori",
      apellidoPaterno:     "Flores",
      apellidoMaterno:     "Condori",
      ci:                  "87654321",
      celular:             "71234567",
      correoElectronico:   "jorgepigpeppino@gmail.com",
      direccion:           "Calle Loayza 456, La Paz",
      fechaNacimiento:     "1992-07-22",
      fechaGraduacion:     "2017-06-10",
      anioTitulacion:      2017,
      planEstudiosNombre:  "2008",
      modalidadTitulacion: "Proyecto de grado" as const,
      anioIngreso:         2010,
      semestreIngreso:     2,
      anioEgreso:          2016,
      semestreEgreso:      1,
      tituloAcademico:     "Lic. en Estadística",
      facebook:            "https://facebook.com/mariaflorescondori",
      areaEspecializacion: "Econometría y finanzas",
      inicioProceso:       null,
      motivoNoTitulacion:  null,
      planeaTitularse:     null,
    },
    {
      tipo:                "Titulado" as const,
      nombres:             "Roberto Andrés",
      apellidos:           "Vargas Torrez",
      apellidoPaterno:     "Vargas",
      apellidoMaterno:     "Torrez",
      ci:                  "11223344",
      celular:             "76543210",
      correoElectronico:   "peppapig88343@gmail.com",
      direccion:           "Av. Montes 789, La Paz",
      fechaNacimiento:     "1988-11-05",
      fechaGraduacion:     "2013-04-18",
      anioTitulacion:      2013,
      planEstudiosNombre:  "2008",
      modalidadTitulacion: "Trabajo dirigido" as const,
      anioIngreso:         2006,
      semestreIngreso:     1,
      anioEgreso:          2012,
      semestreEgreso:      2,
      tituloAcademico:     "Lic. en Estadística",
      linkedin:            "https://linkedin.com/in/roberto-vargas",
      areaEspecializacion: "Auditoría y consultoría estadística",
      inicioProceso:       null,
      motivoNoTitulacion:  null,
      planeaTitularse:     null,
    },
    {
      tipo:                "Titulado" as const,
      nombres:             "Lucía Patricia",
      apellidos:           "Choque Apaza",
      apellidoPaterno:     "Choque",
      apellidoMaterno:     "Apaza",
      ci:                  "55667788",
      celular:             "78901234",
      correoElectronico:   "edgaralejandrosalasbirrueta@gmail.com",
      direccion:           "Calle Murillo 321, El Alto",
      fechaNacimiento:     "1995-02-28",
      fechaGraduacion:     "2020-12-01",
      anioTitulacion:      2020,
      planEstudiosNombre:  "2020",
      modalidadTitulacion: "Tesis" as const,
      anioIngreso:         2013,
      semestreIngreso:     1,
      anioEgreso:          2019,
      semestreEgreso:      1,
      tituloAcademico:     "Lic. en Estadística",
      areaEspecializacion: "Epidemiología y estadísticas vitales",
      inicioProceso:       null,
      motivoNoTitulacion:  null,
      planeaTitularse:     null,
    },
    {
      tipo:                "Titulado" as const,
      nombres:             "Diego Fernando",
      apellidos:           "Quispe Limachi",
      apellidoPaterno:     "Quispe",
      apellidoMaterno:     "Limachi",
      ci:                  "99887766",
      celular:             "79012345",
      correoElectronico:   "salasedgar307@gmail.com",
      direccion:           "Av. Bush 654, La Paz",
      fechaNacimiento:     "1993-09-14",
      fechaGraduacion:     "2019-08-25",
      anioTitulacion:      2019,
      planEstudiosNombre:  "2008",
      modalidadTitulacion: "Proyecto de grado" as const,
      anioIngreso:         2011,
      semestreIngreso:     2,
      anioEgreso:          2018,
      semestreEgreso:      2,
      tituloAcademico:     "Lic. en Estadística",
      linkedin:            "https://linkedin.com/in/diego-quispe",
      areaEspecializacion: "Riesgo crediticio y banca",
      inicioProceso:       null,
      motivoNoTitulacion:  null,
      planeaTitularse:     null,
    },

    // ── EGRESADOS SIN TÍTULO (Bloque 0) ───────────────────────────────────
    {
      tipo:                "Egresado" as const,
      nombres:             "Paola Vanessa",
      apellidos:           "Huanca Mendoza",
      apellidoPaterno:     "Huanca",
      apellidoMaterno:     "Mendoza",
      ci:                  "44556677",
      celular:             "77889900",
      correoElectronico:   "paola.huanca.ejemplo@gmail.com",
      direccion:           "Calle Yungas 200, La Paz",
      fechaNacimiento:     "1994-06-10",
      // Sin titulación
      fechaGraduacion:     "2020-01-01", // requerido por BD — año de egreso aproximado
      anioTitulacion:      null,
      planEstudiosNombre:  "2008",
      modalidadTitulacion: null,
      anioIngreso:         2012,
      semestreIngreso:     1,
      anioEgreso:          2019,
      semestreEgreso:      2,
      tituloAcademico:     null,
      facebook:            "https://facebook.com/paola.huanca",
      areaEspecializacion: "Estadística social",
      // Campos exclusivos Egresado
      inicioProceso:       true,
      motivoNoTitulacion:  "Dificultades económicas y laborales que impidieron dedicar tiempo completo al proceso.",
      planeaTitularse:     true,
    },
    {
      tipo:                "Egresado" as const,
      nombres:             "Marcos Antonio",
      apellidos:           "Ticona Ramos",
      apellidoPaterno:     "Ticona",
      apellidoMaterno:     "Ramos",
      ci:                  "33221100",
      celular:             "76655443",
      correoElectronico:   "marcos.ticona.ejemplo@gmail.com",
      direccion:           "Av. Periférica 1500, El Alto",
      fechaNacimiento:     "1991-12-03",
      fechaGraduacion:     "2018-06-01",
      anioTitulacion:      null,
      planEstudiosNombre:  "2008",
      modalidadTitulacion: null,
      anioIngreso:         2009,
      semestreIngreso:     2,
      anioEgreso:          2017,
      semestreEgreso:      1,
      tituloAcademico:     null,
      areaEspecializacion: "Análisis de datos empresariales",
      // Campos exclusivos Egresado
      inicioProceso:       false,
      motivoNoTitulacion:  "Se incorporó al mercado laboral inmediatamente y no retomó el proceso de titulación.",
      planeaTitularse:     false,
    },
  ];

  const egresadosCreados = await db.insert(schema.egresado)
    .values(egresadosData)
    .returning();

  const titulados = egresadosCreados.filter(e => e.tipo === "Titulado");
  const sinTitulo = egresadosCreados.filter(e => e.tipo === "Egresado");

  console.log(`✅ ${egresadosCreados.length} registros creados:`);
  console.log(`   🎓 ${titulados.length} Titulados`);
  console.log(`   📋 ${sinTitulo.length} Egresados sin título\n`);

  // ── Historial laboral ─────────────────────────────────────────────────────
  console.log("💼 Creando historial laboral...");

  const [eg1, eg2, eg3, eg4, eg5, eg6, eg7] = egresadosCreados;

  await db.insert(schema.historialLaboral).values([
    {
      idEgresado: eg1.id, empresa: "INE Bolivia", cargo: "Estadístico Senior",
      area: "Censos y Encuestas", ciudad: "La Paz", sector: "Publico",
      tipoContrato: "Indefinido", fechaInicio: "2016-03-01", fechaFin: null,
    },
    {
      idEgresado: eg2.id, empresa: "Banco Central de Bolivia",
      cargo: "Analista de Datos", area: "Estudios Económicos",
      ciudad: "La Paz", sector: "Publico", tipoContrato: "Indefinido",
      fechaInicio: "2018-01-15", fechaFin: "2021-06-30",
    },
    {
      idEgresado: eg2.id, empresa: "UDAPE",
      cargo: "Investigadora Senior", area: "Macroeconomía y Finanzas",
      ciudad: "La Paz", sector: "Publico", tipoContrato: "Fijo",
      fechaInicio: "2021-08-01", fechaFin: null,
    },
    {
      idEgresado: eg3.id, empresa: "Deloitte Bolivia",
      cargo: "Consultor Estadístico", area: "Auditoría y Consultoría",
      ciudad: "La Paz", sector: "Privado", tipoContrato: "Indefinido",
      fechaInicio: "2014-05-01", fechaFin: null,
    },
    {
      idEgresado: eg4.id, empresa: "Ministerio de Salud",
      cargo: "Analista de Estadísticas Vitales", area: "Epidemiología",
      ciudad: "La Paz", sector: "Publico", tipoContrato: "Fijo",
      fechaInicio: "2021-03-01", fechaFin: null,
    },
    {
      idEgresado: eg5.id, empresa: "BancoSol",
      cargo: "Analista de Riesgo", area: "Riesgo Crediticio",
      ciudad: "La Paz", sector: "Privado", tipoContrato: "Indefinido",
      fechaInicio: "2020-02-01", fechaFin: null,
    },
    // Egresados sin título — también tienen historial laboral
    {
      idEgresado: eg6.id, empresa: "UDAPE",
      cargo: "Técnica en Estadísticas Sociales", area: "Social",
      ciudad: "La Paz", sector: "Publico", tipoContrato: "Fijo",
      fechaInicio: "2019-10-01", fechaFin: null,
    },
    {
      idEgresado: eg7.id, empresa: "Empresa Nacional de Telecomunicaciones",
      cargo: "Analista de Business Intelligence", area: "TI y Datos",
      ciudad: "La Paz", sector: "Publico", tipoContrato: "Indefinido",
      fechaInicio: "2018-03-15", fechaFin: null,
    },
  ]);
  console.log("✅ Historial laboral creado\n");

  // ── Postgrados ─────────────────────────────────────────────────────────────
  console.log("🎓 Creando postgrados...");
  await db.insert(schema.postgrado).values([
    {
      idEgresado: eg1.id, tipo: "Maestria",
      institucion: "Universidad Mayor de San Andrés",
      pais: "Bolivia", anioInicio: 2018, anioFin: 2020, estado: "Finalizado",
    },
    {
      idEgresado: eg3.id, tipo: "Diplomado",
      institucion: "FLACSO Argentina",
      pais: "Argentina", anioInicio: 2016, anioFin: 2017, estado: "Finalizado",
    },
    {
      idEgresado: eg5.id, tipo: "Especialidad",
      institucion: "Pontificia Universidad Católica del Perú",
      pais: "Perú", anioInicio: 2022, estado: "En curso",
    },
    // Egresado sin título también tiene postgrado
    {
      idEgresado: eg6.id, tipo: "Diplomado",
      institucion: "Universidad Privada Boliviana",
      pais: "Bolivia", anioInicio: 2021, anioFin: 2022, estado: "Finalizado",
    },
  ]);
  console.log("✅ Postgrados creados\n");

  // ── Activar directorio en todos ───────────────────────────────────────────
  for (const eg of egresadosCreados) {
    await db.update(schema.egresado)
      .set({ mostrarEnDirectorio: true })
      .where(eq(schema.egresado.id, eg.id));
  }
  console.log("✅ Directorio activado para todos\n");

  // ── Usuarios ──────────────────────────────────────────────────────────────
  console.log("👤 Creando usuarios...");

  const adminEmail = process.env.ADMIN_EMAIL ?? "admin@estadistica.bo";
  const adminPass  = process.env.ADMIN_PASSWORD ?? "Admin1234!";

  // Admin
  await db.insert(schema.usuario).values({
    ci:           "admin",          // CI especial para el admin
    correo:       adminEmail,
    passwordHash: await bcrypt.hash(adminPass, 12),
    rol:          "admin",
    estado:       "activo",
    primerLogin:  false,
    correoVerificado: true,
    celularVerificado: false,
  });
  console.log(`   👑 Admin creado: ${adminEmail} | pass: ${adminPass}`);

  // Usuarios para cada egresado
  const usuariosData = [
    { egresado: eg1, email: "edgarslsasbirrueta@gmail.com" },
    { egresado: eg2, email: "jorgepigpeppino@gmail.com" },
    { egresado: eg3, email: "peppapig88343@gmail.com" },
    { egresado: eg4, email: "edgaralejandrosalasbirrueta@gmail.com" },
    { egresado: eg5, email: "salasedgar307@gmail.com" },
    { egresado: eg6, email: "paola.huanca.ejemplo@gmail.com" },
    { egresado: eg7, email: "marcos.ticona.ejemplo@gmail.com" },
  ];

  for (const { egresado: eg, email } of usuariosData) {
      const passInicial = generarPasswordInicial(eg.ci);

      await db.insert(schema.usuario).values({
        ci:                eg.ci,
        correo:            email,
        passwordHash:      await bcrypt.hash(passInicial, 12),
        rol:               "egresado",
        estado:            "activo",
        idEgresado:        eg.id,
        primerLogin:       true,
        correoVerificado:  false,
        celularVerificado: false,
      });

      const tipoLabel = eg.tipo === "Titulado" ? "🎓" : "📋";
      console.log(`   ${tipoLabel} [${eg.tipo}] ${eg.nombres} ${eg.apellidos}`);
      console.log(`      CI (usuario): ${eg.ci}`);
      console.log(`      🔑 Contraseña inicial: ${passInicial}\n`);
    }

  // ── Resumen final ─────────────────────────────────────────────────────────
  console.log("\n✅ Seed completo!\n");
  console.log("━".repeat(64));
  console.log("📋 RESUMEN DE ACCESOS:");
  console.log("━".repeat(64));
  console.log(`👑 ADMINISTRADOR:`);
  console.log(`   📧 ${adminEmail}`);
  console.log(`   🔑 ${adminPass}\n`);

  console.log("🎓 TITULADOS:\n");
  for (const { egresado: eg } of usuariosData.filter(u => u.egresado.tipo === "Titulado")) {
    const pass = generarPasswordInicial(eg.ci);
    console.log(`   📌 ${eg.nombres} ${eg.apellidos}`);
    console.log(`      CI: ${eg.ci} | 🔑 ${pass}\n`);
  }

    console.log("📋 EGRESADOS SIN TÍTULO (Bloque 0):\n");
  for (const { egresado: eg } of usuariosData.filter(u => u.egresado.tipo === "Egresado")) {
    const pass = generarPasswordInicial(eg.ci);
    console.log(`   📌 ${eg.nombres} ${eg.apellidos}`);
    console.log(`      CI: ${eg.ci} | 🔑 ${pass}`);
    console.log(`      💡 inicioProceso=${eg.inicioProceso} | planeaTitularse=${eg.planeaTitularse}\n`);
  }

  console.log("⚠️  Todos los egresados tienen primerLogin=true → serán redirigidos a cambiar contraseña");
  console.log("━".repeat(64) + "\n");
}

main()
  .catch(e => { console.error("❌ Error:", e); process.exit(1); })
  .finally(() => pool.end());
