import { Link } from "react-router";
import type { Loja } from "../../schemas/loja";

interface CabecalhoLojaProps {
  loja: Loja;
}

function CabecalhoLoja({ loja }: CabecalhoLojaProps) {
  return (
    <header className="bg-primary px-5 py-4 text-text-inverse sm:py-5">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-6">
        <Link
          to={`/${loja.slug}`}
          className="flex items-center gap-3 text-xl font-extrabold tracking-wide hover:opacity-95"
          aria-label={`${loja.nome_comercial} - página inicial`}
        >
          {loja.logo_url ? (
            <img
              src={loja.logo_url}
              alt=""
              className="size-8 rounded-full object-cover border border-text-inverse/20"
            />
          ) : (
            <div className="flex size-8 items-center justify-center rounded-full bg-white/20 text-sm font-bold text-text-inverse">
              {loja.nome_comercial.charAt(0).toUpperCase()}
            </div>
          )}
          <span className="truncate">{loja.nome_comercial}</span>
        </Link>

        <nav aria-label="Navegação da loja" className="flex items-center gap-3">
          <Link
            to={`/${loja.slug}/buscar`}
            className="rounded-button border border-text-inverse/30 px-4 py-2 text-sm font-medium text-text-inverse transition-colors hover:bg-white/10"
          >
            Buscar peças
          </Link>
        </nav>
      </div>
    </header>
  );
}

export default CabecalhoLoja;
