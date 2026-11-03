export type ModalidadeCategoria = "aluguel" | "venda";
export type SituacaoCategoria = "ativa" | "inativa";

export interface Categoria {
  id: string;
  loja_id: string;
  modalidade: ModalidadeCategoria;
  nome: string;
  slug: string;
  situacao: SituacaoCategoria;
}