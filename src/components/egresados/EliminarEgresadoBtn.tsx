"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Trash2 } from "lucide-react";

export default function EliminarEgresadoBtn({ id, nombre }: { id: number; nombre: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handleDelete = async () => {
    if (!confirm(`¿Eliminar a ${nombre}? Esta acción no se puede deshacer.`)) return;
    setLoading(true);
    const res = await fetch(`/api/egresados/${id}`, { method: "DELETE" });
    if (res.ok) { router.refresh(); }
    else {
      const json = await res.json();
      alert(json.error ?? "Error al eliminar");
    }
    setLoading(false);
  };

  return (
    <button onClick={handleDelete} disabled={loading} className="btn-danger btn-xs">
      <Trash2 className="w-3 h-3" />
      {loading ? "..." : "Eliminar"}
    </button>
  );
}
