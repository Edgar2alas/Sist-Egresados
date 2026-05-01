"use client";
import { useState, useEffect, useCallback } from "react";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Cell, PieChart, Pie, Legend,
} from "recharts";
import {
  GraduationCap, Users, TrendingUp, Clock, Briefcase,
  Filter, RefreshCw, Download,
} from "lucide-react";
import { cn } from "@/lib/utils";

const COLORS = ["#00A5A8","#10b981","#f59e0b","#8b5cf6","#ef4444","#06b6d4","#f97316","#84cc16"];
const TT = {
  contentStyle: {
    backgroundColor: "#1e293b",
    border: "1px solid #334155",
    borderRadius: "10px",
    color: "#e2e8f0",
    fontSize: "12px",
  },
};

// ── KPI Card ──────────────────────────────────────────────────────────────────
function KpiCard({
  label, value, sub, icon: Icon, color, bg,
}: {
  label: string; value: string | number; sub?: string;
  icon: any; color: string; bg: string;
}) {
  return (
    <div
      className="rounded-2xl p-5 flex items-start gap-4"
      style={{ background: "var(--blanco)", border: "1px solid var(--borde)", boxShadow: "var(--shadow-sm)" }}
    >
      <div className={`p-3 rounded-xl shrink-0 border ${bg}`}>
        <Icon className={`w-5 h-5 ${color}`} />
      </div>
      <div className="min-w-0">
        <p
          className="text-2xl font-bold leading-tight"
          style={{ color: "var(--azul-pizarra)", fontFamily: "'Source Serif 4', serif" }}
        >
          {value}
        </p>
        <p className="text-xs font-medium uppercase tracking-wide mt-0.5" style={{ color: "var(--gris-grafito)" }}>
          {label}
        </p>
        {sub && <p className="text-xs mt-1" style={{ color: "var(--placeholder)" }}>{sub}</p>}
      </div>
    </div>
  );
}

// ── Tooltip personalizado ─────────────────────────────────────────────────────
function CustomTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;
  return (
    <div style={{
      background: "#1e293b", border: "1px solid #334155",
      borderRadius: "10px", padding: "10px 14px", fontSize: "12px", color: "#e2e8f0",
    }}>
      <p className="font-semibold mb-1">{label}</p>
      {payload.map((p: any) => (
        <p key={p.name} style={{ color: p.color }}>
          {p.name}: <strong>{p.value}</strong>
        </p>
      ))}
    </div>
  );
}

// ── Tabla geográfica ──────────────────────────────────────────────────────────
function TablaGeo({ data, titulo }: { data: any[]; titulo: string }) {
  const max = Math.max(...data.map(r => r.cantidad), 1);
  return (
    <div>
      <h4 className="text-sm font-semibold mb-3" style={{ color: "var(--azul-pizarra)" }}>{titulo}</h4>
      <div className="space-y-2">
        {data.slice(0, 10).map((r, i) => (
          <div key={i} className="flex items-center gap-3">
            <span className="text-xs w-5 text-right shrink-0" style={{ color: "var(--placeholder)" }}>
              {i + 1}
            </span>
            <span className="text-xs flex-1 truncate" style={{ color: "var(--azul-pizarra)" }}>
              {r.ciudad ?? r.region ?? "—"}
            </span>
            <div className="flex items-center gap-2 shrink-0">
              <div
                className="h-1.5 rounded-full"
                style={{
                  width: `${Math.round((r.cantidad / max) * 80)}px`,
                  minWidth: "4px",
                  background: "var(--turquesa)",
                  opacity: 0.7,
                }}
              />
              <span className="text-xs font-semibold w-6 text-right" style={{ color: "var(--gris-grafito)" }}>
                {r.cantidad}
              </span>
            </div>
          </div>
        ))}
        {data.length === 0 && (
          <p className="text-xs text-center py-4" style={{ color: "var(--placeholder)" }}>Sin datos</p>
        )}
      </div>
    </div>
  );
}

// ── Tabla cohorte ─────────────────────────────────────────────────────────────
function TablaCohorte({ data }: { data: any[] }) {
  return (
    <div className="overflow-x-auto">
      <table style={{ width: "100%", fontSize: "0.8rem", borderCollapse: "collapse" }}>
        <thead>
          <tr style={{ borderBottom: "1.5px solid var(--borde)" }}>
            {["Cohorte", "Total", "Titulados", "Egresados", "Con empleo", "% Titulados"].map(h => (
              <th key={h} style={{
                padding: "8px 10px", textAlign: "left",
                color: "var(--gris-grafito)", fontWeight: 600,
                fontSize: "0.7rem", textTransform: "uppercase", letterSpacing: "0.05em",
              }}>
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.map((r, i) => (
            <tr key={i} style={{ borderTop: "1px solid var(--borde-suave)" }}>
              <td style={{ padding: "8px 10px", fontWeight: 600, color: "var(--azul-pizarra)" }}>
                {r.cohorte}
              </td>
              <td style={{ padding: "8px 10px", color: "var(--gris-grafito)" }}>{r.total}</td>
              <td style={{ padding: "8px 10px" }}>
                <span style={{
                  background: "var(--turquesa-light)", color: "var(--turquesa-dark)",
                  padding: "1px 8px", borderRadius: "9999px", fontSize: "0.72rem", fontWeight: 600,
                }}>
                  {r.titulados}
                </span>
              </td>
              <td style={{ padding: "8px 10px" }}>
                <span style={{
                  background: "var(--naranja-light)", color: "var(--naranja)",
                  padding: "1px 8px", borderRadius: "9999px", fontSize: "0.72rem", fontWeight: 600,
                }}>
                  {r.egresados}
                </span>
              </td>
              <td style={{ padding: "8px 10px", color: "var(--verde)" }}>{r.tituladosConEmpleo}</td>
              <td style={{ padding: "8px 10px" }}>
                <div className="flex items-center gap-2">
                  <div style={{
                    height: "6px", borderRadius: "3px", background: "var(--borde)",
                    flex: 1, overflow: "hidden",
                  }}>
                    <div style={{
                      height: "100%", background: "var(--turquesa)",
                      width: `${Math.min(r.pctTitulados ?? 0, 100)}%`,
                    }} />
                  </div>
                  <span style={{ color: "var(--azul-pizarra)", fontWeight: 600, fontSize: "0.72rem", width: "36px" }}>
                    {(r.pctTitulados ?? 0).toFixed(1)}%
                  </span>
                </div>
              </td>
            </tr>
          ))}
          {data.length === 0 && (
            <tr>
              <td colSpan={6} style={{ padding: "24px", textAlign: "center", color: "var(--placeholder)" }}>
                Sin datos de cohortes
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}

// ── Componente principal ──────────────────────────────────────────────────────
export default function DashboardClient() {
  const [data,    setData]    = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState<string | null>(null);

  // Filtros
  const [anioDesde,  setAnioDesde]  = useState("");
  const [anioHasta,  setAnioHasta]  = useState("");
  const [sector,     setSector]     = useState("");
  const [modalidad,  setModalidad]  = useState("");
  const [tipo,       setTipo]       = useState("");

  const years = Array.from({ length: new Date().getFullYear() - 1997 }, (_, i) => 1998 + i).reverse();

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const p = new URLSearchParams();
      if (anioDesde) p.set("anioTitulacionDesde", anioDesde);
      if (anioHasta) p.set("anioTitulacionHasta", anioHasta);
      if (sector)    p.set("sector",    sector);
      if (modalidad) p.set("modalidad", modalidad);
      if (tipo)      p.set("tipo",      tipo);

      const res  = await fetch(`/api/dashboard?${p}`);
      const json = await res.json();
      if (!res.ok) { setError(json.error); return; }
      setData(json.data);
    } catch { setError("Error al cargar datos"); }
    finally { setLoading(false); }
  }, [anioDesde, anioHasta, sector, modalidad, tipo]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const resetFiltros = () => {
    setAnioDesde(""); setAnioHasta(""); setSector(""); setModalidad(""); setTipo("");
  };

  const fieldCss: React.CSSProperties = {
    background: "var(--humo)",
    border: "1.5px solid var(--borde)",
    borderRadius: "0.625rem",
    padding: "0.375rem 0.75rem",
    fontSize: "0.8rem",
    color: "var(--azul-pizarra)",
    outline: "none",
  };

  const kpis = data?.kpis ?? {};
  const g    = data?.graficos ?? {};

  return (
    <div className="space-y-6">


      {/* ── Loading / Error ── */}
      {loading && (
        <div className="flex items-center justify-center py-20">
          <div className="flex flex-col items-center gap-3">
            <RefreshCw className="w-8 h-8 animate-spin" style={{ color: "var(--turquesa)" }} />
            <p className="text-sm" style={{ color: "var(--gris-grafito)" }}>Cargando estadísticas…</p>
          </div>
        </div>
      )}

      {error && (
        <div className="rounded-xl px-4 py-3 text-sm" style={{ background: "#FEF2F2", border: "1px solid #FECACA", color: "#dc2626" }}>
          {error}
        </div>
      )}

      {!loading && data && (
  <>
        {/* ── KPIs siempre sin filtro ── */}
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
          <KpiCard
            label="Total Titulados registrados"
            value={kpis.totalTitulados ?? 0}
            sub="Incluye fallecidos"
            icon={GraduationCap}
            color="text-primary-500"
            bg="bg-primary-500/10 border-primary-500/20"
          />
          <KpiCard
            label="Total Egresados sin título"
            value={kpis.totalEgresados ?? 0}
            sub="Incluye fallecidos"
            icon={Users}
            color="text-amber-500"
            bg="bg-amber-500/10 border-amber-500/20"
          />
          <KpiCard
            label="Tasa de empleabilidad titulados"
            value={`${kpis.tasaEmpleabilidadTitulados ?? 0}%`}
            sub={`${kpis.tituladosConEmpleo ?? 0} de ${kpis.tituladosActivos ?? 0} titulados activos`}
            icon={TrendingUp}
            color="text-emerald-500"
            bg="bg-emerald-500/10 border-emerald-500/20"
          />
          <KpiCard
            label="Tiempo promedio egreso → titulación"
            value={kpis.tiempoPromedioTitulacion ? `${kpis.tiempoPromedioTitulacion} m` : "—"}
            sub="Promedio en meses"
            icon={Clock}
            color="text-blue-500"
            bg="bg-blue-500/10 border-blue-500/20"
          />
          <KpiCard
            label="Tiempo promedio inserción laboral"
            value={kpis.tiempoPromedioInsercion ? `${kpis.tiempoPromedioInsercion} m` : "—"}
            sub="Egreso → primer empleo (meses)"
            icon={Briefcase}
            color="text-purple-500"
            bg="bg-purple-500/10 border-purple-500/20"
          />
          <KpiCard
            label="% Titulados con empleo activo"
            value={`${kpis.tasaEmpleabilidadTitulados ?? 0}%`}
            sub={`${kpis.tituladosConEmpleo ?? 0} empleados de ${kpis.tituladosActivos ?? 0} titulados`}
            icon={Briefcase}
            color="text-cyan-500"
            bg="bg-cyan-500/10 border-cyan-500/20"
          />
        </div>

        {/* ── Separador con etiqueta ── */}
        <div className="flex items-center gap-3">
          <div style={{ flex: 1, height: "1px", background: "var(--borde)" }} />
          <span
            className="text-xs font-semibold uppercase tracking-widest px-3 py-1 rounded-full"
            style={{ background: "var(--turquesa-pale)", color: "var(--turquesa-dark)", border: "1px solid rgba(0,165,168,0.20)" }}
          >
            Gráficos y análisis — aplica filtros
          </span>
          <div style={{ flex: 1, height: "1px", background: "var(--borde)" }} />
        </div>

        {/* ── Panel de filtros (afectan solo los gráficos) ── */}
        <div
          className="rounded-2xl p-5"
          style={{ background: "var(--blanco)", border: "1px solid var(--borde)", boxShadow: "var(--shadow-sm)" }}
        >
          <div className="flex items-center gap-2 mb-4">
            <Filter className="w-4 h-4" style={{ color: "var(--turquesa)" }} />
            <p className="text-sm font-semibold" style={{ color: "var(--azul-pizarra)" }}>
              Filtros — afectan los gráficos y tablas de abajo
            </p>
          </div>
          <div className="flex flex-wrap gap-3 items-end">
      <div>
        <label style={{ display:"block", fontSize:"0.68rem", fontWeight:600, textTransform:"uppercase", letterSpacing:"0.05em", color:"var(--gris-grafito)", marginBottom:"4px" }}>
          Año titulación desde
        </label>
        <select value={anioDesde} onChange={e => setAnioDesde(e.target.value)} style={fieldCss}>
          <option value="">Todos</option>
          {years.map(y => <option key={y} value={y}>{y}</option>)}
        </select>
        <p style={{ fontSize:"0.6rem", color:"var(--placeholder)", marginTop:"2px" }}>
          → Graduados, Modalidad, Cohorte
        </p>
      </div>
      <div>
        <label style={{ display:"block", fontSize:"0.68rem", fontWeight:600, textTransform:"uppercase", letterSpacing:"0.05em", color:"var(--gris-grafito)", marginBottom:"4px" }}>
          Hasta
        </label>
        <select value={anioHasta} onChange={e => setAnioHasta(e.target.value)} style={fieldCss}>
          <option value="">Todos</option>
          {years.map(y => <option key={y} value={y}>{y}</option>)}
        </select>
        <p style={{ fontSize:"0.6rem", color:"var(--placeholder)", marginTop:"2px" }}>
          → Graduados, Modalidad, Cohorte
        </p>
      </div>
      <div>
        <label style={{ display:"block", fontSize:"0.68rem", fontWeight:600, textTransform:"uppercase", letterSpacing:"0.05em", color:"var(--gris-grafito)", marginBottom:"4px" }}>
          Tipo
        </label>
        <select value={tipo} onChange={e => setTipo(e.target.value)} style={fieldCss}>
          <option value="">Todos</option>
          <option value="Titulado">Titulado</option>
          <option value="Egresado">Egresado</option>
        </select>
        <p style={{ fontSize:"0.6rem", color:"var(--placeholder)", marginTop:"2px" }}>
          → Todos los gráficos
        </p>
      </div>
      <div>
        <label style={{ display:"block", fontSize:"0.68rem", fontWeight:600, textTransform:"uppercase", letterSpacing:"0.05em", color:"var(--gris-grafito)", marginBottom:"4px" }}>
          Sector laboral
        </label>
        <select value={sector} onChange={e => setSector(e.target.value)} style={fieldCss}>
          <option value="">Todos</option>
          <option value="Publico">Público</option>
          <option value="Privado">Privado</option>
          <option value="Independiente">Independiente</option>
          <option value="ONG">ONG</option>
        </select>
        <p style={{ fontSize:"0.6rem", color:"var(--placeholder)", marginTop:"2px" }}>
          → Geografía (ciudad trabajo)
        </p>
      </div>
      <div>
        <label style={{ display:"block", fontSize:"0.68rem", fontWeight:600, textTransform:"uppercase", letterSpacing:"0.05em", color:"var(--gris-grafito)", marginBottom:"4px" }}>
          Modalidad titulación
        </label>
        <select value={modalidad} onChange={e => setModalidad(e.target.value)} style={fieldCss}>
          <option value="">Todas</option>
          <option value="Tesis">Tesis</option>
          <option value="Proyecto de grado">Proyecto de grado</option>
          <option value="Trabajo dirigido">Trabajo dirigido</option>
          <option value="Excelencia">Excelencia</option>
        </select>
        <p style={{ fontSize:"0.6rem", color:"var(--placeholder)", marginTop:"2px" }}>
          → Graduados por año
        </p>
      </div>
      <button
        onClick={fetchData}
        disabled={loading}
        className="btn-primary btn-sm flex items-center gap-2"
      >
        <RefreshCw className={cn("w-3.5 h-3.5", loading && "animate-spin")} />
        Aplicar filtros
      </button>
      {(anioDesde || anioHasta || sector || modalidad || tipo) && (
        <button onClick={resetFiltros} className="btn-ghost btn-sm text-xs">
          Limpiar filtros
        </button>
      )}
    </div>
    </div>

    {/* ── Gráficos fila 1 ── */}
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <div
        className="rounded-2xl p-5"
        style={{ background: "var(--blanco)", border: "1px solid var(--borde)", boxShadow: "var(--shadow-sm)" }}
      >
        <h3 className="font-bold mb-1" style={{ color: "var(--azul-pizarra)", fontFamily: "'Source Serif 4', serif" }}>
          Graduados por año
        </h3>
        <p className="text-xs mb-4" style={{ color: "var(--placeholder)" }}>
          Titulados y egresados por año de titulación
        </p>
        {g.tituladosPorAnio?.length > 0 ? (
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={g.tituladosPorAnio} barSize={18}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--borde)" />
              <XAxis dataKey="anio" tick={{ fill: "var(--gris-grafito)", fontSize: 11 }} axisLine={false} />
              <YAxis tick={{ fill: "var(--gris-grafito)", fontSize: 11 }} axisLine={false} tickLine={false} allowDecimals={false} />
              <Tooltip content={<CustomTooltip />} />
              <Legend wrapperStyle={{ fontSize: "11px", color: "var(--gris-grafito)" }} />
              <Bar dataKey="titulados" name="Titulados" fill="#00A5A8" radius={[3,3,0,0]} />
              <Bar dataKey="egresados" name="Egresados" fill="#f59e0b" radius={[3,3,0,0]} />
            </BarChart>
          </ResponsiveContainer>
        ) : (
          <div className="flex items-center justify-center h-[220px]">
            <p className="text-sm" style={{ color: "var(--placeholder)" }}>Sin datos para los filtros seleccionados</p>
          </div>
        )}
      </div>

      <div
        className="rounded-2xl p-5"
        style={{ background: "var(--blanco)", border: "1px solid var(--borde)", boxShadow: "var(--shadow-sm)" }}
      >
        <h3 className="font-bold mb-1" style={{ color: "var(--azul-pizarra)", fontFamily: "'Source Serif 4', serif" }}>
          Sector laboral
        </h3>
        <p className="text-xs mb-4" style={{ color: "var(--placeholder)" }}>
          Distribución de empleos actuales por sector
        </p>
        {g.porSector?.length > 0 ? (
          <ResponsiveContainer width="100%" height={220}>
            <PieChart>
              <Pie
                data={g.porSector}
                dataKey="cantidad"
                nameKey="sector"
                cx="50%" cy="50%"
                outerRadius={85}
                label={({ sector: s, percent }) => `${s} ${(percent * 100).toFixed(0)}%`}
                labelLine={false}
              >
                {g.porSector.map((_: any, i: number) => (
                  <Cell key={i} fill={COLORS[i % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip {...TT} />
            </PieChart>
          </ResponsiveContainer>
        ) : (
          <div className="flex items-center justify-center h-[220px]">
            <p className="text-sm" style={{ color: "var(--placeholder)" }}>Sin datos de empleo</p>
          </div>
        )}
      </div>
    </div>

    {/* ── Gráficos fila 2 ── */}
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <div
        className="rounded-2xl p-5"
        style={{ background: "var(--blanco)", border: "1px solid var(--borde)", boxShadow: "var(--shadow-sm)" }}
      >
        <h3 className="font-bold mb-1" style={{ color: "var(--azul-pizarra)", fontFamily: "'Source Serif 4', serif" }}>
          Modalidad de titulación
        </h3>
        <p className="text-xs mb-4" style={{ color: "var(--placeholder)" }}>
          Cantidad de egresados por cada modalidad
        </p>
        {g.porModalidad?.length > 0 ? (
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={g.porModalidad} layout="vertical" barSize={22}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--borde)" horizontal={false} />
              <XAxis type="number" tick={{ fill: "var(--gris-grafito)", fontSize: 11 }} axisLine={false} allowDecimals={false} />
              <YAxis type="category" dataKey="modalidad" tick={{ fill: "var(--gris-grafito)", fontSize: 10 }} axisLine={false} tickLine={false} width={110} />
              <Tooltip {...TT} />
              <Bar dataKey="cantidad" name="Egresados" radius={[0,4,4,0]}>
                {g.porModalidad.map((_: any, i: number) => (
                  <Cell key={i} fill={COLORS[i % COLORS.length]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        ) : (
          <div className="flex items-center justify-center h-[220px]">
            <p className="text-sm" style={{ color: "var(--placeholder)" }}>Sin datos de modalidad</p>
          </div>
        )}
      </div>

      <div
        className="rounded-2xl p-5"
        style={{ background: "var(--blanco)", border: "1px solid var(--borde)", boxShadow: "var(--shadow-sm)" }}
      >
        <h3 className="font-bold mb-1" style={{ color: "var(--azul-pizarra)", fontFamily: "'Source Serif 4', serif" }}>
          Distribución geográfica
        </h3>
        <p className="text-xs mb-4" style={{ color: "var(--placeholder)" }}>
          Ciudades de trabajo y departamentos de residencia
        </p>
        <div className="grid grid-cols-2 gap-6">
          <TablaGeo data={g.geoCiudad ?? []} titulo="Ciudad de trabajo" />
          <TablaGeo
            data={(g.geoRegion ?? []).map((r: any) => ({ ...r, ciudad: r.region }))}
            titulo="Departamento residencia"
          />
        </div>
      </div>
    </div>

    {/* ── Tabla cohorte ── */}
    <div
      className="rounded-2xl p-5"
      style={{ background: "var(--blanco)", border: "1px solid var(--borde)", boxShadow: "var(--shadow-sm)" }}
    >
      <h3 className="font-bold mb-1" style={{ color: "var(--azul-pizarra)", fontFamily: "'Source Serif 4', serif" }}>
        Comparativo por cohorte de ingreso
      </h3>
      <p className="text-xs mb-4" style={{ color: "var(--placeholder)" }}>
        Titulados vs Egresados por año de ingreso — últimas 20 cohortes
      </p>
      <TablaCohorte data={g.cohorteComparativo ?? []} />
    </div>
  </>
)}
    </div>
  );
}