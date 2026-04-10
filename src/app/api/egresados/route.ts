import { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { egresado, usuario } from "@/lib/schema";
import { eq, ilike, and, or, sql, desc } from "drizzle-orm";
import { getSession, hashPassword } from "@/lib/auth";
import { egresadoSchema } from "@/lib/validations";
import { ok, err } from "@/lib/utils";

export async function GET(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session || session.rol !== "admin") return err("No autorizado", 403);

    const sp       = new URL(req.url).searchParams;
    const busqueda = sp.get("busqueda") ?? "";
    const plan     = sp.get("plan");
    const anio     = sp.get("anioEgreso");
    const empleo   = sp.get("conEmpleo");
    const genero   = sp.get("genero");
    const page     = Math.max(1, parseInt(sp.get("page") ?? "1"));
    const pageSize = 12;

    const conds: any[] = [];

    if (busqueda) conds.push(or(
      ilike(egresado.nombres,   `%${busqueda}%`),
      ilike(egresado.apellidos, `%${busqueda}%`),
      ilike(egresado.ci,        `%${busqueda}%`),
    ));
    if (plan)   conds.push(ilike(egresado.planEstudiosNombre, `%${plan}%`));
    if (anio)   conds.push(eq(egresado.anioEgreso, parseInt(anio)));
    if (genero) conds.push(sql`${egresado.genero} = ${genero}`);
    if (empleo === "true")
      conds.push(sql`EXISTS(SELECT 1 FROM historial_laboral h WHERE h.id_egresado=${egresado.id} AND h.fecha_fin IS NULL)`);
    if (empleo === "false")
      conds.push(sql`NOT EXISTS(SELECT 1 FROM historial_laboral h WHERE h.id_egresado=${egresado.id} AND h.fecha_fin IS NULL)`);

    const where = conds.length > 0 ? and(...conds) : undefined;

    const [{ total }] = await db
      .select({ total: sql<number>`count(*)::int` })
      .from(egresado)
      .where(where);

    const rows = await db.select({
      id:                 egresado.id,
      nombres:            egresado.nombres,
      apellidos:          egresado.apellidos,
      apellidoPaterno:    egresado.apellidoPaterno,
      apellidoMaterno:    egresado.apellidoMaterno,
      ci:                 egresado.ci,
      celular:            egresado.celular,
      genero:             egresado.genero,
      planEstudiosNombre: egresado.planEstudiosNombre,
      anioEgreso:         egresado.anioEgreso,
      anioTitulacion:     egresado.anioTitulacion,
      fechaTitulacion:    egresado.fechaTitulacion,
      modalidadTitulacion: egresado.modalidadTitulacion,
      tieneEmpleo: sql<boolean>`EXISTS(
        SELECT 1 FROM historial_laboral h
        WHERE h.id_egresado=${egresado.id} AND h.fecha_fin IS NULL
      )`,
    })
    .from(egresado)
    .where(where)
    .orderBy(desc(egresado.fechaRegistro))
    .limit(pageSize)
    .offset((page - 1) * pageSize);

    return Response.json({
      data: rows,
      total,
      page,
      pageSize,
      totalPages: Math.ceil(total / pageSize),
    });
  } catch (e) {
    console.error("[egresados GET]", e);
    return err("Error al obtener egresados", 500);
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session || session.rol !== "admin") return err("No autorizado", 403);

    const parsed = egresadoSchema.safeParse(await req.json());
    if (!parsed.success) return err(parsed.error.errors[0].message);

    const d = parsed.data;

    // Verificar que el correo no esté en uso
    if (d.correoElectronico) {
      const [existe] = await db
        .select({ id: usuario.id })
        .from(usuario)
        .where(eq(usuario.correo, d.correoElectronico))
        .limit(1);
      if (existe) return err("Ya existe un usuario con ese correo electrónico.");
    }

    const resultado = await db.transaction(async (tx) => {
      // 1. Crear egresado
      const apellidosLegacy = [d.apellidoPaterno, d.apellidoMaterno]
        .filter(Boolean).join(" ") || d.apellidos;

      const [nuevoEgresado] = await tx.insert(egresado).values({
        nombres:             d.nombres,
        apellidos:           apellidosLegacy,
        apellidoPaterno:     d.apellidoPaterno ?? null,
        apellidoMaterno:     d.apellidoMaterno ?? null,
        ci:                  d.ci,
        nacionalidad:        d.nacionalidad ?? null,
        genero:              d.genero ?? null,
        correoElectronico:   d.correoElectronico ?? null,
        celular:             d.celular ?? null,
        telefono:            d.celular ?? null,
        direccion:           d.direccion ?? null,
        tituloAcademico:     d.tituloAcademico ?? null,
        fechaNacimiento:     d.fechaNacimiento,
        fechaGraduacion:     d.fechaTitulacion ?? d.fechaNacimiento,
        fechaTitulacion:     d.fechaTitulacion ?? null,
        anioTitulacion:      d.anioTitulacion ?? null,
        modalidadTitulacion: d.modalidadTitulacion ?? null,
        planEstudiosNombre:  d.planEstudiosNombre ?? null,
        anioIngreso:         d.anioIngreso ?? null,
        semestreIngreso:     d.semestreIngreso ?? null,
        anioEgreso:          d.anioEgreso ?? null,
        semestreEgreso:      d.semestreEgreso ?? null,
      }).returning();

      // 2. Auto-crear usuario si tiene correo
      if (d.correoElectronico && nuevoEgresado) {
        const passwordHash = await hashPassword(d.ci);
        await tx.insert(usuario).values({
          correo:      d.correoElectronico,
          passwordHash,
          rol:         "egresado",
          estado:      "activo",
          idEgresado:  nuevoEgresado.id,
          primerLogin: true,
        });
      }

      return nuevoEgresado;
    });

    return ok(resultado, 201);
  } catch (e: any) {
    console.error("[egresados POST]", e);
    if (e.code === "23505") return err("Ya existe un egresado con ese CI");
    return err("Error al crear egresado", 500);
  }
}
