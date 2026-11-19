import type { ItemCarrinho } from "../types/carrinho";

const PARAMETRO_CARRINHO = "c";

export function criarUrlCarrinho(
  itens: ItemCarrinho[],
  origem = window.location.origin,
): string {
  const parametros = new URLSearchParams();
  parametros.set(PARAMETRO_CARRINHO, JSON.stringify(itens));
  return `${origem}/carrinho?${parametros.toString()}`;
}

export function lerCarrinhoDaUrl(
  search: string,
): ItemCarrinho[] | null {
  const parametros = new URLSearchParams(search);
  const valor = parametros.get(PARAMETRO_CARRINHO);
  if (!valor) return null;

  try {
    const dados: unknown = JSON.parse(valor);
    if (!Array.isArray(dados)) return null;

    return dados.filter((item): item is ItemCarrinho => {
      if (!item || typeof item !== "object") return false;
      const registro = item as Record<string, unknown>;
      return (
        typeof registro.chave === "string" &&
        typeof registro.itemId === "string" &&
        typeof registro.lojaId === "string" &&
        typeof registro.lojaSlug === "string" &&
        typeof registro.lojaNome === "string" &&
        typeof registro.lojaWhatsapp === "string" &&
        typeof registro.titulo === "string" &&
        (registro.modalidade === "aluguel" ||
          registro.modalidade === "venda") &&
        typeof registro.precoBase === "number" &&
        typeof registro.precoReposicao === "number" &&
        typeof registro.quantidade === "number"
      );
    });
  } catch {
    return null;
  }
}

export function serializarCarrinhoParaUrl(itens: ItemCarrinho[]): string {
  const parametros = new URLSearchParams();
  parametros.set(PARAMETRO_CARRINHO, JSON.stringify(itens));
  return `?${parametros.toString()}`;
}