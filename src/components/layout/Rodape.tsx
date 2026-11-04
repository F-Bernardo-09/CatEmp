import { Link } from "react-router";

function Rodape() {
  return (
    <footer className="bg-primary text-text-inverse">
      <div className="mx-auto flex max-w-7xl flex-col gap-6 px-5 py-10 sm:flex-row sm:items-center sm:justify-between sm:px-8">
        <Link
          to="/"
          className="text-lg font-extrabold tracking-[0.16em]"
          aria-label="CATEMP - página inicial"
        >
          CATEMP
        </Link>

        <nav aria-label="Navegação do rodapé">
          <ul className="flex flex-wrap gap-x-6 gap-y-3 text-sm">
            <li>
              <Link
                className="transition-colors hover:text-text-secondary"
                to="/entrar"
              >
                Entrar
              </Link>
            </li>
          </ul>
        </nav>
      </div>
      <div className="border-t border-border/20">
        <p className="mx-auto max-w-7xl px-5 py-4 text-xs text-text-secondary sm:px-8">
          © {new Date().getFullYear()} CATEMP. Todos os direitos reservados.
        </p>
      </div>
    </footer>
  );
}

export default Rodape;
