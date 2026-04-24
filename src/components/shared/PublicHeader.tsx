"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Menu, X, LogOut } from "lucide-react";

interface PublicHeaderProps {
  isLoggedIn?: boolean;
  correo?: string;
}

export default function PublicHeader({ isLoggedIn, correo }: PublicHeaderProps) {
  const router = useRouter();
  const [scrolled,  setScrolled]  = useState(false);
  const [menuOpen,  setMenuOpen]  = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const logout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/login");
    router.refresh();
  };

  return (
    <header
      className="fixed top-0 left-0 right-0 z-50 transition-all duration-300"
      style={{
        background: "var(--marino)",
        boxShadow: scrolled ? "0 2px 12px rgba(0,0,0,0.25)" : "none",
      }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">

          {/* Logo */}
          <Link href={isLoggedIn ? "/mi-perfil" : "/"} className="flex items-center gap-3">
            <div
              className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0"
              style={{ background: "rgba(255,255,255,0.10)", border: "1px solid rgba(255,255,255,0.15)" }}
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
                className="text-white font-semibold text-sm leading-tight"
                style={{ fontFamily: "'Source Serif 4', serif" }}
              >
                Carrera de Estadística
              </p>
              <p className="text-xs leading-tight" style={{ color: "rgba(255,255,255,0.55)" }}>
                UMSA · Seguimiento de Egresados
              </p>
            </div>
          </Link>

          {/* Acción derecha */}
          <div className="hidden md:flex items-center gap-3">
            {isLoggedIn ? (
              <div className="flex items-center gap-3">
                {correo && (
                  <span className="text-xs" style={{ color: "rgba(255,255,255,0.50)" }}>
                    {correo}
                  </span>
                )}
                <button
                  onClick={logout}
                  className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all"
                  style={{
                    background: "rgba(255,255,255,0.08)",
                    color: "rgba(255,255,255,0.80)",
                    border: "1px solid rgba(255,255,255,0.12)",
                  }}
                  onMouseEnter={e => {
                    (e.currentTarget as HTMLElement).style.background = "rgba(220,38,38,0.15)";
                    (e.currentTarget as HTMLElement).style.color = "#f87171";
                    (e.currentTarget as HTMLElement).style.borderColor = "rgba(220,38,38,0.30)";
                  }}
                  onMouseLeave={e => {
                    (e.currentTarget as HTMLElement).style.background = "rgba(255,255,255,0.08)";
                    (e.currentTarget as HTMLElement).style.color = "rgba(255,255,255,0.80)";
                    (e.currentTarget as HTMLElement).style.borderColor = "rgba(255,255,255,0.12)";
                  }}
                >
                  <LogOut className="w-4 h-4" />
                  Cerrar sesión
                </button>
              </div>
            ) : (
              <Link
                href="/login"
                className="px-4 py-2 rounded-xl text-sm font-semibold transition-all"
                style={{
                  background: "var(--turquesa)",
                  color: "#fff",
                  boxShadow: "0 2px 8px rgba(0,165,168,0.35)",
                }}
                onMouseEnter={e => {
                  (e.target as HTMLElement).style.background = "var(--turquesa-dark)";
                }}
                onMouseLeave={e => {
                  (e.target as HTMLElement).style.background = "var(--turquesa)";
                }}
              >
                Acceso Egresados
              </Link>
            )}
          </div>

          {/* Hamburger mobile */}
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="md:hidden p-2 rounded-lg"
            style={{ color: "rgba(255,255,255,0.8)" }}
          >
            {menuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <div
          className="md:hidden border-t"
          style={{ background: "var(--marino-mid)", borderColor: "rgba(255,255,255,0.08)" }}
        >
          <div className="max-w-7xl mx-auto px-4 py-3 space-y-1">
            <div className="pt-2 pb-1">
              {isLoggedIn ? (
                <button
                  onClick={() => { setMenuOpen(false); logout(); }}
                  className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold"
                  style={{ background: "rgba(220,38,38,0.15)", color: "#f87171", border: "1px solid rgba(220,38,38,0.30)" }}
                >
                  <LogOut className="w-4 h-4" /> Cerrar sesión
                </button>
              ) : (
                <Link
                  href="/login"
                  onClick={() => setMenuOpen(false)}
                  className="block px-4 py-2.5 rounded-xl text-sm font-semibold text-center"
                  style={{ background: "var(--turquesa)", color: "#fff" }}
                >
                  Acceso Egresados
                </Link>
              )}
            </div>
          </div>
        </div>
      )}
    </header>
  );
}