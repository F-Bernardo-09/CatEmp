import { useEffect, useState } from "react";
import { useParams } from "react-router";

import CabecalhoPublico from "../../components/layout/CabecalhoPublico";
import Rodape from "../../components/layout/Rodape";
import { useCarrinho } from "../../hooks/useCarrinho";
import { buscarLojaPorSlug } from "../../services/lojas";
import { supabase } from "../../lib/supabase";
import type { Loja as LojaData } from "../../schemas/loja";
import type { ItemCatalogoResumo } from "../../schemas/item";

function formatarPreco(valor: number): string {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(valor);
}

function Loja() {
  const { slug } = useParams();
  const { adicionar } = useCarrinho();
  const [loja, setLoja] = useState<LojaData | null>(null);
  const [itens, setItens] = useState<ItemCatalogoResumo[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState("");
  const [adicionado, setAdicionado] = useState("");

  useEffect(() => {
    let ativo = true;

    async function carregar() {
      if (!slug) return;
      setCarregando(true);
      setErro("");

      try {
        const dadosLoja = await buscarLojaPorSlug(slug);
        if (!ativo) return;
        if (!dadosLoja) {
          setLoja(null);
          setItens([]);
          return;
        }

        setLoja(dadosLoja);
        const { data: dadosItens, error: erroItens } = await supabase
          .from("itens")
          .select(
            "id, loja_id, titulo, modalidade, descricao, preco_base, preco_reposicao, altura, largura, profundidade, em_destaque",
          )
          .eq("loja_id", dadosLoja.id)
          .eq("situacao", "disponivel")
          .order("em_destaque", { ascending: false })
          .order("criado_em", { ascending: false });

        if (erroItens) throw erroItens;

        const itensBase = dadosItens ?? [];
        const itemIds = itensBase.map((item) => item.id);
        const { data: fotos, error: erroFotos } = itemIds.length
          ? await supabase
              .from("fotos")
              .select("item_id, caminho_storage, principal")
              .in("item_id", itemIds)
              .order("posicao", { ascending: true })
          : { data: [], error: null };

        if (erroFotos) throw erroFotos;

        const fotosPorItem = new Map<string, string>();
        for (const foto of fotos ?? []) {
          const url = supabase.storage
            .from("fotos")
            .getPublicUrl(foto.caminho_storage).data.publicUrl;
          if (!fotosPorItem.has(foto.item_id) || foto.principal) {
            fotosPorItem.set(foto.item_id, url);
          }
        }

        setItens(
          itensBase.map((item) => ({
            id: item.id,
            loja_id: item.loja_id,
            loja_slug: dadosLoja.slug,
            loja_nome: dadosLoja.nome_comercial,
            titulo: item.titulo,
            modalidade: item.modalidade,
            descricao: item.descricao,
            preco_base: Number(item.preco_base),
            altura: Number(item.altura),
            largura: Number(item.largura),
            profundidade: Number(item.profundidade),
            foto_url: fotosPorItem.get(item.id),
            em_destaque: Boolean(item.em_destaque),
          })),
        );
      } catch (erroCarregamento) {
        console.error("Erro ao carregar loja pública:", erroCarregamento);
        if (ativo) {
          setErro(
            erroCarregamento instanceof Error
              ? erroCarregamento.message
              : "Não foi possível carregar a loja.",
          );
        }
      } finally {
        if (ativo) setCarregando(false);
      }
    }

    void carregar();
    return () => {
      ativo = false;
    };
  }, [slug]);

  async function adicionarAoCarrinho(item: ItemCatalogoResumo) {
    if (!loja) return;

    const { data, error } = await supabase
      .from("itens")
      .select("preco_reposicao")
      .eq("id", item.id)
      .single();

    if (error) {
      setErro(error.message);
      return;
    }

    adicionar({
      itemId: item.id,
      lojaId: loja.id,
      lojaSlug: loja.slug,
      lojaNome: loja.nome_comercial,
      lojaWhatsapp: loja.whatsapp,
      titulo: item.titulo,
      modalidade: item.modalidade,
      precoBase: item.preco_base,
      precoReposicao: Number(data.preco_reposicao),
      fotoUrl: item.foto_url,
    });
    setAdicionado(item.id);
    window.setTimeout(() => setAdicionado(""), 1800);
  }

  return (
    <div className="flex min-h-screen flex-col bg-page text-text">
      <CabecalhoPublico />
      <main className="mx-auto flex w-full max-w-6xl flex-1 flex-col gap-8 px-4 py-8">
        {carregando ? (
          <p role="status" className="text-sm text-text-secondary">
            Carregando loja...
          </p>
        ) : erro ? (
          <p role="alert" className="rounded border border-red-200 bg-red-50 p-4 text-sm text-red-700">
            {erro}
          </p>
        ) : !loja ? (
          <section className="rounded-card border border-dashed border-border bg-card p-8 text-center">
            <h1 className="text-2xl font-bold">Loja não encontrada</h1>
          </section>
        ) : (
          <>
            <header className="rounded-card border border-border bg-card p-6">
              <h1 className="text-3xl font-bold">{loja.nome_comercial}</h1>
              {loja.descricao && (
                <p className="mt-3 max-w-2xl text-text-secondary">
                  {loja.descricao}
                </p>
              )}
              {loja.cidade && loja.estado && (
                <p className="mt-2 text-sm text-text-secondary">
                  {loja.cidade}, {loja.estado}
                </p>
              )}
            </header>

            {itens.length === 0 ? (
              <p className="rounded-card border border-dashed border-border bg-card p-8 text-center text-text-secondary">
                Esta loja ainda não possui itens disponíveis.
              </p>
            ) : (
              <section
                aria-label="Itens disponíveis"
                className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3"
              >
                {itens.map((item) => (
                  <article
                    key={item.id}
                    className="overflow-hidden rounded-card border border-border bg-card"
                  >
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
                    <div className="flex flex-col gap-3 p-4">
                      <div>
                        <p className="text-xs uppercase tracking-[0.08em] text-text-secondary">
                          {item.modalidade === "aluguel"
                            ? "Aluguel"
                            : "Venda"}
                        </p>
                        <h2 className="mt-1 text-xl font-semibold">
                          {item.titulo}
                        </h2>
                      </div>
                      <p className="text-sm text-text-secondary">
                        {item.descricao}
                      </p>
                      <p className="text-sm text-text-secondary">
                        {item.altura} × {item.largura} × {item.profundidade} cm
                      </p>
                      <div className="flex items-center justify-between gap-3">
                        <strong>{formatarPreco(item.preco_base)}</strong>
                        <button
                          type="button"
                          onClick={() => void adicionarAoCarrinho(item)}
                          className="rounded-button bg-primary px-4 py-2 text-sm font-semibold text-text-inverse"
                        >
                          {adicionado === item.id
                            ? "Adicionado"
                            : "Adicionar"}
                        </button>
                      </div>
                    </div>
                  </article>
                ))}
              </section>
            )}
          </>
        )}
      </main>
      <Rodape />
    </div>
  );
}

export default Loja;