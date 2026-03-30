import { getSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { egresado, historialLaboral, planEstudios, usuario } from "@/lib/schema";
import { sql } from "drizzle-orm";
import { Users, Briefcase, BookOpen, UserCog, GraduationCap, TrendingUp } from "lucide-react";
import AdminLayout from "@/components/shared/AdminLayout";
import Link from "next/link";

async function getStats() {
  const result = await db.execute(sql`
    SELECT
      (SELECT COUNT(*)::int FROM egresado)                                 AS "totalEgresados",
      (SELECT COUNT(*)::int FROM historial_laboral WHERE fecha_fin IS NULL) AS "conEmpleo",
      (SELECT COUNT(*)::int FROM plan_estudios WHERE estado='Activo')      AS "planesActivos",
      (SELECT COUNT(*)::int FROM usuario)                                  AS "totalUsuarios"
  `);

  // Si usas Postgres.js o similar, las filas suelen estar en 'result' o 'result.rows'
  // Generalmente con db.execute() en Drizzle para Postgres:
  const stats = (result as any).rows?.[0] || (result as any)[0]; 
  
  return stats as any;
}

export default async function DashboardPage() {
  const session = await getSession();
  if (!session || session.rol !== "admin") redirect("/login");

  const stats = await getStats();

  const cards = [
    { label:"Total Egresados",   value: stats.totalEgresados ?? 0, icon: GraduationCap, href:"/egresados",  color:"text-primary-400", bg:"bg-primary-500/10 border-primary-500/20" },
    { label:"Con Empleo Actual", value: stats.conEmpleo ?? 0,      icon: Briefcase,     href:"/egresados?conEmpleo=true", color:"text-emerald-400", bg:"bg-emerald-500/10 border-emerald-500/20" },
    { label:"Sin Empleo",        value: stats.totalEgresados - stats.conEmpleo, icon: Users, href:"/egresados?conEmpleo=false", color:"text-amber-400", bg:"bg-amber-500/10 border-amber-500/20" },
    { label:"Planes Activos",    value: stats.planesActivos ?? 0,  icon: BookOpen,      href:"/reportes",   color:"text-blue-400",    bg:"bg-blue-500/10 border-blue-500/20" },
    { label:"Usuarios",          value: stats.totalUsuarios ?? 0,  icon: UserCog,       href:"/usuarios",   color:"text-purple-400",  bg:"bg-purple-500/10 border-purple-500/20" },
    {
      label: "Empleabilidad",
      value: stats.totalEgresados > 0
        ? `${Math.round((stats.conEmpleo / stats.totalEgresados) * 100)}%`
        : "—",
      icon: TrendingUp, href:"/reportes",
      color:"text-cyan-400", bg:"bg-cyan-500/10 border-cyan-500/20"
    },
  ];

  const accesos = [
    { href:"/egresados",       label:"Gestionar Egresados", desc:"CRUD completo, búsqueda y filtros",     icon: Users },
    { href:"/reportes",        label:"Ver Reportes",        desc:"Gráficos, tablas y exportación",         icon: TrendingUp },
    { href:"/usuarios",        label:"Gestionar Usuarios",  desc:"Crear y administrar cuentas",            icon: UserCog },
  ];

  return (
    <AdminLayout correo={session.correo}>
      <div className="page">
        <div>
          <h1 className="page-title">Dashboard</h1>
          <p className="page-sub">Resumen del sistema de seguimiento de egresados</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {cards.map(c => (
            <Link key={c.label} href={c.href}
              className={`stat-card border ${c.bg} hover:scale-[1.01] transition-transform cursor-pointer`}>
              <div className={`stat-icon border ${c.bg} ${c.color}`}>
                <c.icon className="w-5 h-5" />
              </div>
              <div>
                <p className={`stat-val ${c.color}`}>{c.value}</p>
                <p className="stat-label">{c.label}</p>
              </div>
            </Link>
          ))}
        </div>

        {/* Accesos rápidos */}
        <div>
          <h2 className="text-lg font-bold text-white mb-4">Accesos rápidos</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {accesos.map(a => (
              <Link key={a.href} href={a.href}
                className="card-hover flex items-start gap-4 group">
                <div className="w-10 h-10 bg-primary-600/15 border border-primary-600/25 rounded-xl
                                flex items-center justify-center shrink-0 mt-0.5">
                  <a.icon className="w-5 h-5 text-primary-400" />
                </div>
                <div>
                  <p className="text-white font-semibold text-sm group-hover:text-primary-300 transition-colors">
                    {a.label}
                  </p>
                  <p className="text-slate-500 text-xs mt-0.5">{a.desc}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
