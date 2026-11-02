import { Link } from "react-router";

import LayoutPainel from "../../components/layout/LayoutPainel";
import { useAuth } from "../../hooks/useAuth";

function PainelInicio() {
  const { perfil } = useAuth();

  const nomeUsuario = perfil?.nome || "Usuário";

  return (
    <LayoutPainel>
      <div className="flex flex-col gap-8">
        {/* Cabeçalho */}
        <header className="flex items-center justify-between gap-4">
          <div>
            <p className="text-sm text-text-secondary">Olá, {nomeUsuario}</p>

            <h1 className="mt-1 text-2xl font-bold text-text">
              Painel da loja
            </h1>

            <p className="mt-1 text-sm text-text-secondary">
              Gerencie os produtos e serviços da sua loja.
            </p>
          </div>

          <div
            className="flex size-12 shrink-0 items-center justify-center rounded-full border border-border bg-white text-lg font-bold text-text"
            aria-hidden="true"
          >
            {nomeUsuario.charAt(0).toUpperCase()}
          </div>
        </header>

        {/* Ações principais */}
        <section
          aria-label="Ações principais"
          className="flex flex-col gap-3 sm:flex-row"
        >
          <Link
            to="/painel/itens/novo"
            className="flex items-center justify-center rounded-button bg-primary px-6 py-3 text-sm font-semibold text-text-inverse transition-colors hover:bg-primary-hover"
          >
            Adicionar produto/serviço
          </Link>

          <Link
            to="/painel/loja"
            className="flex items-center justify-center rounded-button border border-border bg-white px-6 py-3 text-sm font-semibold text-text transition-colors hover:bg-surface"
          >
            Ver minha loja
          </Link>
        </section>

        {/* Resumo da loja */}
        <section aria-labelledby="resumo-titulo">
          <h2 id="resumo-titulo" className="mb-4 text-lg font-bold text-text">
            Resumo da loja
          </h2>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <article className="rounded-card border border-border bg-white p-5">
              <h3 className="text-sm text-text-secondary">Itens publicados</h3>

              <p className="mt-3 text-3xl font-bold text-text">--</p>
            </article>

            <article className="rounded-card border border-border bg-white p-5">
              <h3 className="text-sm text-text-secondary">Rascunhos</h3>

              <p className="mt-3 text-3xl font-bold text-text">--</p>
            </article>

            <article className="rounded-card border border-border bg-white p-5">
              <h3 className="text-sm text-text-secondary">
                Armazenamento de fotos
              </h3>

              <p className="mt-3 text-3xl font-bold text-text">--</p>
            </article>
          </div>
        </section>

        {/* Aviso de loja inativa será integrado posteriormente */}
      </div>
    </LayoutPainel>
  );
}

export default PainelInicio;
