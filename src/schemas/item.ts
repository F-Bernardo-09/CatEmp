export type ItemTipo = "produto" | "servico";
export type ItemModalidade = "aluguel" | "venda";
export type ItemSituacao = "disponivel" | "manutencao" | "oculto";

export interface ItemBase {
  id: string;
  loja_id: string;
  codigo_publico: string;
  tipo: ItemTipo;
  modalidade: ItemModalidade;
  titulo: string;
  descricao: string;
  altura: number;
  largura: number;
  profundidade: number;
  preco_base: number;
  preco_reposicao: number;
  situacao: ItemSituacao;
  em_destaque: boolean;
  criado_em: string;
  atualizado_em: string;
}

export interface ItemListaResumo {
  id: string;
  titulo: string;
  modalidade: ItemModalidade;
  situacao: ItemSituacao;
  preco_base: number;
  foto_url?: string;
  atualizado_em: string;
}

export interface ItemCatalogoResumo {
  id: string;
  loja_id: string;
  loja_slug: string;
  loja_nome: string;
  titulo: string;
  modalidade: ItemModalidade;
  descricao: string;
  preco_base: number;
  altura: number;
  largura: number;
  profundidade: number;
  foto_url?: string;
  em_destaque: boolean;
}
