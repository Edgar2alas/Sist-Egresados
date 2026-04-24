"use client";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard, Users, FileBarChart,
  UserCog, LogOut, GraduationCap, ChevronRight,
  ShieldCheck, MessageSquare,
} from "lucide-react";
import { cn } from "@/lib/utils";

const NAV = [
  { href: "/dashboard",      label: "Dashboard",      icon: LayoutDashboard },
  { href: "/egresados",      label: "Egresados",      icon: Users },
  { href: "/reportes",       label: "Reportes",       icon: FileBarChart },
  { href: "/usuarios",       label: "Usuarios",       icon: UserCog },
  { href: "/verificaciones", label: "Verificaciones", icon: ShieldCheck },
  { href: "/sugerencias",    label: "Sugerencias",    icon: MessageSquare },
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
    <div className="flex h-screen overflow-hidden" style={{ background: "var(--humo)" }}>

      {/* ── Sidebar ──────────────────────────────────────────────────────── */}
      <aside
        className="w-60 shrink-0 flex flex-col"
        style={{
          background: "var(--marino)",
          borderRight: "none",
        }}
      >
        {/* Logo */}
        <div
          className="px-5 py-5 flex items-center gap-3"
          style={{ borderBottom: "1px solid rgba(255,255,255,0.07)" }}
        >
          <div
            className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0"
            style={{
              background: "rgba(0,165,168,0.15)",
              border: "1px solid rgba(0,165,168,0.30)",
            }}
          >
            <span
              className="text-lg font-bold"
              style={{ color: "var(--turquesa)", fontFamily: "'Source Serif 4', serif" }}
            >
              σ
            </span>
          </div>
          <div>
            <p
              className="font-bold text-sm leading-tight"
              style={{ color: "white", fontFamily: "'Source Serif 4', serif" }}
            >
              Estadística
            </p>
            <p className="text-xs leading-tight" style={{ color: "rgba(255,255,255,0.45)" }}>
              Panel de Administración
            </p>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 p-3 space-y-0.5 overflow-y-auto">
          {NAV.map(item => {
            const active = item.href === "/dashboard"
              ? pathname === "/dashboard"
              : pathname.startsWith(item.href);

            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all group",
                )}
                style={active ? {
                  background: "rgba(0,165,168,0.15)",
                  color: "var(--turquesa)",
                  border: "1px solid rgba(0,165,168,0.25)",
                } : {
                  color: "rgba(255,255,255,0.60)",
                  border: "1px solid transparent",
                }}
                onMouseEnter={e => {
                  if (!active) {
                    (e.currentTarget as HTMLElement).style.background = "rgba(255,255,255,0.05)";
                    (e.currentTarget as HTMLElement).style.color = "rgba(255,255,255,0.90)";
                  }
                }}
                onMouseLeave={e => {
                  if (!active) {
                    (e.currentTarget as HTMLElement).style.background = "transparent";
                    (e.currentTarget as HTMLElement).style.color = "rgba(255,255,255,0.60)";
                  }
                }}
              >
                <item.icon
                  className="w-4 h-4 shrink-0"
                  style={{ color: active ? "var(--turquesa)" : undefined }}
                />
                <span className="flex-1">{item.label}</span>
                {active && (
                  <ChevronRight className="w-3 h-3" style={{ color: "var(--turquesa)" }} />
                )}
              </Link>
            );
          })}
        </nav>

        {/* Footer sidebar */}
        <div
          className="p-4 space-y-2"
          style={{ borderTop: "1px solid rgba(255,255,255,0.07)" }}
        >
          {correo && (
            <div
              className="rounded-xl px-3 py-2"
              style={{ background: "rgba(255,255,255,0.05)" }}
            >
              <p className="text-xs" style={{ color: "rgba(255,255,255,0.40)" }}>Sesión como</p>
              <p className="text-xs font-medium truncate" style={{ color: "rgba(255,255,255,0.75)" }}>
                {correo}
              </p>
            </div>
          )}
          <button
            onClick={logout}
            className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-sm transition-all"
            style={{ color: "rgba(255,255,255,0.50)" }}
            onMouseEnter={e => {
              (e.currentTarget as HTMLElement).style.background = "rgba(220,38,38,0.10)";
              (e.currentTarget as HTMLElement).style.color = "#f87171";
            }}
            onMouseLeave={e => {
              (e.currentTarget as HTMLElement).style.background = "transparent";
              (e.currentTarget as HTMLElement).style.color = "rgba(255,255,255,0.50)";
            }}
          >
            <LogOut className="w-4 h-4" /> Cerrar sesión
          </button>
        </div>
      </aside>

      {/* ── Main content ─────────────────────────────────────────────────── */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top bar */}
        <div
          className="h-14 flex items-center justify-between px-6 shrink-0"
          style={{
            background: "var(--blanco)",
            borderBottom: "1px solid var(--borde)",
            boxShadow: "var(--shadow-sm)",
          }}
        >
          <div />
          <div
            className="text-xs px-3 py-1.5 rounded-full font-medium"
            style={{
              background: "var(--turquesa-pale)",
              color: "var(--turquesa-dark)",
              border: "1px solid rgba(0,165,168,0.20)",
            }}
          >
            ● Sistema en línea
          </div>
        </div>

        <main className="flex-1 overflow-y-auto p-6 lg:p-8">
          <div className="max-w-7xl mx-auto animate-fade-up">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
