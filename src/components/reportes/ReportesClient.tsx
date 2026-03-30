"use client";
import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Cell, LineChart, Line,
} from "recharts";
import { Download, Table2, BarChart2, Loader2 } from "lucide-react";
import { cn, fmtDate } from "@/lib/utils";

const COLORS = ["#0ea5e9","#10b981","#f59e0b","#8b5cf6","#ef4444","#06b6d4","#f97316"];
const TT     = { contentStyle:{ backgroundColor:"#1e293b", border:"1px solid #334155", borderRadius:"10px", color:"#e2e8f0", fontSize:"12px" } };

interface Props {
  planes:      { id: number; nombre: string }[];
}

export default function ReportesClient({ planes }: Props) {
  const [vista,    setVista]    = useState<"tabla" | "grafico">("tabla");
  const [loading,  setLoading]  = useState(false);
  const [data,     setData]     = useState<any>(null);

  // Filtros
  const [anio,     setAnio]     = useState("");
  const [idPlan,   setIdPlan]   = useState("");
  const [conEmpleo, setConEmpleo] = useState("");

  const years = Array.from({ length: new Date().getFullYear() - 1997 }, (_, i) => 1998 + i).reverse();

  const buildParams = () => {
    const p = new URLSearchParams();
    if (anio)      p.set("anioGraduacion", anio);
    if (idPlan)    p.set("idPlan", idPlan);
    if (conEmpleo) p.set("conEmpleo", conEmpleo);
    return p;
  };

  const fetchData = async () => {
    setLoading(true);
    try {
      const res  = await fetch(`/api/reportes?${buildParams()}`);
      const json = await res.json();
      setData(json.data);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchData(); }, []);

  const exportExcel = () => {
    const p = buildParams();
    p.set("exportar", "excel");
    window.open(`/api/reportes?${p}`, "_blank");
  };

  return (
    <div className="space-y-6">
      {/* Filtros */}
      <div className="card flex flex-wrap gap-3 items-end">
        <div className="min-w-[120px]">
          <label className="label">Año Graduación</label>
          <select value={anio} onChange={e => setAnio(e.target.value)} className="field">
            <option value="">Todos</option>
            {years.map(y => <option key={y} value={y}>{y}</option>)}
          </select>
        </div>
        <div className="min-w-[180px]">
          <label className="label">Plan de Estudios</label>
          <select value={idPlan} onChange={e => setIdPlan(e.target.value)} className="field">
            <option value="">Todos</option>
            {planes.map(p => <option key={p.id} value={p.id}>{p.nombre}</option>)}
          </select>
        </div>
        <div className="min-w-[140px]">
          <label className="label">Estado Laboral</label>
          <select value={conEmpleo} onChange={e => setConEmpleo(e.target.value)} className="field">
            <option value="">Todos</option>
            <option value="true">Con empleo</option>
            <option value="false">Sin empleo</option>
          </select>
        </div>
        <button onClick={fetchData} className="btn-primary btn-sm">
          {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Ver resultados"}
        </button>
        <button onClick={exportExcel} className="btn-slate btn-sm">
          <Download className="w-3.5 h-3.5" /> Exportar Excel
        </button>
      </div>

      {/* Toggle vista */}
      {data && (
        <>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <p className="text-slate-400 text-sm">
                <span className="text-white font-bold text-lg">{data.total}</span> egresados ·{" "}
                <span className="text-emerald-400 font-semibold">{data.conEmpleo}</span> con empleo ·{" "}
                <span className="text-slate-400">{data.sinEmpleo}</span> sin empleo
              </p>
            </div>
            <div className="flex gap-1 bg-slate-800 rounded-xl p-1">
              <button onClick={() => setVista("tabla")}
                className={cn("flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all",
                  vista === "tabla" ? "bg-slate-700 text-white" : "text-slate-500 hover:text-white")}>
                <Table2 className="w-3.5 h-3.5" /> Tabla
              </button>
              <button onClick={() => setVista("grafico")}
                className={cn("flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all",
                  vista === "grafico" ? "bg-slate-700 text-white" : "text-slate-500 hover:text-white")}>
                <BarChart2 className="w-3.5 h-3.5" /> Gráfico
              </button>
            </div>
          </div>

          {/* Vista tabla */}
          {vista === "tabla" && (
            <div className="tbl-wrap">
              <table className="tbl">
                <thead>
                  <tr>
                    <th>Apellidos, Nombres</th>
                    <th>CI</th>
                    <th>Plan de Estudios</th>
                    <th>Graduación</th>
                    <th>Empleo</th>
                  </tr>
                </thead>
                <tbody>
                  {data.filas?.map((r: any) => (
                    <tr key={r.id}>
                      <td className="text-white font-medium">{r.apellidos}, {r.nombres}</td>
                      <td className="font-mono text-slate-400 text-sm">{r.ci}</td>
                      <td className="text-slate-500 text-sm max-w-[160px] truncate">{r.nombrePlan ?? "—"}</td>
                      <td className="text-slate-400 text-sm">{fmtDate(r.fechaGraduacion)}</td>
                      <td>
                        <span className={cn("badge", r.tieneEmpleo ? "badge-green" : "badge-slate")}>
                          {r.tieneEmpleo ? "Empleado" : "Sin empleo"}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Vista gráfico */}
          {vista === "grafico" && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Por año */}
              <div className="card">
                <h3 className="text-white font-bold mb-1">Egresados por Año</h3>
                <p className="text-slate-500 text-xs mb-5">Total graduados por año</p>
                <ResponsiveContainer width="100%" height={220}>
                  <BarChart data={data.porAnio} barSize={22}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                    <XAxis dataKey="anio" tick={{ fill:"#64748b", fontSize:11 }} axisLine={false} />
                    <YAxis tick={{ fill:"#64748b", fontSize:11 }} axisLine={false} tickLine={false} allowDecimals={false} />
                    <Tooltip {...TT} />
                    <Bar dataKey="cantidad" fill="#0ea5e9" radius={[4,4,0,0]} name="Egresados" />
                  </BarChart>
                </ResponsiveContainer>
              </div>

              {/* Empleabilidad por año */}
              <div className="card">
                <h3 className="text-white font-bold mb-1">Empleabilidad por Año</h3>
                <p className="text-slate-500 text-xs mb-5">Total vs con empleo</p>
                <ResponsiveContainer width="100%" height={220}>
                  <LineChart data={data.empleabilidad}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                    <XAxis dataKey="anio" tick={{ fill:"#64748b", fontSize:11 }} axisLine={false} />
                    <YAxis tick={{ fill:"#64748b", fontSize:11 }} axisLine={false} tickLine={false} allowDecimals={false} />
                    <Tooltip {...TT} />
                    <Line type="monotone" dataKey="total"     stroke="#64748b" strokeWidth={2} dot={false} name="Total" />
                    <Line type="monotone" dataKey="conEmpleo" stroke="#10b981" strokeWidth={2.5}
                      dot={{ r:3, fill:"#10b981" }} name="Con empleo" />
                  </LineChart>
                </ResponsiveContainer>
              </div>

              {/* Por plan */}
              <div className="card lg:col-span-2">
                <h3 className="text-white font-bold mb-1">Distribución por Plan de Estudios</h3>
                <p className="text-slate-500 text-xs mb-5">Egresados por plan curricular</p>
                <ResponsiveContainer width="100%" height={200}>
                  <BarChart data={data.porPlan} layout="vertical" barSize={18}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" horizontal={false} />
                    <XAxis type="number" tick={{ fill:"#64748b", fontSize:11 }} axisLine={false} allowDecimals={false} />
                    <YAxis type="category" dataKey="plan" tick={{ fill:"#94a3b8", fontSize:10 }}
                      axisLine={false} tickLine={false} width={140} />
                    <Tooltip {...TT} />
                    <Bar dataKey="cantidad" name="Egresados" radius={[0,4,4,0]}>
                      {(data.porPlan ?? []).map((_: any, i: number) => (
                        <Cell key={i} fill={COLORS[i % COLORS.length]} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}
        </>
      )}

      {loading && (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-8 h-8 text-primary-400 animate-spin" />
        </div>
      )}
    </div>
  );
}
