"use client";
import { useRouter } from "next/navigation";
import { Calendar, BookOpen, Newspaper, Users } from "lucide-react";
import { fmtDateLong } from "@/lib/utils";

interface Noticia {
  id:        number;
  titulo:    string;
  cuerpo:    string;
  tipo:      string;
  fecha:     string;
  imagenUrl: string | null;
  publicado: boolean;
}

interface Props {
  noticias:   Noticia[];
  tipoFiltro?: string;
}

const TIPO_META: Record<string, { label: string; icon: any; bg: string; color: string; border: string }> = {
  noticia_institucional: {
    label: "Institucional",
    icon: Newspaper,
    bg: "var(--turquesa-light)",
    color: "var(--turquesa-dark)",
    border: "#99e6e7",
  },
  curso_evento: {
    label: "Curso / Evento",
    icon: BookOpen,
    bg: "rgba(139,92,246,0.10)",
    color: "#7c3aed",
    border: "rgba(139,92,246,0.30)",
  },
  noticia_social: {
    label: "Social",
    icon: Users,
    bg: "var(--naranja-light)",
    color: "var(--naranja)",
    border: "#fed7aa",
  },
};

function NoticiaCard({ noticia }: { noticia: Noticia }) {
  const meta = TIPO_META[noticia.tipo] ?? TIPO_META.noticia_institucional;
  const Icon = meta.icon;

  // Extracto del cuerpo
  const extracto = noticia.cuerpo.length > 200
    ? noticia.cuerpo.slice(0, 200) + "…"
    : noticia.cuerpo;

  return (
    <article
      className="rounded-2xl overflow-hidden flex flex-col transition-all duration-200 hover:-translate-y-0.5"
      style={{
        background: "var(--blanco)",
        border: "1px solid var(--borde)",
        boxShadow: "var(--shadow-sm)",
      }}
      onMouseEnter={e => {
        (e.currentTarget as HTMLElement).style.borderColor = meta.color;
        (e.currentTarget as HTMLElement).style.boxShadow = `0 4px 20px ${meta.border}40`;
      }}
      onMouseLeave={e => {
        (e.currentTarget as HTMLElement).style.borderColor = "var(--borde)";
        (e.currentTarget as HTMLElement).style.boxShadow = "var(--shadow-sm)";
      }}
    >
      {/* Imagen o franja de color */}
      {noticia.imagenUrl ? (
        <div className="h-48 overflow-hidden">
          <img
            src={noticia.imagenUrl}
            alt={noticia.titulo}
            className="w-full h-full object-cover"
            onError={e => { (e.target as HTMLImageElement).style.display = "none"; }}
          />
        </div>
      ) : (
        <div
          className="h-3 w-full"
          style={{ background: meta.color, opacity: 0.7 }}
        />
      )}

      <div className="flex flex-col flex-1 p-5">
        {/* Badge tipo + fecha */}
        <div className="flex items-center justify-between gap-2 mb-3">
          <span
            className="inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full"
            style={{ background: meta.bg, color: meta.color, border: `1px solid ${meta.border}` }}
          >
            <Icon className="w-3 h-3" />
            {meta.label}
          </span>
          <span
            className="flex items-center gap-1 text-xs"
            style={{ color: "var(--placeholder)" }}
          >
            <Calendar className="w-3 h-3" />
            {fmtDateLong(noticia.fecha)}
          </span>
        </div>

        {/* Título */}
        <h2
          className="font-bold text-base mb-2 leading-snug"
          style={{ color: "var(--azul-pizarra)", fontFamily: "'Source Serif 4', serif" }}
        >
          {noticia.titulo}
        </h2>

        {/* Extracto */}
        <p
          className="text-sm leading-relaxed flex-1"
          style={{ color: "var(--gris-grafito)", whiteSpace: "pre-line" }}
        >
          {extracto}
        </p>

        {noticia.cuerpo.length > 200 && (
          <p className="text-xs mt-3 font-semibold" style={{ color: meta.color }}>
            Leer más →
          </p>
        )}
      </div>
    </article>
  );
}

export default function NoticiasClient({ noticias, tipoFiltro }: Props) {
  const router = useRouter();

  const buildUrl = (tipo?: string) => {
    if (!tipo) return "/noticias";
    return `/noticias?tipo=${tipo}`;
  };

  return (
    <>
      {/* Hero */}
      <section
        className="py-16 text-center"
        style={{ background: `linear-gradient(135deg, var(--marino) 0%, #1a3555 100%)` }}
      >
        <div className="max-w-3xl mx-auto px-4">
          <span
            className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold mb-5"
            style={{
              background: "rgba(0,165,168,0.15)",
              color: "var(--turquesa)",
              border: "1px solid rgba(0,165,168,0.25)",
            }}
          >
            <span className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ background: "var(--turquesa)" }} />
            Noticias y Eventos
          </span>
          <h1
            className="text-4xl font-bold text-white mb-4"
            style={{ fontFamily: "'Source Serif 4', serif", letterSpacing: "-0.02em" }}
          >
            Novedades de la Carrera
          </h1>
          <p className="text-lg" style={{ color: "rgba(255,255,255,0.65)" }}>
            Entérate de las últimas noticias, cursos y eventos de la Carrera de Estadística UMSA
          </p>
        </div>
      </section>

      {/* Filtros */}
      <section style={{ background: "var(--blanco)", borderBottom: "1px solid var(--borde)" }}>
        <div className="max-w-7xl mx-auto px-4 py-3 flex flex-wrap gap-2 items-center">
          <span className="text-xs font-semibold uppercase tracking-wide mr-1" style={{ color: "var(--placeholder)" }}>
            Filtrar:
          </span>
          <button
            onClick={() => router.push(buildUrl())}
            className="text-xs px-3 py-1.5 rounded-full font-medium transition-all"
            style={!tipoFiltro ? {
              background: "var(--turquesa)",
              color: "white",
              border: "none",
            } : {
              background: "var(--humo)",
              color: "var(--gris-grafito)",
              border: "1px solid var(--borde)",
            }}
          >
            Todos ({noticias.length})
          </button>
          {Object.entries(TIPO_META).map(([key, meta]) => {
            const count = noticias.filter(n => n.tipo === key).length;
            const active = tipoFiltro === key;
            return (
              <button
                key={key}
                onClick={() => router.push(buildUrl(key))}
                className="text-xs px-3 py-1.5 rounded-full font-medium transition-all"
                style={active ? {
                  background: meta.color,
                  color: "white",
                  border: "none",
                } : {
                  background: "var(--humo)",
                  color: "var(--gris-grafito)",
                  border: "1px solid var(--borde)",
                }}
              >
                {meta.label} ({count})
              </button>
            );
          })}
        </div>
      </section>

      {/* Grid de noticias */}
      <section style={{ background: "var(--humo)" }} className="py-10">
        <div className="max-w-7xl mx-auto px-4">
          {noticias.length === 0 ? (
            <div className="text-center py-20">
              <p className="text-4xl mb-4">📰</p>
              <p className="font-semibold text-lg" style={{ color: "var(--azul-pizarra)", fontFamily: "'Source Serif 4', serif" }}>
                Sin publicaciones disponibles
              </p>
              <p className="text-sm mt-2" style={{ color: "var(--placeholder)" }}>
                {tipoFiltro ? "No hay publicaciones de este tipo aún." : "Pronto habrá novedades."}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {noticias.map(n => (
                <NoticiaCard key={n.id} noticia={n} />
              ))}
            </div>
          )}
        </div>
      </section>
    </>
  );
}