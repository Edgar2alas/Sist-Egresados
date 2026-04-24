import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import * as schema from "../src/lib/schema";
import bcrypt from "bcryptjs";
import * as dotenv from "dotenv";
import { eq } from "drizzle-orm";

dotenv.config({ path: ".env.local" });

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const db   = drizzle(pool, { schema });

function generarPasswordInicial(
  ci: string,
  nombres: string,
  apellidoPaterno?: string | null,
  apellidoMaterno?: string | null,
  apellidos?: string | null,
): string {
  const inicialNombre   = nombres.trim()[0]?.toUpperCase() ?? "";
  const primerApellido  = apellidoPaterno?.trim() || apellidos?.trim() || "";
  const inicialApellido = primerApellido[0]?.toUpperCase() ?? "";
  return `${ci}${inicialNombre}${inicialApellido}`;
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

  // ── Egresados ────────────────────────────────────────────────────────────
  console.log("👥 Creando egresados...");

  const egresadosData = [
    {
      nombres: "Carlos Alberto", apellidos: "Mamani Quispe",
      apellidoPaterno: "Mamani", apellidoMaterno: "Quispe",
      ci: "12345678", celular: "72345678",
      correoElectronico: "edgarslsasbirrueta@gmail.com", // ← Correo 1
      direccion: "Av. Arce 123, La Paz",
      fechaNacimiento: "1990-03-15", fechaGraduacion: "2015-11-20",
      anioTitulacion: 2015, planEstudiosNombre: "2008",
      modalidadTitulacion: "Tesis" as const,
      anioIngreso: 2008, semestreIngreso: 1,
      anioEgreso: 2014, semestreEgreso: 2,
    },
    {
      nombres: "María Elena", apellidos: "Flores Condori",
      apellidoPaterno: "Flores", apellidoMaterno: "Condori",
      ci: "87654321", celular: "71234567",
      correoElectronico: "jorgepigpeppino@gmail.com", // ← Correo 2
      direccion: "Calle Loayza 456, La Paz",
      fechaNacimiento: "1992-07-22", fechaGraduacion: "2017-06-10",
      anioTitulacion: 2017, planEstudiosNombre: "2008",
      modalidadTitulacion: "Proyecto de grado" as const,
      anioIngreso: 2010, semestreIngreso: 2,
      anioEgreso: 2016, semestreEgreso: 1,
    },
    {
      nombres: "Roberto Andrés", apellidos: "Vargas Torrez",
      apellidoPaterno: "Vargas", apellidoMaterno: "Torrez",
      ci: "11223344", celular: "76543210",
      correoElectronico: "peppapig88343@gmail.com", // ← Correo 3
      direccion: "Av. Montes 789, La Paz",
      fechaNacimiento: "1988-11-05", fechaGraduacion: "2013-04-18",
      anioTitulacion: 2013, planEstudiosNombre: "2008",
      modalidadTitulacion: "Trabajo dirigido" as const,
      anioIngreso: 2006, semestreIngreso: 1,
      anioEgreso: 2012, semestreEgreso: 2,
    },
    {
      nombres: "Lucía Patricia", apellidos: "Choque Apaza",
      apellidoPaterno: "Choque", apellidoMaterno: "Apaza",
      ci: "55667788", celular: "78901234",
      correoElectronico: "edgaralejandrosalasbirrueta@gmail.com", // ← Correo 4
      direccion: "Calle Murillo 321, El Alto",
      fechaNacimiento: "1995-02-28", fechaGraduacion: "2020-12-01",
      anioTitulacion: 2020, planEstudiosNombre: "2020",
      modalidadTitulacion: "Tesis" as const,
      anioIngreso: 2013, semestreIngreso: 1,
      anioEgreso: 2019, semestreEgreso: 1,
    },
    {
      nombres: "Diego Fernando", apellidos: "Quispe Limachi",
      apellidoPaterno: "Quispe", apellidoMaterno: "Limachi",
      ci: "99887766", celular: "79012345",
      correoElectronico: "salasedgar307@gmail.com", // ← Correo 5
      direccion: "Av. Bush 654, La Paz",
      fechaNacimiento: "1993-09-14", fechaGraduacion: "2019-08-25",
      anioTitulacion: 2019, planEstudiosNombre: "2008",
      modalidadTitulacion: "Proyecto de grado" as const,
      anioIngreso: 2011, semestreIngreso: 2,
      anioEgreso: 2018, semestreEgreso: 2,
    },
  ];

  const egresadosCreados = await db.insert(schema.egresado)
    .values(egresadosData)
    .returning();

  console.log(`✅ ${egresadosCreados.length} egresados creados\n`);

  // ── Historial laboral ─────────────────────────────────────────────────────
  console.log("💼 Creando historial laboral...");

  const [eg1, eg2, eg3, eg4, eg5] = egresadosCreados;

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
    correo:       adminEmail,
    passwordHash: await bcrypt.hash(adminPass, 12),
    rol:          "admin",
    estado:       "activo",
    primerLogin:  false,
  });
  console.log(`   👑 Admin creado: ${adminEmail} | pass: ${adminPass}`);

  // Usuarios egresados con sus correos reales
  const usuariosEgresados = [
    { egresado: eg1, email: "edgarslsasbirrueta@gmail.com" },
    { egresado: eg2, email: "jorgepigpeppino@gmail.com" },
    { egresado: eg3, email: "peppapig88343@gmail.com" },
    { egresado: eg4, email: "edgaralejandrosalasbirrueta@gmail.com" },
    { egresado: eg5, email: "salasedgar307@gmail.com" },
  ];

  for (const { egresado, email } of usuariosEgresados) {
    const passInicial = generarPasswordInicial(
      egresado.ci, 
      egresado.nombres, 
      egresado.apellidoPaterno, 
      egresado.apellidoMaterno, 
      egresado.apellidos
    );
    
    await db.insert(schema.usuario).values({
      correo:       email,
      passwordHash: await bcrypt.hash(passInicial, 12),
      rol:          "egresado",
      estado:       "activo",
      idEgresado:   egresado.id,
      primerLogin:  true,
    });
    
    console.log(`   👤 ${egresado.nombres} ${egresado.apellidos}`);
    console.log(`      📧 ${email}`);
    console.log(`      🔑 Password inicial: ${passInicial}\n`);
  }

  console.log("\n✅ Seed completo!\n");
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  console.log("📋 RESUMEN DE ACCESOS:");
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  console.log(`👑 ADMINISTRADOR:`);
  console.log(`   📧 ${adminEmail}`);
  console.log(`   🔑 ${adminPass}\n`);
  console.log("👥 EGRESADOS (todos con primerLogin=true):\n");
  
  for (const { egresado, email } of usuariosEgresados) {
    const passInicial = generarPasswordInicial(
      egresado.ci, 
      egresado.nombres, 
      egresado.apellidoPaterno, 
      egresado.apellidoMaterno, 
      egresado.apellidos
    );
    console.log(`   📌 ${egresado.nombres} ${egresado.apellidos}`);
    console.log(`      📧 ${email}`);
    console.log(`      🔑 ${passInicial}\n`);
  }
  
  console.log("⚠️  IMPORTANTE:");
  console.log("   • Los egresados tienen primerLogin=true");
  console.log("   • Al ingresar serán redirigidos a cambiar su contraseña");
  console.log("   • Para pruebas de recuperación de contraseña, estos correos");
  console.log("     recibirán los enlaces de reseteo (si configuraste nodemailer)");
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n");
}

main()
  .catch(e => { console.error("❌ Error:", e); process.exit(1); })
  .finally(() => pool.end());