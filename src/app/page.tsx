import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";

export default async function RootPage() {
  const s = await getSession();
  if (!s)                   redirect("/login");
  if (s.rol === "admin")    redirect("/dashboard");
  if (s.rol === "egresado") redirect("/mi-perfil");
  redirect("/login");
}
