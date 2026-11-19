import { Link } from "react-router";

import { useCarrinho } from "../../hooks/useCarrinho";

function CabecalhoPublico() {
  const { quantidadeItens } = useCarrinho();

  return (
    <header className="bg-primary px-5 py-4 text-text-inverse sm:py-5">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-6">
        <Link
          to="/"
          className="shrink-0 text-xl font-extrabold tracking-[0.16em]"
          aria-label="CATEMP - página inicial"
        >
          CATEMP
        </Link>

        <nav aria-label="Navegação principal" className="flex items-center gap-4 text-sm font-semibold">
          <Link
            to="/buscar"
            className="transition-colors hover:text-surface"
          >
            Catálogo
          </Link>
          <Link
            to="/carrinho"
            className="rounded-full border border-text-inverse/40 px-4 py-2 transition-colors hover:bg-text-inverse/10"
          >
            Carrinho ({quantidadeItens})
          </Link>
          <Link
            to="/entrar"
            className="rounded-button border border-text-inverse/30 px-4 py-2 transition-colors hover:bg-white/10"
          >
            Entrar
          </Link>
        </nav>
      </div>
    </header>
  );
}

export default CabecalhoPublico;