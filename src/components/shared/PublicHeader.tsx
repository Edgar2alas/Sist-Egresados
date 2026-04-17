"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { Menu, X } from "lucide-react";
import { cn } from "@/lib/utils";

export default function PublicHeader() {
  const [scrolled, setScrolled]   = useState(false);
  const [menuOpen, setMenuOpen]   = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={cn(
        "fixed top-0 left-0 right-0 z-50 transition-all duration-300",
        scrolled
          ? "shadow-lg"
          : "shadow-none"
      )}
      style={{ background: "var(--marino)" }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">

          {/* Logo + nombre */}
          <Link href="/" className="flex items-center gap-3 group">
            {/* Escudo institucional simplificado */}
            <div
              className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0 overflow-hidden"
              style={{ background: "rgba(255,255,255,0.10)", border: "1px solid rgba(255,255,255,0.15)" }}
            >
              {/* Ícono de estadística — σ */}
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

          {/* Nav desktop */}
          <nav className="hidden md:flex items-center gap-1">
            {[
              { label: "Inicio",      href: "/" },
              { label: "Directorio",  href: "/directorio" },
              { label: "Acerca de",   href: "/#acerca" },
            ].map(item => (
              <Link
                key={item.href}
                href={item.href}
                className="px-3 py-2 rounded-lg text-sm font-medium transition-all"
                style={{ color: "rgba(255,255,255,0.75)" }}
                onMouseEnter={e => {
                  (e.target as HTMLElement).style.color = "#fff";
                  (e.target as HTMLElement).style.background = "rgba(255,255,255,0.08)";
                }}
                onMouseLeave={e => {
                  (e.target as HTMLElement).style.color = "rgba(255,255,255,0.75)";
                  (e.target as HTMLElement).style.background = "transparent";
                }}
              >
                {item.label}
              </Link>
            ))}
          </nav>

          {/* Acciones */}
          <div className="hidden md:flex items-center gap-3">
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
          </div>

          {/* Hamburger mobile */}
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="md:hidden p-2 rounded-lg transition-colors"
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
            {[
              { label: "Inicio",     href: "/" },
              { label: "Directorio", href: "/directorio" },
              { label: "Acerca de",  href: "/#acerca" },
            ].map(item => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setMenuOpen(false)}
                className="block px-4 py-2.5 rounded-xl text-sm font-medium"
                style={{ color: "rgba(255,255,255,0.8)" }}
              >
                {item.label}
              </Link>
            ))}
            <div className="pt-2 pb-1">
              <Link
                href="/login"
                onClick={() => setMenuOpen(false)}
                className="block px-4 py-2.5 rounded-xl text-sm font-semibold text-center"
                style={{ background: "var(--turquesa)", color: "#fff" }}
              >
                Acceso Egresados
              </Link>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
