"use client";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard, Users, FileBarChart,
  UserCog, LogOut, GraduationCap, ChevronRight,
} from "lucide-react";
import { cn } from "@/lib/utils";

const NAV = [
  { href: "/dashboard",  label: "Dashboard",  icon: LayoutDashboard },
  { href: "/egresados",  label: "Egresados",  icon: Users },
  { href: "/reportes",   label: "Reportes",   icon: FileBarChart },
  { href: "/usuarios",   label: "Usuarios",   icon: UserCog },
];

export default function AdminLayout({
  children,
  correo,
}: {
  children: React.ReactNode;
  correo?: string;
}) {
  const pathname = usePathname();
  const router   = useRouter();

  const logout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/login");
    router.refresh();
  };

  return (
    <div className="flex h-screen overflow-hidden bg-slate-950">
      {/* Sidebar */}
      <aside className="w-60 shrink-0 bg-slate-900 border-r border-slate-800 flex flex-col">
        {/* Logo */}
        <div className="px-5 py-5 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-primary-600/20 border border-primary-500/30 rounded-xl
                            flex items-center justify-center">
              <GraduationCap className="w-5 h-5 text-primary-400" />
            </div>
            <div>
              <p className="text-white font-bold text-sm leading-tight">Egresados</p>
              <p className="text-slate-600 text-xs">Administrador</p>
            </div>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 p-3 space-y-0.5 overflow-y-auto">
          {NAV.map(item => {
            const active = item.href === "/dashboard"
              ? pathname === "/dashboard"
              : pathname.startsWith(item.href);
            return (
              <Link key={item.href} href={item.href}
                className={cn(
                  "flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all group",
                  active
                    ? "bg-primary-600/20 text-primary-300 border border-primary-600/25"
                    : "text-slate-400 hover:text-white hover:bg-slate-800"
                )}>
                <item.icon className={cn("w-4 h-4 shrink-0",
                  active ? "text-primary-400" : "text-slate-500 group-hover:text-slate-400")} />
                <span className="flex-1">{item.label}</span>
                {active && <ChevronRight className="w-3 h-3 text-primary-500" />}
              </Link>
            );
          })}
        </nav>

        {/* Footer */}
        <div className="p-4 border-t border-slate-800 space-y-2">
          {correo && (
            <div className="bg-slate-800/60 rounded-xl px-3 py-2">
              <p className="text-slate-600 text-xs">Sesión como</p>
              <p className="text-slate-300 text-xs font-medium truncate">{correo}</p>
            </div>
          )}
          <button onClick={logout}
            className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-sm
                       text-slate-400 hover:text-red-400 hover:bg-red-500/10 transition-all">
            <LogOut className="w-4 h-4" /> Cerrar sesión
          </button>
        </div>
      </aside>

      {/* Main */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <main className="flex-1 overflow-y-auto p-6 lg:p-8">
          <div className="max-w-7xl mx-auto animate-fade-up">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
