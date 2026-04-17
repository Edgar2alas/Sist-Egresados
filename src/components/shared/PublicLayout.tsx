import { getSession } from "@/lib/auth";
import PublicHeader from "@/components/shared/PublicHeader";
import PublicFooter from "@/components/shared/PublicFooter";

export default async function PublicLayout({ children }: { children: React.ReactNode }) {
  // Detectamos sesión en el servidor para pasarla al header
  const session = await getSession();
  const isLoggedIn = !!session;
  const correo = session?.correo;

  return (
    <div className="min-h-screen flex flex-col" style={{ background: "var(--humo)" }}>
      <PublicHeader isLoggedIn={isLoggedIn} correo={correo} />
      <main className="flex-1 pt-16">
        {children}
      </main>
      <PublicFooter />
    </div>
  );
}
