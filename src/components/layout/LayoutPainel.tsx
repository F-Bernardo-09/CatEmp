import { Link, useLocation } from "react-router";
import type { ReactNode } from "react";
import { useLojaDoUsuario } from "../../hooks/useLojaDoUsuario";

interface LayoutPainelProps {
  children: ReactNode;
}

function LayoutPainel({ children }: LayoutPainelProps) {
  const location = useLocation();
  const { loja } = useLojaDoUsuario();

  const links = [
    { to: "/painel", label: "Início" },
    { to: "/painel/itens", label: "Itens" },
    { to: "/painel/categorias", label: "Categorias" },
    { to: "/painel/temas", label: "Temas" },
    { to: "/painel/loja", label: "Perfil da loja" },
  ];

  return (
    <div className="flex min-h-screen flex-col bg-page">
      <header className="border-b border-border bg-white px-4 py-3 sm:px-8">
        <div className="mx-auto flex max-w-6xl items-center justify-between">
          <div className="flex items-center gap-6">
            <Link to="/painel" className="text-lg font-bold tracking-wider text-primary">
              CATEMP <span className="text-xs font-normal text-text-secondary uppercase">Painel</span>
            </Link>

            <nav className="hidden md:flex items-center gap-1 text-sm font-medium">
              {links.map((link) => {
                const ativo =
                  link.to === "/painel"
                    ? location.pathname === "/painel"
                    : location.pathname.startsWith(link.to);
                return (
                  <Link
                    key={link.to}
                    to={link.to}
                    className={`rounded-button px-3 py-1.5 transition-colors ${
                      ativo
                        ? "bg-primary/10 text-primary font-semibold"
                        : "text-text-secondary hover:bg-surface hover:text-text"
                    }`}
                  >
                    {link.label}
                  </Link>
                );
              })}
            </nav>
          </div>

          {loja?.slug && (
            <Link
              to={`/${loja.slug}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs font-medium text-primary hover:underline flex items-center gap-1"
            >
              Ver loja ({loja.slug}) ↗
            </Link>
          )}
        </div>
      </header>

      <main className="mx-auto w-full max-w-6xl flex-1 p-4 sm:p-8">
        {children}
      </main>
    </div>
  );
}

export default LayoutPainel;
