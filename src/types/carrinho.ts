export type ModalidadeCarrinho = "aluguel" | "venda";

export interface ItemCarrinho {
  chave: string;
  itemId: string;
  lojaId: string;
  lojaSlug: string;
  lojaNome: string;
  lojaWhatsapp: string;
  titulo: string;
  modalidade: ModalidadeCarrinho;
  precoBase: number;
  precoReposicao: number;
  fotoUrl?: string;
  quantidade: number;
}