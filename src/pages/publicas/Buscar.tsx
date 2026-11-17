import { useEffect, useState } from "react";
import { Link, useParams, useSearchParams } from "react-router";

import CabecalhoLoja from "../../components/layout/CabecalhoLoja";
import Rodape from "../../components/layout/Rodape";
import type { ItemCatalogoResumo } from "../../schemas/item";
import type { Loja } from "../../schemas/loja";
import { buscarLojaPorSlug } from "../../services/lojas";
import {
  listarCategoriasPublicasDaLoja,
  listarItensCatalogoDaLoja,
} from "../../services/catalogo";

function formatarPreco(valor: number): string {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(valor);
}

function Buscar() {
  const { slug } = useParams<{ slug: string }>();
  const [searchParams, setSearchParams] = useSearchParams();
  const [loja, setLoja] = useState<Loja | null>(null);
  const [itens, setItens] = useState<ItemCatalogoResumo[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [carregandoMais, setCarregandoMais] = useState(false);
  const [temMais, setTemMais] = useState(false);
  const [pagina, setPagina] = useState(1);
  const [categorias, setCategorias] = useState<{ id: string; nome: string; slug: string }[]>([]);
  const [naoEncontrada, setNaoEncontrada] = useState(false);

  const modalidade =
    searchParams.get("modalidade") === "venda"
      ? "venda"
      : searchParams.get("modalidade") === "aluguel"
        ? "aluguel"
        : undefined;
  const categoria = searchParams.get("categoria") ?? "";
  const busca = searchParams.get("q") ?? "";

  useEffect(() => {
    if (!slug) return;

    async function carregarLoja() {
      try {
        const lojaEncontrada = await buscarLojaPorSlug(slug!);
        if (!lojaEncontrada || lojaEncontrada.situacao !== "ativa") {
          setNaoEncontrada(true);
          return;
        }
        setLoja(lojaEncontrada);
      } catch (err) {
        console.error(err);
        setNaoEncontrada(true);
      }
    }

    void carregarLoja();
  }, [slug]);

  useEffect(() => {
    if (!loja) return;

    void listarCategoriasPublicasDaLoja(loja.id, modalidade)
      .then(setCategorias)
      .catch(console.error);
  }, [loja, modalidade]);

  async function carregarItens(proximaPagina = 1) {
    if (!loja) return;

    if (proximaPagina === 1) {
      setCarregando(true);
    } else {
      setCarregandoMais(true);
    }

    try {
      const resposta = await listarItensCatalogoDaLoja({
        lojaId: loja.id,
        modalidade,
        categoria: categoria || undefined,
        busca: busca || undefined,
        page: proximaPagina,
        limit: 12,
      });

      setItens((atual) =>
        proximaPagina === 1 ? resposta.itens : [...atual, ...resposta.itens],
      );
      setTemMais(resposta.temMais);
    } finally {
      setCarregando(false);
      setCarregandoMais(false);
    }
  }

  useEffect(() => {
    if (!loja) return;
    setPagina(1);
    void carregarItens(1);
  }, [loja, modalidade, categoria, busca]);

  function alterarFiltro(chave: "modalidade" | "categoria" | "q", valor: string) {
    const params = new URLSearchParams(searchParams);

    if (valor) {
      params.set(chave, valor);
    } else {
      params.delete(chave);
    }

    if (chave === "modalidade") {
      params.delete("categoria");
    }

    setSearchParams(params);
  }

  if (naoEncontrada) {
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

  return (
    <div className="flex min-h-screen flex-col bg-page text-text">
      {loja ? (
        <CabecalhoLoja loja={loja} />
      ) : (
        <header className="bg-primary px-5 py-4 text-text-inverse sm:py-5">
          <div className="mx-auto max-w-7xl">
            <span className="font-bold">Carregando loja...</span>
          </div>
        </header>
      )}

      <main className="mx-auto flex w-full max-w-6xl flex-1 flex-col gap-8 px-4 py-8">
        <header className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <nav className="text-xs text-text-secondary">
              <Link to={`/${slug}`} className="hover:text-primary">
                {loja?.nome_comercial ?? "Loja"}
              </Link>{" "}
              / <span>Busca</span>
            </nav>
            <h1 className="mt-1 text-3xl font-bold text-text">Buscar produtos e serviços</h1>
          </div>

          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => alterarFiltro("modalidade", "")}
              className={[
                "rounded-full px-4 py-2 text-sm font-medium transition-colors",
                !modalidade
                  ? "bg-primary text-text-inverse"
                  : "border border-border bg-white text-text hover:bg-surface",
              ].join(" ")}
            >
              Todos
            </button>
            {(["aluguel", "venda"] as const).map((tipo) => (
              <button
                key={tipo}
                type="button"
                onClick={() => alterarFiltro("modalidade", tipo)}
                className={[
                  "rounded-full px-4 py-2 text-sm font-medium transition-colors",
                  modalidade === tipo
                    ? "bg-primary text-text-inverse"
                    : "border border-border bg-white text-text hover:bg-surface",
                ].join(" ")}
              >
                {tipo === "aluguel" ? "Aluguel" : "Venda"}
              </button>
            ))}
          </div>
        </header>

        <section className="rounded-card border border-border bg-card p-4">
          <div className="grid gap-4 md:grid-cols-[1.4fr_1fr]">
            <label className="form-field">
              <span className="form-label">Buscar na loja</span>
              <input
                className="form-control"
                value={busca}
                onChange={(evento) => alterarFiltro("q", evento.target.value)}
                placeholder="Ex.: vaso, mesa, bolo..."
              />
            </label>

            <label className="form-field">
              <span className="form-label">Categoria</span>
              <select
                className="form-control"
                value={categoria}
                onChange={(evento) => alterarFiltro("categoria", evento.target.value)}
              >
                <option value="">Todas as categorias</option>
                {categorias.map((cat) => (
                  <option key={cat.id} value={cat.nome}>
                    {cat.nome}
                  </option>
                ))}
              </select>
            </label>
          </div>
        </section>

        {carregando ? (
          <p className="text-sm text-text-secondary">Carregando itens da loja...</p>
        ) : itens.length === 0 ? (
          <div className="rounded-card border border-dashed border-border bg-card p-8 text-center text-sm text-text-secondary">
            Nenhum item encontrado nesta loja para os filtros atuais.
          </div>
        ) : (
          <>
            <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
              {itens.map((item) => (
                <article key={item.id} className="overflow-hidden rounded-card border border-border bg-card shadow-sm transition hover:shadow-md">
                  <Link to={`/${slug}/item/${item.codigo_publico}`} className="block">
                    <div className="h-56 overflow-hidden bg-surface">
                      {item.foto_url ? (
                        <img src={item.foto_url} alt={item.titulo} className="h-full w-full object-cover" />
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
                        <h2 className="text-xl font-semibold text-text">{item.titulo}</h2>
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

            {temMais && (
              <div className="flex justify-center">
                <button
                  type="button"
                  onClick={() => {
                    const proximaPagina = pagina + 1;
                    setPagina(proximaPagina);
                    void carregarItens(proximaPagina);
                  }}
                  disabled={carregandoMais}
                  className="rounded-button border border-border bg-white px-6 py-3 text-sm font-semibold text-text transition-colors hover:bg-surface disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {carregandoMais ? "Carregando..." : "Carregar mais"}
                </button>
              </div>
            )}
          </>
        )}
      </main>

      <Rodape />
    </div>
  );
}

export default Buscar;
