import { useEffect, useState } from "react";
import { Link, useParams } from "react-router";

import CabecalhoLoja from "../../components/layout/CabecalhoLoja";
import Rodape from "../../components/layout/Rodape";
import CarrosselDestaques from "../../components/catalogo/CarrosselDestaques";
import type { ItemDestaque } from "../../components/catalogo/types";
import type { Loja } from "../../schemas/loja";
import type { ItemCatalogoResumo } from "../../schemas/item";
import { buscarLojaPorSlug } from "../../services/lojas";
import { listarItensCatalogoDaLoja } from "../../services/catalogo";

function formatarPreco(valor: number): string {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(valor);
}

function LojaHome() {
  const { slug } = useParams<{ slug: string }>();
  const [loja, setLoja] = useState<Loja | null>(null);
  const [destaques, setDestaques] = useState<ItemDestaque[]>([]);
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

        // 1. Carrega destaques da loja
        const resDestaques = await listarItensCatalogoDaLoja({
          lojaId: lojaEncontrada.id,
          apenasDestaques: true,
          limit: 6,
        });

        const itensDestaqueMapeados: ItemDestaque[] = resDestaques.itens.map((it) => ({
          id: it.id,
          titulo: it.titulo,
          imagemUrl: it.foto_url || "https://images.unsplash.com/photo-1578749556568-bc2c40e68b61?auto=format&fit=crop&w=1800&q=85",
          link: `/${lojaEncontrada.slug}/item/${it.codigo_publico}`,
        }));
        setDestaques(itensDestaqueMapeados);

        // 2. Carrega catálogo geral da loja
        const resItens = await listarItensCatalogoDaLoja({
          lojaId: lojaEncontrada.id,
          page: 1,
          limit: 24,
        });

        setItens(resItens.itens);
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
        <main className="mx-auto flex w-full max-w-6xl flex-1 items-center justify-center px-4 py-8">
          <p className="text-sm text-text-secondary">Carregando loja...</p>
        </main>
        <Rodape />
      </div>
    );
  }

  if (naoEncontrada || !loja) {
    return (
      <div className="flex min-h-screen flex-col bg-page text-text">
        <main className="mx-auto flex w-full max-w-6xl flex-1 flex-col items-center justify-center px-4 py-16 text-center">
          <h1 className="text-2xl font-bold text-text">Loja não encontrada</h1>
          <p className="mt-2 text-text-secondary">
            A loja que você está tentando acessar não existe ou está desativada.
          </p>
        </main>
        <Rodape />
      </div>
    );
  }

  if (erro) {
    return (
      <div className="flex min-h-screen flex-col bg-page text-text">
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
      <CabecalhoLoja loja={loja} />

      <main className="flex-1">
        {/* Capa da loja */}
        <div className="relative h-48 w-full overflow-hidden bg-surface sm:h-64">
          {loja.capa_url ? (
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
              {loja.logo_url ? (
                <img
                  src={loja.logo_url}
                  alt={loja.nome_comercial}
                  className="h-full w-full object-cover"
                />
              ) : (
                <div className="flex h-full items-center justify-center text-2xl font-bold text-text-secondary">
                  {loja.nome_comercial.charAt(0).toUpperCase()}
                </div>
              )}
            </div>

            <div className="pb-1">
              <h1 className="text-2xl font-bold text-text">{loja.nome_comercial}</h1>
              {loja.cidade && loja.estado && (
                <p className="mt-0.5 text-sm text-text-secondary">
                  {loja.cidade}, {loja.estado}
                </p>
              )}
            </div>
          </div>

          {loja.descricao && (
            <p className="mb-8 max-w-2xl text-sm text-text-secondary">{loja.descricao}</p>
          )}

          {/* Destaques da loja */}
          {destaques.length > 0 && (
            <section className="mb-10">
              <h2 className="mb-4 text-xl font-bold text-text">Destaques</h2>
              <CarrosselDestaques itens={destaques} />
            </section>
          )}

          {/* Catálogo da loja */}
          <section className="pb-12">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-xl font-bold text-text">
                Catálogo da loja
              </h2>
              <Link
                to={`/${loja.slug}/buscar`}
                className="text-sm font-semibold text-primary hover:underline"
              >
                Buscar com filtros →
              </Link>
            </div>

            {itens.length === 0 ? (
              <div className="rounded-card border border-dashed border-border bg-card p-8 text-center text-sm text-text-secondary">
                Nenhum item disponível nesta loja no momento.
              </div>
            ) : (
              <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
                {itens.map((item) => (
                  <article
                    key={item.id}
                    className="overflow-hidden rounded-card border border-border bg-card shadow-sm transition hover:shadow-md"
                  >
                    <Link to={`/${loja.slug}/item/${item.codigo_publico}`} className="block">
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
                        <span className="text-xs font-medium text-primary uppercase">
                          {item.modalidade}
                        </span>

                        <div>
                          <h3 className="text-lg font-semibold text-text">{item.titulo}</h3>
                          <p className="mt-1 line-clamp-2 text-sm text-text-secondary">{item.descricao}</p>
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

export default LojaHome;
