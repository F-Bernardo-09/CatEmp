import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router";

import CabecalhoPublico from "../../components/layout/CabecalhoPublico";
import Rodape from "../../components/layout/Rodape";
import type { ItemCatalogoResumo } from "../../schemas/item";
import { listarItensCatalogo } from "../../services/catalogo";

const categoriasPorModalidade = {
  aluguel: [
    "Mesas diversas",
    "Vasos de flores",
    "Cortinas",
    "Tapetes",
    "Bandejas",
    "Arcos temáticos",
    "Luminárias",
    "Balões",
    "Cilindros",
    "Bancos",
    "Pratos",
    "Talheres",
    "Ursos",
  ],
  venda: ["Colchas de cama", "Cortinas"],
};

function formatarPreco(valor: number): string {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(valor);
}

function Buscar() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [itens, setItens] = useState<ItemCatalogoResumo[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [carregandoMais, setCarregandoMais] = useState(false);
  const [temMais, setTemMais] = useState(false);
  const [pagina, setPagina] = useState(1);

  const modalidade =
    searchParams.get("modalidade") === "venda" ? "venda" : "aluguel";
  const categoria = searchParams.get("categoria") ?? "";
  const busca = searchParams.get("q") ?? "";

  async function carregarCatalogo(proximaPagina = 1) {
    if (proximaPagina === 1) {
      setCarregando(true);
    } else {
      setCarregandoMais(true);
    }

    try {
      const resposta = await listarItensCatalogo({
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
    setPagina(1);
    void carregarCatalogo(1);
  }, [modalidade, categoria, busca]);

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

  const categoriasAtuais = categoriasPorModalidade[modalidade];

  return (
    <div className="flex min-h-screen flex-col bg-page text-text">
      <CabecalhoPublico />

      <main className="mx-auto flex w-full max-w-6xl flex-1 flex-col gap-8 px-4 py-8">
        <header className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-sm text-text-secondary">Catálogo</p>
            <h1 className="mt-1 text-3xl font-bold text-text">Buscar peças</h1>
          </div>

          <div className="flex flex-wrap gap-2">
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
              <span className="form-label">Buscar</span>
              <input
                className="form-control"
                value={busca}
                onChange={(evento) => alterarFiltro("q", evento.target.value)}
                placeholder="Ex.: vaso, mesa, cortina"
              />
            </label>

            <label className="form-field">
              <span className="form-label">Categoria</span>
              <select
                className="form-control"
                value={categoria}
                onChange={(evento) => alterarFiltro("categoria", evento.target.value)}
              >
                <option value="">Todas</option>
                {categoriasAtuais.map((nomeCategoria) => (
                  <option key={nomeCategoria} value={nomeCategoria}>
                    {nomeCategoria}
                  </option>
                ))}
              </select>
            </label>
          </div>
        </section>

        {carregando ? (
          <p className="text-sm text-text-secondary">Carregando itens...</p>
        ) : itens.length === 0 ? (
          <div className="rounded-card border border-dashed border-border bg-card p-8 text-center text-sm text-text-secondary">
            Nenhum item encontrado para a busca atual.
          </div>
        ) : (
          <>
            <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
              {itens.map((item) => (
                <article key={item.id} className="overflow-hidden rounded-card border border-border bg-card shadow-sm">
                  <Link to={`/loja/${item.loja_slug}`} className="block">
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
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-xs font-medium uppercase tracking-[0.08em] text-text-secondary">
                          {item.loja_nome}
                        </span>
                        <span className="text-xs font-medium text-primary">
                          {item.modalidade}
                        </span>
                      </div>

                      <div>
                        <h2 className="text-xl font-semibold text-text">{item.titulo}</h2>
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

            {temMais && (
              <div className="flex justify-center">
                <button
                  type="button"
                  onClick={() => {
                    const proximaPagina = pagina + 1;
                    setPagina(proximaPagina);
                    void carregarCatalogo(proximaPagina);
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
