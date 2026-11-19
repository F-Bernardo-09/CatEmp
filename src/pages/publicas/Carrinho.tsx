import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router";

import CabecalhoPublico from "../../components/layout/CabecalhoPublico";
import Rodape from "../../components/layout/Rodape";
import { useCarrinho } from "../../hooks/useCarrinho";
import {
  criarUrlCarrinho,
  lerCarrinhoDaUrl,
  serializarCarrinhoParaUrl,
} from "../../lib/carrinhoUrl";
import {
  criarUrlWhatsApp,
  montarMensagemPedido,
} from "../../lib/whatsapp";

function formatarPreco(valor: number): string {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(valor);
}

function Carrinho() {
  const [searchParams, setSearchParams] = useSearchParams();
  const {
    itens,
    quantidadeItens,
    total,
    remover,
    alterarQuantidade,
    substituir,
    limpar,
  } = useCarrinho();
  const [urlCompartilhavel, setUrlCompartilhavel] = useState("");
  const [copiado, setCopiado] = useState(false);

  useEffect(() => {
    const itensDaUrl = lerCarrinhoDaUrl(searchParams.toString());
    if (itensDaUrl) {
      substituir(itensDaUrl);
      setUrlCompartilhavel(
        criarUrlCarrinho(itensDaUrl, window.location.origin),
      );
    }
  }, []);

  useEffect(() => {
    if (searchParams.has("c")) return;
    setUrlCompartilhavel(criarUrlCarrinho(itens, window.location.origin));
  }, [itens, searchParams]);

  function atualizarUrl() {
    setSearchParams(
      new URLSearchParams(serializarCarrinhoParaUrl(itens).slice(1)),
    );
  }

  async function copiarLink() {
    const link = criarUrlCarrinho(itens, window.location.origin);
    await navigator.clipboard.writeText(link);
    setCopiado(true);
    window.setTimeout(() => setCopiado(false), 2000);
  }

  const lojas = [
    ...new Map(
      itens.map((item) => [
        item.lojaId,
        {
          id: item.lojaId,
          nome: item.lojaNome,
          whatsapp: item.lojaWhatsapp,
        },
      ]),
    ).values(),
  ];

  return (
    <div className="flex min-h-screen flex-col bg-page text-text">
      <CabecalhoPublico />

      <main className="mx-auto flex w-full max-w-5xl flex-1 flex-col gap-8 px-4 py-8">
        <header>
          <p className="text-sm text-text-secondary">Pedido</p>
          <h1 className="mt-1 text-3xl font-bold">Carrinho</h1>
          <p className="mt-2 text-sm text-text-secondary">
            {quantidadeItens}{" "}
            {quantidadeItens === 1
              ? "item selecionado"
              : "itens selecionados"}
          </p>
        </header>

        {itens.length === 0 ? (
          <section className="rounded-card border border-dashed border-border bg-card p-8 text-center">
            <p className="text-text-secondary">Seu carrinho está vazio.</p>
            <Link
              to="/buscar"
              className="mt-5 inline-flex rounded-button bg-primary px-6 py-3 text-sm font-semibold text-text-inverse"
            >
              Buscar peças
            </Link>
          </section>
        ) : (
          <>
            <section className="flex flex-col gap-4">
              {itens.map((item) => (
                <article
                  key={item.chave}
                  className="grid gap-4 rounded-card border border-border bg-card p-4 sm:grid-cols-[8rem_1fr_auto]"
                >
                  <div className="h-32 overflow-hidden rounded-card bg-surface sm:h-28">
                    {item.fotoUrl ? (
                      <img
                        src={item.fotoUrl}
                        alt={item.titulo}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <div className="flex h-full items-center justify-center text-xs text-text-secondary">
                        Sem imagem
                      </div>
                    )}
                  </div>

                  <div>
                    <p className="text-xs uppercase tracking-[0.08em] text-text-secondary">
                      {item.lojaNome}
                    </p>
                    <h2 className="mt-1 text-lg font-semibold">{item.titulo}</h2>
                    <p className="mt-1 text-sm text-text-secondary">
                      {item.modalidade === "aluguel" ? "Aluguel" : "Venda"}
                    </p>
                    <p className="mt-2 font-semibold">
                      {formatarPreco(item.precoBase)}
                    </p>
                  </div>

                  <div className="flex items-end justify-between gap-3 sm:flex-col sm:items-end">
                    <label className="flex items-center gap-2 text-sm">
                      Qtd.
                      <input
                        className="form-control w-20"
                        type="number"
                        min="1"
                        step="1"
                        value={item.quantidade}
                        onChange={(evento) =>
                          alterarQuantidade(
                            item.chave,
                            Number(evento.target.value),
                          )
                        }
                        aria-label={`Quantidade de ${item.titulo}`}
                      />
                    </label>
                    <button
                      type="button"
                      onClick={() => remover(item.chave)}
                      className="text-sm font-medium text-red-700 underline"
                    >
                      Remover
                    </button>
                  </div>
                </article>
              ))}
            </section>

            <aside className="flex flex-col gap-4 rounded-card border border-border bg-card p-5">
              <div className="flex items-center justify-between">
                <span className="font-semibold">Total estimado</span>
                <strong className="text-xl">{formatarPreco(total)}</strong>
              </div>

              <p className="text-sm text-text-secondary">
                Pagamento de 50% do valor na confirmação e restante até 3 dias antes do evento.
                Em caso de cancelamento, aplica-se taxa de desistência. Danos ou
                perdas seguem o valor de reposição.{" "}
                <strong>Não trabalhamos com fiado.</strong>
              </p>

              <div className="flex flex-wrap gap-3">
                <button
                  type="button"
                  onClick={atualizarUrl}
                  className="rounded-button border border-border bg-white px-5 py-3 text-sm font-semibold"
                >
                  Compartilhar carrinho
                </button>
                <button
                  type="button"
                  onClick={() => void copiarLink()}
                  className="rounded-button border border-border bg-white px-5 py-3 text-sm font-semibold"
                >
                  {copiado ? "Link copiado" : "Copiar link"}
                </button>
                <button
                  type="button"
                  onClick={limpar}
                  className="rounded-button border border-red-200 px-5 py-3 text-sm font-semibold text-red-700"
                >
                  Limpar carrinho
                </button>
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                {lojas.map((loja) => {
                  const itensDaLoja = itens.filter(
                    (item) => item.lojaId === loja.id,
                  );
                  const mensagem = montarMensagemPedido(itensDaLoja);
                  const url = criarUrlWhatsApp(loja.whatsapp, mensagem);

                  return (
                    <a
                      key={loja.id}
                      href={url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-center rounded-button bg-green-700 px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-green-800"
                    >
                      Solicitar via WhatsApp — {loja.nome}
                    </a>
                  );
                })}
              </div>
            </aside>
          </>
        )}

        {urlCompartilhavel && itens.length > 0 && (
          <p className="break-all text-xs text-text-secondary">
            Link compartilhável: {urlCompartilhavel}
          </p>
        )}
      </main>

      <Rodape />
    </div>
  );
}

export default Carrinho;