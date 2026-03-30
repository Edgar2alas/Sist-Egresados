"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Trash2 } from "lucide-react";

export default function EliminarUsuarioBtn({ id, correo }: { id: number; correo: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handleDelete = async () => {
    if (!confirm(`¿Eliminar el usuario "${correo}"?`)) return;
    setLoading(true);
    const res = await fetch(`/api/usuarios/${id}`, { method: "DELETE" });
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
