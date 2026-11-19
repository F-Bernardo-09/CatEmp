import { Link } from "react-router";

import { useCarrinho } from "../../hooks/useCarrinho";

function CabecalhoPublico() {
  const { quantidadeItens } = useCarrinho();

  return (
    <header className="bg-primary px-5 py-4 text-text-inverse sm:py-5">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-6">
        <h1 className="shrink-0 text-xl font-extrabold tracking-[0.16em]">
          CATEMP
        </h1>

        <nav aria-label="Navegação principal" className="flex items-center gap-4">
          <Link
            to="/buscar"
            className="text-sm font-semibold transition-colors hover:text-surface"
          >
            Catálogo
          </Link>
          <Link
            to="/carrinho"
            className="rounded-full border border-text-inverse/40 px-4 py-2 text-sm font-semibold transition-colors hover:bg-text-inverse/10"
          >
            Carrinho ({quantidadeItens})
          </Link>
        </nav>
      </div>
    </header>
  );
}

export default CabecalhoPublico;
