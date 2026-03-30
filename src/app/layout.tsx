import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: { template: "%s | Egresados Estadística", default: "Sistema de Egresados · Estadística" },
  description: "Sistema de seguimiento de egresados – Carrera de Estadística",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <body className="min-h-screen bg-slate-950">{children}</body>
    </html>
  );
}
