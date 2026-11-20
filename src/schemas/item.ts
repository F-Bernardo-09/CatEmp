export type ItemTipo = "produto" | "servico";
export type ItemModalidade = "aluguel" | "venda";
export type ItemSituacao = "rascunho" | "publicado" | "arquivado";

export interface ItemBase {
  id: string;
  loja_id: string;
  codigo_publico: string;
  tipo: ItemTipo;
  modalidade: ItemModalidade;
  titulo: string;
  descricao: string;
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
  tipo: ItemTipo;
  modalidade: ItemModalidade;
  situacao: ItemSituacao;
  preco_base: number;
  foto_url?: string;
  atualizado_em: string;
}

export interface ItemCatalogoResumo {
  id: string;
  codigo_publico: string;
  loja_id: string;
  loja_slug: string;
  loja_nome: string;
  tipo: ItemTipo;
  titulo: string;
  modalidade: ItemModalidade;
  descricao: string;
  preco_base: number;
  foto_url?: string;
  em_destaque: boolean;
}

export interface FotoPublica {
  url: string;
  texto_alternativo: string;
  principal: boolean;
  posicao: number;
}

export interface ItemPublico extends ItemBase {
  loja_slug: string;
  loja_nome: string;
  loja_whatsapp: string;
  fotos: FotoPublica[];
  categorias: string[];
}
