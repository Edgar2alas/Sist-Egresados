"use client";
import { useRef } from "react";
import { useState, useEffect, useCallback } from "react";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Cell, PieChart, Pie, Legend,
} from "recharts";
import {
  GraduationCap, Users, TrendingUp, Clock, Briefcase,
  Filter, RefreshCw, Download, FileDown,
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
      data-pdf-card-row
      style={{
        background: "var(--blanco)",
        border: "1px solid var(--borde)",
        boxShadow: "var(--shadow-sm)",
      }}
    >
      <div className={`p-3 rounded-xl shrink-0 border ${bg}`} style={{ marginTop: "2px" }}>
        <Icon className={`w-5 h-5 ${color}`} />
      </div>

      <div className="min-w-0">
        <p
          data-pdf-text-fix
          className="text-2xl font-bold leading-none"
          style={{
            color: "var(--azul-pizarra)",
            fontFamily: "'Source Serif 4', serif",
          }}
        >
          {value}
        </p>

        <p
          data-pdf-text-fix
          className="text-xs font-medium uppercase tracking-wide leading-tight mt-1"
          style={{ color: "var(--gris-grafito)" }}
        >
          {label}
        </p>

        {sub && (
          <p
            className="text-xs leading-tight mt-1"
            style={{ color: "var(--placeholder)" }}
          >
            {sub}
          </p>
        )}
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
                  padding: "2px 8px", borderRadius: "9999px", fontSize: "0.72rem", fontWeight: 600,
                  display: "inline-flex", alignItems: "center", lineHeight: 1,
                }}>
                  {r.titulados}
                </span>
              </td>
              <td style={{ padding: "8px 10px" }}>
                <span style={{
                  background: "var(--naranja-light)", color: "var(--naranja)",
                  padding: "2px 8px", borderRadius: "9999px", fontSize: "0.72rem", fontWeight: 600,
                  display: "inline-flex", alignItems: "center", lineHeight: 1,
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
  
  const dashboardRef = useRef<HTMLDivElement>(null);

  const years = Array.from({ length: new Date().getFullYear() - 1997 }, (_, i) => 1998 + i).reverse();

const exportarPDF = async () => {
  if (!data) return;

  const { default: jsPDF } = await import("jspdf");

  const fechaGen = new Date().toLocaleDateString("es-BO", {
    day: "2-digit", month: "long", year: "numeric",
  });

  const filtrosAplicados = [
    anioDesde && `Desde ${anioDesde}`,
    anioHasta && `Hasta ${anioHasta}`,
    tipo      && `Tipo: ${tipo}`,
    sector    && `Sector: ${sector}`,
    modalidad && `Modalidad: ${modalidad}`,
  ].filter(Boolean).join(" · ") || "Sin filtros";

  const pdf = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
  const pageW = pdf.internal.pageSize.getWidth();
  const pageH = pdf.internal.pageSize.getHeight();
  const margin = 14;
  let y = 0;

  // ── Encabezado ────────────────────────────────────────────────────────
  pdf.setFillColor(0, 165, 168);
  pdf.rect(0, 0, pageW, 18, "F");
  pdf.setTextColor(255, 255, 255);
  pdf.setFontSize(13);
  pdf.setFont("helvetica", "bold");
  pdf.text("Carrera de Estadística — UMSA", margin, 12);
  pdf.setFontSize(8);
  pdf.setFont("helvetica", "normal");
  pdf.text("Universidad Mayor de San Andrés", pageW - margin, 12, { align: "right" });

  // ── Título ────────────────────────────────────────────────────────────
  pdf.setTextColor(30, 41, 59);
  pdf.setFontSize(15);
  pdf.setFont("helvetica", "bold");
  pdf.text("Dashboard — Informe de Seguimiento de Egresados", margin, 30);
  pdf.setDrawColor(0, 165, 168);
  pdf.setLineWidth(0.5);
  pdf.line(margin, 33, pageW - margin, 33);
  y = 33;

  // ── Metadata ──────────────────────────────────────────────────────────
  pdf.setFontSize(8);
  pdf.setFont("helvetica", "normal");
  pdf.setTextColor(71, 85, 105);
  y += 7;
  pdf.text(`Fecha de generación: ${fechaGen}`, margin, y);
  y += 5;
  pdf.text(`Filtros aplicados: ${filtrosAplicados}`, margin, y);
  y += 10;

  // ── KPIs ──────────────────────────────────────────────────────────────
const kpis = data.kpis ?? {};
pdf.setFontSize(11);
pdf.setFont("helvetica", "bold");
pdf.setTextColor(30, 41, 59);
pdf.text("Indicadores Clave", margin, y);
y += 6;

const kpiData = [
  ["Total Titulados registrados",       String(kpis.totalTitulados ?? 0)],
  ["Total Egresados sin título",         String(kpis.totalEgresados ?? 0)],
  ["Tasa de empleabilidad (titulados)",  `${kpis.tasaEmpleabilidadTitulados ?? 0}%`],
  ["Titulados con empleo activo",        String(kpis.tituladosConEmpleo ?? 0)],
  ["Tiempo promedio egreso→titulación",  kpis.tiempoPromedioTitulacion ? `${kpis.tiempoPromedioTitulacion} meses` : "—"],
  ["Tiempo promedio inserción laboral",  kpis.tiempoPromedioInsercion  ? `${kpis.tiempoPromedioInsercion} meses`  : "—"],
];

const colW = (pageW - margin * 2) / 2;
kpiData.forEach(([label, value], i) => {
  const col = i % 2;
  const row = Math.floor(i / 2); // ← quitado el +100
  const x   = margin + col * colW;
  const yy  = y + row * 14;

  pdf.setFillColor(248, 250, 252);
  pdf.setDrawColor(226, 232, 240);
  pdf.roundedRect(x, yy - 4, colW - 4, 12, 2, 2, "FD");
  pdf.setFontSize(7);
  pdf.setFont("helvetica", "normal");
  pdf.setTextColor(100, 116, 139);
  pdf.text(label, x + 4, yy - 1);
  pdf.setFontSize(11);
  pdf.setFont("helvetica", "bold");
  pdf.setTextColor(0, 165, 168);
  pdf.text(value, x + 4, yy + 5);
});

y += Math.ceil(kpiData.length / 2) * 14 + 8;

  // ── Separador ─────────────────────────────────────────────────────────
  pdf.setDrawColor(226, 232, 240);
  pdf.setLineWidth(0.3);
  pdf.line(margin, y, pageW - margin, y);
  y += 8;

  // ── Tabla: Graduados por año ───────────────────────────────────────────
  const g = data.graficos ?? {};
  const porAnio: any[] = g.tituladosPorAnio ?? [];

  if (porAnio.length > 0) {
    pdf.setFontSize(11);
    pdf.setFont("helvetica", "bold");
    pdf.setTextColor(30, 41, 59);
    pdf.text("Graduados por Año de Titulación", margin, y);
    y += 6;

    // Encabezados tabla
    const colAncho = [20, 30, 30, 20];
    const headers = ["Año", "Total", "Titulados", "Egresados"];
    pdf.setFillColor(0, 165, 168);
    pdf.rect(margin, y - 4, pageW - margin * 2, 8, "F");
    pdf.setTextColor(255, 255, 255);
    pdf.setFontSize(8);
    pdf.setFont("helvetica", "bold");
    let xh = margin + 2;
    headers.forEach((h, i) => {
      pdf.text(h, xh, y + 1);
      xh += colAncho[i];
    });
    y += 8;

    porAnio.slice(-15).forEach((row: any, idx: number) => {
      if (y > pageH - 30) {
        pdf.addPage();
        y = 20;
      }
      pdf.setFillColor(idx % 2 === 0 ? 248 : 255, idx % 2 === 0 ? 250 : 255, idx % 2 === 0 ? 252 : 255);
      pdf.rect(margin, y - 4, pageW - margin * 2, 7, "F");
      pdf.setTextColor(30, 41, 59);
      pdf.setFont("helvetica", "normal");
      pdf.setFontSize(8);
      let xr = margin + 2;
      [String(row.anio), String(row.total ?? (row.titulados + row.egresados)), String(row.titulados ?? 0), String(row.egresados ?? 0)].forEach((val, i) => {
        pdf.text(val, xr, y + 0.5);
        xr += colAncho[i];
      });
      y += 7;
    });
    y += 6;
  }

  // ── Tabla: Sector laboral ─────────────────────────────────────────────
  const porSector: any[] = g.porSector ?? [];
  if (porSector.length > 0) {
    if (y > pageH - 60) { pdf.addPage(); y = 20; }
    pdf.setFontSize(11);
    pdf.setFont("helvetica", "bold");
    pdf.setTextColor(30, 41, 59);
    pdf.text("Distribución por Sector Laboral", margin, y);
    y += 6;

    pdf.setFillColor(0, 165, 168);
    pdf.rect(margin, y - 4, pageW - margin * 2, 8, "F");
    pdf.setTextColor(255, 255, 255);
    pdf.setFontSize(8);
    pdf.setFont("helvetica", "bold");
    pdf.text("Sector", margin + 2, y + 1);
    pdf.text("Cantidad", margin + 80, y + 1);
    pdf.text("% del total", margin + 120, y + 1);
    y += 8;

    const totalSector = porSector.reduce((acc: number, r: any) => acc + r.cantidad, 0);
    porSector.forEach((row: any, idx: number) => {
      if (y > pageH - 20) { pdf.addPage(); y = 20; }
      pdf.setFillColor(idx % 2 === 0 ? 248 : 255, idx % 2 === 0 ? 250 : 255, idx % 2 === 0 ? 252 : 255);
      pdf.rect(margin, y - 4, pageW - margin * 2, 7, "F");
      pdf.setTextColor(30, 41, 59);
      pdf.setFont("helvetica", "normal");
      pdf.setFontSize(8);
      pdf.text(String(row.sector ?? "—"), margin + 2, y + 0.5);
      pdf.text(String(row.cantidad), margin + 80, y + 0.5);
      const pct = totalSector > 0 ? ((row.cantidad / totalSector) * 100).toFixed(1) : "0";
      pdf.text(`${pct}%`, margin + 120, y + 0.5);
      y += 7;
    });
    y += 6;
  }

  // ── Tabla: Modalidad ──────────────────────────────────────────────────
  const porModalidad: any[] = g.porModalidad ?? [];
  if (porModalidad.length > 0) {
    if (y > pageH - 60) { pdf.addPage(); y = 20; }
    pdf.setFontSize(11);
    pdf.setFont("helvetica", "bold");
    pdf.setTextColor(30, 41, 59);
    pdf.text("Distribución por Modalidad de Titulación", margin, y);
    y += 6;

    pdf.setFillColor(0, 165, 168);
    pdf.rect(margin, y - 4, pageW - margin * 2, 8, "F");
    pdf.setTextColor(255, 255, 255);
    pdf.setFontSize(8);
    pdf.setFont("helvetica", "bold");
    pdf.text("Modalidad", margin + 2, y + 1);
    pdf.text("Cantidad", margin + 100, y + 1);
    y += 8;

    porModalidad.forEach((row: any, idx: number) => {
      if (y > pageH - 20) { pdf.addPage(); y = 20; }
      pdf.setFillColor(idx % 2 === 0 ? 248 : 255, idx % 2 === 0 ? 250 : 255, idx % 2 === 0 ? 252 : 255);
      pdf.rect(margin, y - 4, pageW - margin * 2, 7, "F");
      pdf.setTextColor(30, 41, 59);
      pdf.setFont("helvetica", "normal");
      pdf.setFontSize(8);
      pdf.text(String(row.modalidad ?? "—"), margin + 2, y + 0.5);
      pdf.text(String(row.cantidad), margin + 100, y + 0.5);
      y += 7;
    });
    y += 6;
  }

  // ── Tabla: Distribución geográfica ────────────────────────────────────────
const geoCiudad: any[] = g.geoCiudad ?? [];
const geoRegion: any[]  = g.geoRegion  ?? [];

if (geoCiudad.length > 0 || geoRegion.length > 0) {
  if (y > pageH - 80) { pdf.addPage(); y = 20; }

  pdf.setFontSize(11);
  pdf.setFont("helvetica", "bold");
  pdf.setTextColor(30, 41, 59);
  pdf.text("Distribución Geográfica", margin, y);
  y += 6;

  const colGeo = (pageW - margin * 2) / 2 - 2;

  // ── Encabezado ciudad ──
  pdf.setFillColor(0, 165, 168);
  pdf.rect(margin, y - 4, colGeo, 8, "F");
  pdf.setTextColor(255, 255, 255);
  pdf.setFontSize(8);
  pdf.setFont("helvetica", "bold");
  pdf.text("Ciudad de trabajo", margin + 2, y + 1);

  // ── Encabezado región ──
  const xRegion = margin + colGeo + 4;
  pdf.setFillColor(0, 165, 168);
  pdf.rect(xRegion, y - 4, colGeo, 8, "F");
  pdf.text("Departamento residencia", xRegion + 2, y + 1);
  y += 8;

  const maxFilas = Math.max(geoCiudad.length, geoRegion.length);
  for (let i = 0; i < Math.min(maxFilas, 10); i++) {
    if (y > pageH - 20) { pdf.addPage(); y = 20; }

    const ciudad  = geoCiudad[i];
    const region  = geoRegion[i];
    const bgColor = i % 2 === 0 ? [248, 250, 252] : [255, 255, 255];

    // fila ciudad
    pdf.setFillColor(bgColor[0], bgColor[1], bgColor[2]);
    pdf.rect(margin, y - 4, colGeo, 7, "F");
    pdf.setTextColor(30, 41, 59);
    pdf.setFont("helvetica", "normal");
    pdf.setFontSize(8);
    if (ciudad) {
      pdf.text(`${i + 1}. ${String(ciudad.ciudad ?? "—")}`, margin + 2, y + 0.5);
      pdf.setTextColor(0, 165, 168);
      pdf.setFont("helvetica", "bold");
      pdf.text(String(ciudad.cantidad), margin + colGeo - 10, y + 0.5);
    }

    // fila región
    pdf.setFillColor(bgColor[0], bgColor[1], bgColor[2]);
    pdf.rect(xRegion, y - 4, colGeo, 7, "F");
    pdf.setTextColor(30, 41, 59);
    pdf.setFont("helvetica", "normal");
    pdf.setFontSize(8);
    if (region) {
      pdf.text(`${i + 1}. ${String(region.region ?? "—")}`, xRegion + 2, y + 0.5);
      pdf.setTextColor(0, 165, 168);
      pdf.setFont("helvetica", "bold");
      pdf.text(String(region.cantidad), xRegion + colGeo - 10, y + 0.5);
    }

    y += 7;
  }
  y += 6;
}

  // ── Tabla: Cohorte comparativo ─────────────────────────────────────────
  const cohorte: any[] = g.cohorteComparativo ?? [];
  if (cohorte.length > 0) {
    if (y > pageH - 70) { pdf.addPage(); y = 20; }
    pdf.setFontSize(11);
    pdf.setFont("helvetica", "bold");
    pdf.setTextColor(30, 41, 59);
    pdf.text("Comparativo por Cohorte de Ingreso", margin, y);
    y += 6;

    const chCols = [18, 16, 20, 22, 26, 22];
    const chHeaders = ["Cohorte", "Total", "Titulados", "Egresados", "Con empleo", "% Titulados"];
    pdf.setFillColor(0, 165, 168);
    pdf.rect(margin, y - 4, pageW - margin * 2, 8, "F");
    pdf.setTextColor(255, 255, 255);
    pdf.setFontSize(7);
    pdf.setFont("helvetica", "bold");
    let xch = margin + 2;
    chHeaders.forEach((h, i) => {
      pdf.text(h, xch, y + 1);
      xch += chCols[i];
    });
    y += 8;

    cohorte.slice(0, 20).forEach((row: any, idx: number) => {
      if (y > pageH - 20) { pdf.addPage(); y = 20; }
      pdf.setFillColor(idx % 2 === 0 ? 248 : 255, idx % 2 === 0 ? 250 : 255, idx % 2 === 0 ? 252 : 255);
      pdf.rect(margin, y - 4, pageW - margin * 2, 7, "F");
      pdf.setTextColor(30, 41, 59);
      pdf.setFont("helvetica", "normal");
      pdf.setFontSize(7);
      const vals = [
        String(row.cohorte ?? "—"),
        String(row.total ?? 0),
        String(row.titulados ?? 0),
        String(row.egresados ?? 0),
        String(row.tituladosConEmpleo ?? 0),
        `${(row.pctTitulados ?? 0).toFixed(1)}%`,
      ];
      let xr2 = margin + 2;
      vals.forEach((v, i) => {
        pdf.text(v, xr2, y + 0.5);
        xr2 += chCols[i];
      });
      y += 7;
    });
    y += 6;
  }

  // ── Pie de página ─────────────────────────────────────────────────────
  const totalPages = (pdf as any).internal.getNumberOfPages();
  for (let i = 1; i <= totalPages; i++) {
    pdf.setPage(i);
    pdf.setFontSize(7);
    pdf.setFont("helvetica", "normal");
    pdf.setTextColor(148, 163, 184);
    pdf.text(
      `Sistema de Seguimiento de Egresados · Carrera de Estadística UMSA · ${fechaGen} · Pág. ${i}/${totalPages}`,
      pageW / 2,
      pageH - 6,
      { align: "center" },
    );
  }

  const fileName = `dashboard_egresados_${new Date().toISOString().split("T")[0]}.pdf`;
  pdf.save(fileName);
};




const exportarPDFCaptura = async () => {
  if (!data) return;

  const fechaGen = new Date().toLocaleDateString("es-BO", {
    day: "2-digit", month: "long", year: "numeric",
  });

  const filtrosAplicados = [
    anioDesde && `Desde ${anioDesde}`,
    anioHasta && `Hasta ${anioHasta}`,
    tipo      && `Tipo: ${tipo}`,
    sector    && `Sector: ${sector}`,
    modalidad && `Modalidad: ${modalidad}`,
  ].filter(Boolean).join(" · ") || "Sin filtros";

  try {
    const html2canvasModule = await import("html2canvas");
    const html2canvas = html2canvasModule.default ?? html2canvasModule;
    const jsPDFModule = await import("jspdf");
    const jsPDF = jsPDFModule.default ?? jsPDFModule.jsPDF;

    const oncloneHandler = async (doc: Document) => {
    const style = doc.createElement("style");
    style.textContent = `
      * {
        font-family: Arial, sans-serif !important;
        transform: none !important;
        -webkit-transform: none !important;
      }
      p, span, h3, h4, label, td, th, div {
        position: relative !important;
        top: -8px !important;
      }
    `;
    doc.head.appendChild(style);
    await doc.fonts.ready;
  };

    // ── Capturar KPIs ─────────────────────────────────────────────────
    const kpiEl = document.querySelector("[data-pdf-kpis]") as HTMLElement;
    if (!kpiEl) { alert("No se encontró el bloque de KPIs"); return; }

    const canvasKpis = await html2canvas(kpiEl, {
      scale: 2,
      useCORS: true,
      backgroundColor: "#f8fafc",
      logging: false,
      width: kpiEl.scrollWidth,
      height: kpiEl.scrollHeight,
      onclone: oncloneHandler,
    });

    // ── Capturar cada bloque de gráficos ──────────────────────────────
    const graficoEls = Array.from(
      document.querySelectorAll("[data-pdf-graficos]")
    ) as HTMLElement[];

    const canvasGraficos = await Promise.all(
      graficoEls.map((el) =>
        html2canvas(el, {
          scale: 2,
          useCORS: true,
          backgroundColor: "#f8fafc",
          logging: false,
          width: el.scrollWidth,
          height: el.scrollHeight,
          onclone: oncloneHandler,
        })
      )
    );

    // ── Construir PDF ─────────────────────────────────────────────────
    const pdf = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
    const pageW  = pdf.internal.pageSize.getWidth();
    const pageH  = pdf.internal.pageSize.getHeight();
    const margin = 14;
    const availW = pageW - margin * 2;
    const footerY = pageH - 4;

    const addFooter = () => {
      pdf.setFontSize(6);
      pdf.setFont("helvetica", "normal");
      pdf.setTextColor(148, 163, 184);
      pdf.text(
        `Sistema de Seguimiento de Egresados · Carrera de Estadística UMSA · Pág. ${(pdf as any).internal.getNumberOfPages()}`,
        pageW / 2, footerY, { align: "center" },
      );
    };

    const addHeader = (isFirst: boolean) => {
      pdf.setFillColor(0, 165, 168);
      pdf.rect(0, 0, pageW, 18, "F");
      pdf.setTextColor(255, 255, 255);
      pdf.setFontSize(12);
      pdf.setFont("helvetica", "bold");
      pdf.text("Carrera de Estadística — UMSA", margin, 12);
      pdf.setFontSize(7);
      pdf.setFont("helvetica", "normal");
      pdf.text("Universidad Mayor de San Andrés", pageW - margin, 12, { align: "right" });

      if (isFirst) {
        pdf.setTextColor(30, 41, 59);
        pdf.setFontSize(14);
        pdf.setFont("helvetica", "bold");
        pdf.text("Dashboard — Seguimiento de Egresados", margin, 28);
        pdf.setDrawColor(0, 165, 168);
        pdf.setLineWidth(0.5);
        pdf.line(margin, 31, pageW - margin, 31);
        pdf.setFontSize(7.5);
        pdf.setFont("helvetica", "normal");
        pdf.setTextColor(71, 85, 105);
        pdf.text(`Fecha: ${fechaGen}`, margin, 37);
        pdf.text(`Filtros: ${filtrosAplicados}`, margin, 42);
      }
    };

    // ── Página 1: encabezado + KPIs ───────────────────────────────────
    addHeader(true);

    const mmPerPxKpi = availW / canvasKpis.width;
    const kpiImgH    = canvasKpis.height * mmPerPxKpi;
    let cursorY      = 48; // justo debajo de fecha/filtros

    pdf.addImage(canvasKpis.toDataURL("image/png"), "PNG", margin, cursorY, availW, kpiImgH);
    cursorY += kpiImgH + 6;

    // ── Separador "Gráficos y análisis" ──────────────────────────────
    pdf.setDrawColor(0, 165, 168);
    pdf.setLineWidth(0.3);
    pdf.line(margin, cursorY, pageW - margin, cursorY);
    pdf.setFontSize(7);
    pdf.setFont("helvetica", "bold");
    pdf.setTextColor(0, 165, 168);
    pdf.text("GRÁFICOS Y ANÁLISIS", pageW / 2, cursorY + 5, { align: "center" });
    cursorY += 10;

    addFooter();

    // ── Insertar cada gráfico, paginando si es necesario ──────────────
    for (const canvasG of canvasGraficos) {
      const mmPerPx = availW / canvasG.width;
      const imgH    = canvasG.height * mmPerPx;

      // Si no cabe en la página actual, añadir nueva página
      if (cursorY + imgH > pageH - 12) {
        pdf.addPage();
        addHeader(false);
        cursorY = 22;
        addFooter();
      }

      pdf.addImage(canvasG.toDataURL("image/png"), "PNG", margin, cursorY, availW, imgH);
      cursorY += imgH + 6;
    }

    // ── Actualizar números de página ──────────────────────────────────
    const totalPages = (pdf as any).internal.getNumberOfPages();
    for (let i = 1; i <= totalPages; i++) {
      pdf.setPage(i);
      pdf.setFontSize(6);
      pdf.setFont("helvetica", "normal");
      pdf.setTextColor(148, 163, 184);
      pdf.text(
        `Sistema de Seguimiento de Egresados · Carrera de Estadística UMSA · Pág. ${i}/${totalPages}`,
        pageW / 2, footerY, { align: "center" },
      );
    }

    pdf.save(`dashboard_visual_${new Date().toISOString().split("T")[0]}.pdf`);

  } catch (e) {
    console.error("Error al generar PDF:", e);
    alert("Error al generar el PDF.");
  }
};


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

  <div ref={dashboardRef} data-pdf-capture>
        {/* ── KPIs siempre sin filtro ── */}
        <div data-pdf-kpis className="grid grid-cols-2 lg:grid-cols-3 gap-4">
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
        <div data-pdf-graficos className="flex items-center gap-3" style={{ marginTop: "2rem", marginBottom: "2rem" }}>
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
          data-pdf-graficos
          className="rounded-2xl p-5"
          style={{ background: "var(--blanco)", border: "1px solid var(--borde)", boxShadow: "var(--shadow-sm)" }}
        >
          <div className="flex items-center gap-2 mb-4">
            <Filter className="w-4 h-4" style={{ color: "var(--turquesa)" }} />
            <p className="text-sm font-semibold" style={{ color: "var(--azul-pizarra)" }}>
              Filtros — afectan los gráficos y tablas de abajo
            </p>
          </div>
          <div className="flex flex-wrap gap-3 items-start">
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

      <div className="pt-[22px] flex items-center gap-3">
        <button
          onClick={fetchData}
          disabled={loading}
          className="btn-primary btn-sm flex items-center gap-2 h-[38px]"
        >
          <RefreshCw className={cn("w-3.5 h-3.5", loading && "animate-spin")} />
          Aplicar filtros
        </button>

        {(anioDesde || anioHasta || sector || modalidad || tipo) && (
          <button
            onClick={resetFiltros}
            className="btn-sm h-[38px] px-4 text-xs font-medium rounded-lg border flex items-center"
            style={{
              borderColor: "var(--borde)",
              color: "var(--gris-grafito)",
              background: "var(--blanco)",
            }}
          >
            Limpiar filtros
          </button>
        )}

        <button
          onClick={exportarPDF}
          disabled={!data || loading}
          className="btn-sm h-[38px] px-4 flex items-center gap-2 rounded-lg border"
          style={{
            borderColor: "var(--borde)",
            color: "var(--azul-pizarra)",
            background: "var(--blanco)",
          }}
          title="Exportar dashboard como tablas en PDF"
        >
          <FileDown className="w-4 h-4" style={{ color: "var(--turquesa)" }} />
          Exportar como PDF
        </button>

      </div>
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
  </div>
)}
    </div>
  );
}