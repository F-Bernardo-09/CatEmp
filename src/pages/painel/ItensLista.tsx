import { useEffect, useState } from "react";
import { Link } from "react-router";

import LayoutPainel from "../../components/layout/LayoutPainel";
import type { ItemListaResumo, ItemModalidade, ItemSituacao } from "../../schemas/item";
import {
  alterarSituacaoItem,
  excluirItem,
  listarItensDaLoja,
} from "../../services/itens";

const modalidades: Array<{ value: ItemModalidade | ""; label: string }> = [
  { value: "", label: "Todas" },
  { value: "aluguel", label: "Aluguel" },
  { value: "venda", label: "Venda" },
];

const situacoes: Array<{ value: ItemSituacao | ""; label: string }> = [
  { value: "", label: "Todos" },
  { value: "disponivel", label: "Disponível" },
  { value: "manutencao", label: "Em manutenção" },
  { value: "oculto", label: "Oculto" },
];

function formatarPreco(valor: number): string {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(valor);
}

function ItensLista() {
  const [itens, setItens] = useState<ItemListaResumo[]>([]);
  const [modalidade, setModalidade] = useState<ItemModalidade | "">("");
  const [situacao, setSituacao] = useState<ItemSituacao | "">("");
  const [busca, setBusca] = useState("");
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState("");

  async function carregarItens() {
    setCarregando(true);
    setErro("");

    try {
      setItens(
        await listarItensDaLoja({
          modalidade: modalidade || undefined,
          situacao: situacao || undefined,
          busca: busca.trim() || undefined,
        }),
      );
    } catch (erroCarregamento) {
      console.error("Erro ao carregar itens:", erroCarregamento);
      setErro(
        erroCarregamento instanceof Error
          ? erroCarregamento.message
          : "Não foi possível carregar os itens.",
      );
    } finally {
      setCarregando(false);
    }
  }

  useEffect(() => {
    void carregarItens();
  }, [modalidade, situacao, busca]);

  async function publicar(itemId: string) {
    await alterarSituacaoItem(itemId, "disponivel");
    await carregarItens();
  }

  async function arquivar(itemId: string) {
    await alterarSituacaoItem(itemId, "oculto");
    await carregarItens();
  }

  async function remover(itemId: string) {
    const confirmado = window.confirm("Deseja excluir este item? A foto também será removida do Storage.");
    if (!confirmado) return;

    try {
      await excluirItem(itemId);
      await carregarItens();
    } catch (erroExclusao) {
      console.error("Erro ao excluir item:", erroExclusao);
      setErro(
        erroExclusao instanceof Error
          ? erroExclusao.message
          : "Não foi possível excluir o item.",
      );
    }
  }

  return (
    <LayoutPainel>
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-6">
        <header className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-sm text-text-secondary">Painel da loja</p>
            <h1 className="mt-1 text-2xl font-bold text-text">Itens do catálogo</h1>
          </div>

          <Link
            to="/painel/itens/novo"
            className="rounded-button bg-primary px-5 py-3 text-sm font-semibold text-text-inverse transition-colors hover:bg-primary-hover"
          >
            Novo item
          </Link>
        </header>

        <section className="rounded-card border border-border bg-card p-4">
          <div className="grid gap-4 md:grid-cols-[1.5fr_1fr_1fr]">
            <label className="form-field">
              <span className="form-label">Buscar por nome</span>
              <input
                className="form-control"
                value={busca}
                onChange={(evento) => setBusca(evento.target.value)}
                placeholder="Ex.: vaso, mesa..."
              />
            </label>

            <label className="form-field">
              <span className="form-label">Modalidade</span>
              <select
                className="form-control"
                value={modalidade}
                onChange={(evento) => setModalidade(evento.target.value as ItemModalidade | "")}
              >
                {modalidades.map((opcao) => (
                  <option key={opcao.value || "todas"} value={opcao.value}>
                    {opcao.label}
                  </option>
                ))}
              </select>
            </label>

            <label className="form-field">
              <span className="form-label">Status</span>
              <select
                className="form-control"
                value={situacao}
                onChange={(evento) => setSituacao(evento.target.value as ItemSituacao | "")}
              >
                {situacoes.map((opcao) => (
                  <option key={opcao.value || "todos"} value={opcao.value}>
                    {opcao.label}
                  </option>
                ))}
              </select>
            </label>
          </div>
        </section>

        {erro && (
          <p role="alert" className="rounded border border-red-200 bg-red-50 p-3 text-sm text-red-700">
            {erro}
          </p>
        )}

        {carregando ? (
          <p className="text-sm text-text-secondary">Carregando itens...</p>
        ) : itens.length === 0 ? (
          <div className="rounded-card border border-dashed border-border bg-card p-8 text-center text-sm text-text-secondary">
            Nenhum item encontrado com os filtros atuais.
          </div>
        ) : (
          <div className="grid gap-4">
            {itens.map((item) => (
              <article key={item.id} className="flex flex-col gap-4 rounded-card border border-border bg-card p-4 md:flex-row md:items-center">
                <div className="h-24 w-full overflow-hidden rounded border border-border bg-surface md:w-32">
                  {item.foto_url ? (
                    <img src={item.foto_url} alt={item.titulo} className="h-full w-full object-cover" />
                  ) : (
                    <div className="flex h-full items-center justify-center text-xs text-text-secondary">
                      Sem imagem
                    </div>
                  )}
                </div>

                <div className="flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <h2 className="text-lg font-semibold text-text">{item.titulo}</h2>
                    <span className="rounded-full border border-border bg-white px-2 py-1 text-[10px] uppercase tracking-[0.08em] text-text-secondary">
                      {item.modalidade}
                    </span>
                    <span className="rounded-full border border-border bg-white px-2 py-1 text-[10px] uppercase tracking-[0.08em] text-text-secondary">
                      {item.situacao}
                    </span>
                  </div>

                  <p className="mt-2 text-sm text-text-secondary">
                    {formatarPreco(item.preco_base)}
                  </p>
                </div>

                <div className="flex flex-wrap gap-2 md:justify-end">
                  {item.situacao !== "disponivel" && (
                    <button
                      type="button"
                      onClick={() => void publicar(item.id)}
                      className="rounded-button border border-border bg-white px-3 py-2 text-xs font-semibold text-text transition-colors hover:bg-surface"
                    >
                      Publicar
                    </button>
                  )}

                  {item.situacao === "disponivel" && (
                    <button
                      type="button"
                      onClick={() => void arquivar(item.id)}
                      className="rounded-button border border-border bg-white px-3 py-2 text-xs font-semibold text-text transition-colors hover:bg-surface"
                    >
                      Arquivar
                    </button>
                  )}

                  <button
                    type="button"
                    onClick={() => void remover(item.id)}
                    className="rounded-button border border-red-200 bg-red-50 px-3 py-2 text-xs font-semibold text-red-700 transition-colors hover:bg-red-100"
                  >
                    Excluir
                  </button>
                </div>
              </article>
            ))}
          </div>
        )}
      </div>
    </LayoutPainel>
  );
}

export default ItensLista;
