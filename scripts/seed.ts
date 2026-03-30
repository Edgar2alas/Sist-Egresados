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

  // Planes de estudio
  console.log("📚 Planes de estudio...");
  const [p1, p2, p3] = await db.insert(schema.planEstudios).values([
    { nombre:"Plan 1994", anioAprobacion:1994, estado:"Inactivo", descripcion:"Plan original de la carrera." },
    { nombre:"Plan 2008", anioAprobacion:2008, estado:"Inactivo", descripcion:"Segunda reforma curricular." },
    { nombre:"Plan 2018", anioAprobacion:2018, estado:"Activo",   descripcion:"Plan vigente." },
  ]).returning().onConflictDoNothing();

  // Egresados de ejemplo
  console.log("👥 Egresados...");
  const [eg1, eg2] = await db.insert(schema.egresado).values([
    {
      nombres:"Carlos Alberto", apellidos:"Mamani Quispe", ci:"12345678",
      telefono:"72345678", direccion:"Av. Arce 123, La Paz",
      fechaNacimiento:"1985-03-15", fechaGraduacion:"2010-11-20",
      idPlan: p1?.id ?? 1,
    },
    {
      nombres:"María Elena", apellidos:"Flores Condori", ci:"87654321",
      telefono:"71234567", direccion:"Calle Loayza 456, La Paz",
      fechaNacimiento:"1990-07-22", fechaGraduacion:"2015-06-10",
      idPlan: p3?.id ?? 3,
    },
  ]).returning().onConflictDoNothing();

  // Historial laboral
  console.log("💼 Historial laboral...");
  if (eg1) await db.insert(schema.historialLaboral).values([
    { idEgresado:eg1.id, empresa:"INE Bolivia", cargo:"Estadístico",
      area:"Censos", fechaInicio:"2011-03-01", fechaFin:null },
  ]).onConflictDoNothing();

  if (eg2) await db.insert(schema.historialLaboral).values([
    { idEgresado:eg2.id, empresa:"Banco Central", cargo:"Analista",
      area:"Estudios", fechaInicio:"2016-01-15", fechaFin:"2020-12-31" },
    { idEgresado:eg2.id, empresa:"UDAPE", cargo:"Investigadora",
      area:"Macroeconomía", fechaInicio:"2021-03-01", fechaFin:null },
  ]).onConflictDoNothing();

  // Usuarios
  console.log("👤 Usuarios...");
  const adminEmail = process.env.ADMIN_EMAIL    ?? "admin@estadistica.bo";
  const adminPass  = process.env.ADMIN_PASSWORD ?? "Admin1234!";

  await db.insert(schema.usuario).values([
    // Admin
    { correo:adminEmail, passwordHash:await bcrypt.hash(adminPass, 12), rol:"admin", estado:"activo" },
    // Egresado vinculado a eg2
    ...(eg2 ? [{
      correo:"maria.flores@ejemplo.com",
      passwordHash: await bcrypt.hash("Egresado1234!", 12),
      rol: "egresado" as const, estado:"activo" as const, idEgresado: eg2.id,
    }] : []),
  ]).onConflictDoNothing();

  console.log("\n✅ Seed completo!\n");
  console.log(`   👑 Admin:    ${adminEmail}`);
  console.log(`   🔑 Password: ${adminPass}`);
  if (eg2) {
    console.log(`   👤 Egresado: maria.flores@ejemplo.com`);
    console.log(`   🔑 Password: Egresado1234!\n`);
  }
}

main()
  .catch(e => { console.error("❌", e); process.exit(1); })
  .finally(() => pool.end());
