import { useEffect, useState } from "react";
import { Link } from "react-router";

import LayoutPainel from "../../components/layout/LayoutPainel";
import { useAuth } from "../../hooks/useAuth";
import { useLojaDoUsuario } from "../../hooks/useLojaDoUsuario";
import type { ResumoPainel as ResumoPainelDados } from "../../services/resumoPainel";
import { obterResumoPainel } from "../../services/resumoPainel";

const RESUMO_VAZIO: ResumoPainelDados = {
  itensPublicados: 0,
  itensRascunho: 0,
  fotosCadastradas: 0,
};

function avisoLojaInativa(situacao: string): string {
  if (situacao === "pendente") {
    return "Sua loja aguarda ativação e ainda não aparece no catálogo público.";
  }
  if (situacao === "suspensa") {
    return "Sua loja está suspensa e não aparece no catálogo público.";
  }
  return "Sua loja está encerrada e não aparece no catálogo público.";
}

function PainelInicio() {
  const { perfil } = useAuth();
  const {
    loja,
    carregando: carregandoLoja,
    erro: erroLoja,
    atualizar: atualizarLoja,
  } = useLojaDoUsuario();
  const [resumo, setResumo] = useState<ResumoPainelDados | null>(null);
  const [carregandoResumo, setCarregandoResumo] = useState(true);
  const [erroResumo, setErroResumo] = useState("");
  const [tentativaResumo, setTentativaResumo] = useState(0);

  const nomeUsuario = perfil?.nome || "Usuário";

  useEffect(() => {
    if (carregandoLoja) return;

    let ativo = true;

    async function carregarResumo() {
      setCarregandoResumo(true);
      setErroResumo("");
      setResumo(null);

      if (!loja) {
        setResumo(erroLoja ? null : RESUMO_VAZIO);
        setCarregandoResumo(false);
        return;
      }

      try {
        const dados = await obterResumoPainel(loja.id);
        if (ativo) setResumo(dados);
      } catch (erro) {
        console.error("Erro ao carregar resumo do painel:", erro);
        if (ativo) {
          setErroResumo(
            erro instanceof Error
              ? erro.message
              : "Não foi possível carregar o resumo da loja.",
          );
        }
      } finally {
        if (ativo) setCarregandoResumo(false);
      }
    }

    void carregarResumo();

    return () => {
      ativo = false;
    };
  }, [carregandoLoja, erroLoja, loja, tentativaResumo]);

  function tentarNovamente() {
    if (erroLoja) {
      void atualizarLoja();
      return;
    }
    setTentativaResumo((tentativa) => tentativa + 1);
  }

  const mostrandoResumo = carregandoLoja || carregandoResumo;
  const dadosResumo =
    resumo ?? (!erroLoja && !erroResumo ? RESUMO_VAZIO : null);

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

        {loja && loja.situacao !== "ativa" && (
          <aside
            role="status"
            className="rounded-card border border-amber-300 bg-amber-50 p-4 text-sm text-amber-900"
          >
            <p className="font-semibold">Loja inativa</p>
            <p className="mt-1">{avisoLojaInativa(loja.situacao)}</p>
            <Link
              to="/painel/loja"
              className="mt-2 inline-block font-semibold underline"
            >
              Ver configurações da loja
            </Link>
          </aside>
        )}

        {(erroLoja || erroResumo) && (
          <div
            role="alert"
            className="flex flex-wrap items-center justify-between gap-3 rounded border border-red-200 bg-red-50 p-3 text-sm text-red-700"
          >
            <span>{erroLoja || erroResumo}</span>
            <button
              type="button"
              onClick={tentarNovamente}
              className="font-semibold underline"
            >
              Tentar novamente
            </button>
          </div>
        )}

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

          {loja?.slug ? (
            <Link
              to={`/${loja.slug}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center rounded-button border border-border bg-white px-6 py-3 text-sm font-semibold text-text transition-colors hover:bg-surface"
            >
              Ver minha loja pública ↗
            </Link>
          ) : (
            <Link
              to="/painel/loja"
              className="flex items-center justify-center rounded-button border border-border bg-white px-6 py-3 text-sm font-semibold text-text transition-colors hover:bg-surface"
            >
              Configurar loja
            </Link>
          )}
        </section>

        {/* Resumo da loja */}
        <section aria-labelledby="resumo-titulo">
          <h2 id="resumo-titulo" className="mb-4 text-lg font-bold text-text">
            Resumo da loja
          </h2>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <article className="rounded-card border border-border bg-white p-5">
              <h3 className="text-sm text-text-secondary">Itens publicados</h3>

              <p className="mt-3 text-3xl font-bold text-text" aria-live="polite">
                {mostrandoResumo || !dadosResumo
                  ? "--"
                  : dadosResumo.itensPublicados}
              </p>
            </article>

            <article className="rounded-card border border-border bg-white p-5">
              <h3 className="text-sm text-text-secondary">Rascunhos</h3>

              <p className="mt-3 text-3xl font-bold text-text" aria-live="polite">
                {mostrandoResumo || !dadosResumo
                  ? "--"
                  : dadosResumo.itensRascunho}
              </p>
            </article>

            <article className="rounded-card border border-border bg-white p-5">
              <h3 className="text-sm text-text-secondary">
                Fotos cadastradas
              </h3>

              <p className="mt-3 text-3xl font-bold text-text" aria-live="polite">
                {mostrandoResumo || !dadosResumo
                  ? "--"
                  : dadosResumo.fotosCadastradas}
              </p>
            </article>
          </div>
        </section>
      </div>
    </LayoutPainel>
  );
}

export default PainelInicio;
