import { Link } from "react-router";

function CabecalhoPublico() {
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

        <nav aria-label="Navegação principal">
          <Link
            to="/buscar"
            className="rounded-button border border-text-inverse/30 px-4 py-2 text-sm font-medium text-text-inverse transition-colors hover:bg-white/10"
          >
            Buscar peças
          </Link>
        </nav>
      </div>
    </header>
  );
}

export default CabecalhoPublico;
