export type SituacaoToken = "disponivel" | "usado" | "vencido" | "revogado";

export interface TokenAcesso {
  id: string;
  emitido_para: string;
  criado_por: string;
  expira_em: string;
  usado_em: string | null;
  usado_por: string | null;
  revogado_em: string | null;
  criado_em: string;
}

export interface NovoTokenAcesso {
  token: string;
  emitido_para: string;
  expira_em: string;
}