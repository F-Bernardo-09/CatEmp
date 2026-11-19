import type { ItemCarrinho } from "../types/carrinho";

export function normalizarWhatsApp(valor: string): string {
  const somenteNumeros = valor.replace(/\D/g, "");
  if (somenteNumeros.length === 10 || somenteNumeros.length === 11) {
    return `55${somenteNumeros}`;
  }
  return somenteNumeros;
}

export function formatarPrecoWhatsapp(valor: number): string {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(valor);
}

export function montarMensagemPedido(itens: ItemCarrinho[]): string {
  const linhas = ["Olá! Gostaria de solicitar um orçamento pelo CATEMP.", ""];

  itens.forEach((item, indice) => {
    linhas.push(
      `${indice + 1}. ${item.titulo}`,
      `   Modalidade: ${item.modalidade === "aluguel" ? "Aluguel" : "Venda"}`,
      `   Quantidade: ${item.quantidade}`,
      `   Valor base: ${formatarPrecoWhatsapp(item.precoBase)}`,
      `   Valor de reposição: ${formatarPrecoWhatsapp(item.precoReposicao)}`,
      `   Link: ${window.location.origin}/loja/${item.lojaSlug}`,
      "",
    );
  });

  const total = itens.reduce(
    (soma, item) => soma + item.precoBase * item.quantidade,
    0,
  );

  linhas.push(
    `Total estimado: ${formatarPrecoWhatsapp(total)}`,
    "",
    "Termos:",
    "- Sinal: 50% na confirmação e restante até 3 dias antes do evento.",
    "- Desistência: aplicação da taxa de cancelamento.",
    "- Danificação: cobrança do valor de reposição cadastrado.",
    "- Não trabalhamos com fiado.",
  );

  return linhas.join("\n");
}

export function criarUrlWhatsApp(
  numeroInformado: string,
  mensagem: string,
): string {
  const numero = normalizarWhatsApp(numeroInformado);
  if (!numero) return "";
  return `https://wa.me/${numero}?text=${encodeURIComponent(mensagem)}`;
}