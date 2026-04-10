import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import * as schema from "../src/lib/schema";
import bcrypt from "bcryptjs";
import * as dotenv from "dotenv";

dotenv.config({ path: ".env.local" });

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const db   = drizzle(pool, { schema });

async function main() {
  console.log("\n🌱 Iniciando seed...\n");

  // Egresados de ejemplo
  console.log("👥 Egresados...");
  const [eg1, eg2] = await db.insert(schema.egresado).values([
    {
      nombres:            "Carlos Alberto",
      apellidos:          "Mamani Quispe",
      apellidoPaterno:    "Mamani",
      apellidoMaterno:    "Quispe",
      ci:                 "12345678",
      celular:            "72345678",
      telefono:           "72345678",
      direccion:          "Av. Arce 123, La Paz",
      fechaNacimiento:    "1985-03-15",
      fechaGraduacion:    "2010-11-20",
      fechaTitulacion:    "2010-11-20",
      anioTitulacion:     2010,
      planEstudiosNombre: "2008",
      modalidadTitulacion:"Tesis",
      anioIngreso:        2002,
      semestreIngreso:    1,
      anioEgreso:         2009,
      semestreEgreso:     2,
    },
    {
      nombres:            "María Elena",
      apellidos:          "Flores Condori",
      apellidoPaterno:    "Flores",
      apellidoMaterno:    "Condori",
      ci:                 "87654321",
      celular:            "71234567",
      telefono:           "71234567",
      correoElectronico:  "maria.flores@ejemplo.com",
      direccion:          "Calle Loayza 456, La Paz",
      fechaNacimiento:    "1990-07-22",
      fechaGraduacion:    "2015-06-10",
      fechaTitulacion:    "2015-06-10",
      anioTitulacion:     2015,
      planEstudiosNombre: "2020",
      modalidadTitulacion:"Proyecto de grado",
      anioIngreso:        2008,
      semestreIngreso:    2,
      anioEgreso:         2014,
      semestreEgreso:     1,
    },
  ]).returning().onConflictDoNothing();

  // Historial laboral
  console.log("💼 Historial laboral...");
  if (eg1) await db.insert(schema.historialLaboral).values([
    {
      idEgresado:  eg1.id,
      empresa:     "INE Bolivia",
      cargo:       "Estadístico",
      area:        "Censos",
      ciudad:      "La Paz",
      sector:      "Publico",
      tipoContrato:"Indefinido",
      fechaInicio: "2011-03-01",
      fechaFin:    null,
    },
  ]).onConflictDoNothing();

  if (eg2) await db.insert(schema.historialLaboral).values([
    {
      idEgresado:  eg2.id,
      empresa:     "Banco Central",
      cargo:       "Analista",
      area:        "Estudios",
      ciudad:      "La Paz",
      sector:      "Publico",
      tipoContrato:"Indefinido",
      fechaInicio: "2016-01-15",
      fechaFin:    "2020-12-31",
    },
    {
      idEgresado:  eg2.id,
      empresa:     "UDAPE",
      cargo:       "Investigadora",
      area:        "Macroeconomía",
      ciudad:      "La Paz",
      sector:      "Publico",
      tipoContrato:"Fijo",
      fechaInicio: "2021-03-01",
      fechaFin:    null,
    },
  ]).onConflictDoNothing();

  // Usuarios
  console.log("👤 Usuarios...");
  const adminEmail = process.env.ADMIN_EMAIL    ?? "admin@estadistica.bo";
  const adminPass  = process.env.ADMIN_PASSWORD ?? "Admin1234!";

  await db.insert(schema.usuario).values([
    {
      correo:       adminEmail,
      passwordHash: await bcrypt.hash(adminPass, 12),
      rol:          "admin",
      estado:       "activo",
      primerLogin:  false,  // el admin no necesita cambiar contraseña
    },
  ]).onConflictDoNothing();

  // Usuario egresado vinculado a eg2
  if (eg2) {
    await db.insert(schema.usuario).values([
      {
        correo:       "maria.flores@ejemplo.com",
        passwordHash: await bcrypt.hash(eg2.ci, 12), // contraseña inicial = CI
        rol:          "egresado",
        estado:       "activo",
        idEgresado:   eg2.id,
        primerLogin:  false, // false para poder probar sin flujo de activación
      },
    ]).onConflictDoNothing();
  }

  console.log("\n✅ Seed completo!\n");
  console.log(`   👑 Admin:    ${adminEmail}`);
  console.log(`   🔑 Password: ${adminPass}`);
  if (eg2) {
    console.log(`   👤 Egresado: maria.flores@ejemplo.com`);
    console.log(`   🔑 Password: ${eg2.ci}  (CI del egresado)\n`);
  }
}

main()
  .catch(e => { console.error("❌", e); process.exit(1); })
  .finally(() => pool.end());
