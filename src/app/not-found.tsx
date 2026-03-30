import Link from "next/link";
import { Home } from "lucide-react";
export default function NotFound() {
  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center">
      <div className="text-center animate-fade-up">
        <p className="text-8xl font-bold text-slate-800 mb-4">404</p>
        <h2 className="text-xl font-bold text-white mb-2">Página no encontrada</h2>
        <p className="text-slate-500 mb-8">La ruta que buscas no existe.</p>
        <Link href="/" className="btn-primary"><Home className="w-4 h-4" /> Inicio</Link>
      </div>
    </div>
  );
}
