export type SituacaoLoja = "pendente" | "ativa" | "suspensa" | "encerrada";

export interface Loja {
  id: string;
  usuario_id: string;
  nome_comercial: string;
  slug: string;
  descricao: string | null;
  logo_url: string | null;
  capa_url: string | null;
  email: string | null;
  telefone: string | null;
  whatsapp: string;
  bairro: string | null;
  cidade: string | null;
  estado: string | null;
  situacao: SituacaoLoja;
  criado_em: string;
  atualizado_em: string;
}
