export type ModalidadeCarrinho = "aluguel" | "venda";
export type TipoItemCarrinho = "produto" | "servico";

export interface ItemCarrinho {
  chave: string;
  itemId: string;
  lojaId: string;
  lojaSlug: string;
  lojaNome: string;
  lojaWhatsapp: string;
  titulo: string;
  tipo?: TipoItemCarrinho;
  modalidade: ModalidadeCarrinho;
  precoBase: number;
  precoReposicao: number;
  fotoUrl?: string;
  quantidade: number;
}