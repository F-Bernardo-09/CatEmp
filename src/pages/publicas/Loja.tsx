import { useEffect, useState } from "react";
import { Link, useParams } from "react-router";

import CabecalhoPublico from "../../components/layout/CabecalhoPublico";
import Rodape from "../../components/layout/Rodape";
import type { Loja } from "../../schemas/loja";
import type { ItemCatalogoResumo } from "../../schemas/item";
import { buscarLojaPorSlug } from "../../services/lojas";
import { listarItensCatalogo } from "../../services/catalogo";

function formatarPreco(valor: number): string {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(valor);
}

function Loja() {
  const { slug } = useParams<{ slug: string }>();
  const [loja, setLoja] = useState<Loja | null>(null);
  const [itens, setItens] = useState<ItemCatalogoResumo[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [naoEncontrada, setNaoEncontrada] = useState(false);
  const [erro, setErro] = useState("");

  useEffect(() => {
    if (!slug) return;

    setCarregando(true);
    setNaoEncontrada(false);
    setErro("");

    async function carregar() {
      try {
        const lojaEncontrada = await buscarLojaPorSlug(slug!);

        if (!lojaEncontrada || lojaEncontrada.situacao !== "ativa") {
          setNaoEncontrada(true);
          return;
        }

        setLoja(lojaEncontrada);

        const { itens: itensEncontrados } = await listarItensCatalogo({
          page: 1,
          limit: 24,
        });

        // Filtra os itens da loja atual
        setItens(itensEncontrados.filter((item) => item.loja_slug === slug));
      } catch (erroCarregamento) {
        console.error("Erro ao carregar loja:", erroCarregamento);
        setErro(
          erroCarregamento instanceof Error
            ? erroCarregamento.message
            : "Não foi possível carregar a loja.",
        );
      } finally {
        setCarregando(false);
      }
    }

    void carregar();
  }, [slug]);

  if (carregando) {
    return (
      <div className="flex min-h-screen flex-col bg-page text-text">
        <CabecalhoPublico />
        <main className="mx-auto flex w-full max-w-6xl flex-1 px-4 py-8">
          <p className="text-sm text-text-secondary">Carregando loja...</p>
        </main>
        <Rodape />
      </div>
    );
  }

  if (naoEncontrada) {
    return (
      <div className="flex min-h-screen flex-col bg-page text-text">
        <CabecalhoPublico />
        <main className="mx-auto flex w-full max-w-6xl flex-1 flex-col items-center justify-center px-4 py-16 text-center">
          <p className="text-text-secondary">Loja não encontrada.</p>
          <Link
            to="/buscar"
            className="mt-4 rounded-button bg-primary px-5 py-3 text-sm font-semibold text-text-inverse transition-colors hover:bg-primary-hover"
          >
            Voltar ao catálogo
          </Link>
        </main>
        <Rodape />
      </div>
    );
  }

  if (erro) {
    return (
      <div className="flex min-h-screen flex-col bg-page text-text">
        <CabecalhoPublico />
        <main className="mx-auto flex w-full max-w-6xl flex-1 px-4 py-8">
          <p role="alert" className="rounded border border-red-200 bg-red-50 p-3 text-sm text-red-700">
            {erro}
          </p>
        </main>
        <Rodape />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col bg-page text-text">
      <CabecalhoPublico />

      <main className="flex-1">
        {/* Capa da loja */}
        <div className="relative h-48 w-full overflow-hidden bg-surface sm:h-64">
          {loja?.capa_url ? (
            <img
              src={loja.capa_url}
              alt=""
              className="h-full w-full object-cover"
            />
          ) : (
            <div className="h-full w-full bg-gradient-to-br from-primary/10 to-surface" />
          )}
        </div>

        <div className="mx-auto max-w-6xl px-4">
          {/* Perfil da loja */}
          <div className="-mt-10 mb-8 flex items-end gap-4">
            <div className="size-20 shrink-0 overflow-hidden rounded-full border-4 border-card bg-surface shadow-md">
              {loja?.logo_url ? (
                <img
                  src={loja.logo_url}
                  alt={loja.nome_comercial}
                  className="h-full w-full object-cover"
                />
              ) : (
                <div className="flex h-full items-center justify-center text-2xl font-bold text-text-secondary">
                  {loja?.nome_comercial.charAt(0).toUpperCase()}
                </div>
              )}
            </div>

            <div className="pb-1">
              <h1 className="text-2xl font-bold text-text">{loja?.nome_comercial}</h1>
              {loja?.cidade && loja.estado && (
                <p className="mt-0.5 text-sm text-text-secondary">
                  {loja.cidade}, {loja.estado}
                </p>
              )}
            </div>
          </div>

          {loja?.descricao && (
            <p className="mb-8 max-w-2xl text-sm text-text-secondary">{loja.descricao}</p>
          )}

          {/* Itens da loja */}
          <section>
            <h2 className="mb-4 text-lg font-semibold text-text">
              Itens disponíveis
            </h2>

            {itens.length === 0 ? (
              <div className="rounded-card border border-dashed border-border bg-card p-8 text-center text-sm text-text-secondary">
                Nenhum item disponível nesta loja no momento.
              </div>
            ) : (
              <div className="grid gap-5 pb-12 sm:grid-cols-2 xl:grid-cols-3">
                {itens.map((item) => (
                  <article
                    key={item.id}
                    className="overflow-hidden rounded-card border border-border bg-card shadow-sm"
                  >
                    <Link to={`/produto/${item.id}`} className="block">
                      <div className="h-56 overflow-hidden bg-surface">
                        {item.foto_url ? (
                          <img
                            src={item.foto_url}
                            alt={item.titulo}
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          <div className="flex h-full items-center justify-center text-sm text-text-secondary">
                            Sem imagem
                          </div>
                        )}
                      </div>

                      <div className="space-y-3 p-4">
                        <span className="text-xs font-medium text-primary">
                          {item.modalidade}
                        </span>

                        <div>
                          <h3 className="text-lg font-semibold text-text">{item.titulo}</h3>
                          <p className="mt-1 text-sm text-text-secondary">{item.descricao}</p>
                        </div>

                        <div className="flex items-center justify-between text-sm text-text-secondary">
                          <span>{item.altura} × {item.largura} × {item.profundidade} cm</span>
                          <strong className="text-base font-semibold text-text">
                            {formatarPreco(item.preco_base)}
                          </strong>
                        </div>
                      </div>
                    </Link>
                  </article>
                ))}
              </div>
            )}
          </section>
        </div>
      </main>

      <Rodape />
    </div>
  );
}

export default Loja;
