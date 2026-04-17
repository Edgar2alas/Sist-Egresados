"use client";
import Link from "next/link";
import { MapPin, Phone, Mail, Globe, ExternalLink } from "lucide-react";

export default function PublicFooter() {
  return (
    <footer style={{ background: "var(--marino)" }}>

      {/* Franja turquesa superior */}
      <div className="h-0.5 w-full" style={{ background: "var(--turquesa)" }} />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">

          {/* Col 1 — Identidad */}
          <div className="lg:col-span-1">
            <div className="flex items-center gap-3 mb-4">
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
                style={{ background: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.12)" }}
              >
                <span
                  className="text-xl font-bold"
                  style={{ color: "var(--turquesa)", fontFamily: "'Source Serif 4', serif" }}
                >
                  σ
                </span>
              </div>
              <div>
                <p
                  className="text-white font-semibold text-sm"
                  style={{ fontFamily: "'Source Serif 4', serif" }}
                >
                  Carrera de Estadística
                </p>
                <p className="text-xs" style={{ color: "rgba(255,255,255,0.50)" }}>
                  UMSA · Bolivia
                </p>
              </div>
            </div>

            <p className="text-sm leading-relaxed mb-5" style={{ color: "rgba(255,255,255,0.60)" }}>
              Formando estadísticos y científicos de datos para el desarrollo
              de Bolivia desde 1974.
            </p>

            <div className="space-y-2.5">
              {[
                { icon: MapPin, text: "Av. Villazón N° 1995, Monoblock Central, Piso 3 — La Paz, Bolivia" },
                { icon: Phone, text: "(591-2) 2442100" },
                { icon: Mail,  text: "estadistica@umsa.bo" },
              ].map(({ icon: Icon, text }, i) => (
                <div key={i} className="flex gap-2.5 text-sm" style={{ color: "rgba(255,255,255,0.55)" }}>
                  <Icon className="w-4 h-4 shrink-0 mt-0.5" style={{ color: "var(--turquesa)" }} />
                  <span>{text}</span>
                </div>
              ))}
            </div>

            {/* Redes sociales */}
            <div className="flex gap-2 mt-5">
              {[
                { label: "Web",       href: "https://estadistica.umsa.bo", icon: Globe },
                { label: "Facebook",  href: "#", icon: ExternalLink },
                { label: "YouTube",   href: "#", icon: ExternalLink },
                { label: "Instagram", href: "#", icon: ExternalLink },
              ].map(({ href, label, icon: Icon }) => (
                <a
                  key={label}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-9 h-9 flex items-center justify-center rounded-lg transition-all"
                  style={{
                    background: "rgba(255,255,255,0.07)",
                    border: "1px solid rgba(255,255,255,0.10)",
                    color: "rgba(255,255,255,0.55)",
                  }}
                  title={label}
                >
                  <Icon className="w-4 h-4" />
                </a>
              ))}
            </div>
          </div>

          {/* Col 2 — Académico */}
          <div>
            <h4
              className="text-xs font-semibold uppercase tracking-widest mb-4"
              style={{ color: "var(--turquesa)" }}
            >
              Académico
            </h4>
            <ul className="space-y-2.5">
              {[
                "Plan de Estudios",
                "Malla Curricular",
                "Calendario Académico",
                "Docentes",
                "Trámites y Servicios",
              ].map(item => (
                <li key={item}>
                  <a
                    href="#"
                    className="text-sm transition-colors"
                    style={{ color: "rgba(255,255,255,0.60)" }}
                    onMouseEnter={e => (e.target as HTMLElement).style.color = "var(--turquesa)"}
                    onMouseLeave={e => (e.target as HTMLElement).style.color = "rgba(255,255,255,0.60)"}
                  >
                    {item}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Col 3 — Postgrado e IETA */}
          <div>
            <h4
              className="text-xs font-semibold uppercase tracking-widest mb-4"
              style={{ color: "var(--turquesa)" }}
            >
              Postgrado e IETA
            </h4>
            <ul className="space-y-2.5">
              {[
                "Maestría en Análisis de Datos",
                "Diplomados",
                "Cursos de Actualización",
                "IETA — Investigación",
                "Repositorio Institucional",
              ].map(item => (
                <li key={item}>
                  <a
                    href="#"
                    className="text-sm transition-colors"
                    style={{ color: "rgba(255,255,255,0.60)" }}
                    onMouseEnter={e => (e.target as HTMLElement).style.color = "var(--turquesa)"}
                    onMouseLeave={e => (e.target as HTMLElement).style.color = "rgba(255,255,255,0.60)"}
                  >
                    {item}
                  </a>
                </li>
              ))}
            </ul>

            <div className="mt-6">
              <h4
                className="text-xs font-semibold uppercase tracking-widest mb-4"
                style={{ color: "var(--turquesa)" }}
              >
                Accesos Directos
              </h4>
              <ul className="space-y-2.5">
                {[
                  { label: "Moodle — Aula Virtual", href: "#" },
                  { label: "SIA — Sistema Académico", href: "#" },
                  { label: "Webmail UMSA",           href: "#" },
                ].map(({ label, href }) => (
                  <li key={label}>
                    <a
                      href={href}
                      className="text-sm flex items-center gap-1.5 transition-colors"
                      style={{ color: "rgba(255,255,255,0.60)" }}
                      onMouseEnter={e => (e.target as HTMLElement).style.color = "var(--turquesa)"}
                      onMouseLeave={e => (e.target as HTMLElement).style.color = "rgba(255,255,255,0.60)"}
                    >
                      <ExternalLink className="w-3 h-3 shrink-0" />
                      {label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Col 4 — Sistema Egresados CTA */}
          <div>
            <h4
              className="text-xs font-semibold uppercase tracking-widest mb-4"
              style={{ color: "var(--turquesa)" }}
            >
              Sistema de Egresados
            </h4>

            <div
              className="rounded-2xl p-5"
              style={{
                background: "rgba(0,165,168,0.08)",
                border: "1px solid rgba(0,165,168,0.20)",
              }}
            >
              <p className="text-sm font-semibold text-white mb-2">
                ¿Eres egresado?
              </p>
              <p className="text-xs mb-4" style={{ color: "rgba(255,255,255,0.60)" }}>
                Actualiza tu perfil y aparece en nuestro directorio de egresados.
              </p>
              <Link
                href="/login"
                className="block w-full text-center py-2.5 px-4 rounded-xl text-sm font-semibold transition-all"
                style={{
                  background: "var(--turquesa)",
                  color: "#fff",
                  boxShadow: "0 2px 8px rgba(0,165,168,0.30)",
                }}
              >
                Acceder al Sistema
              </Link>
            </div>

            {/* Horario */}
            <div
              className="mt-4 rounded-xl p-4"
              style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)" }}
            >
              <p className="text-xs font-semibold text-white mb-2">Horario de atención</p>
              <p className="text-xs" style={{ color: "rgba(255,255,255,0.55)" }}>
                Lunes a Viernes: 08:00 — 17:00
              </p>
              <p className="text-xs" style={{ color: "rgba(255,255,255,0.55)" }}>
                Sábados: 08:00 — 12:00
              </p>
            </div>
          </div>

        </div>
      </div>

      {/* Línea inferior */}
      <div style={{ borderTop: "1px solid rgba(255,255,255,0.07)" }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <p className="text-xs" style={{ color: "rgba(255,255,255,0.35)" }}>
            © {new Date().getFullYear()} Carrera de Estadística — Universidad Mayor de San Andrés.
            Todos los derechos reservados.
          </p>
          <div className="flex gap-4">
            {["Privacidad", "Términos"].map(label => (
              <a
                key={label}
                href="#"
                className="text-xs transition-colors"
                style={{ color: "rgba(255,255,255,0.35)" }}
                onMouseEnter={e => (e.target as HTMLElement).style.color = "rgba(255,255,255,0.70)"}
                onMouseLeave={e => (e.target as HTMLElement).style.color = "rgba(255,255,255,0.35)"}
              >
                {label}
              </a>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
