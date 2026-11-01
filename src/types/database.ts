export type PapelUsuario = "admin" | "vendedor";

export type SituacaoUsuario = "ativa" | "suspensa";

export interface Usuario {
  id: string;
  nome: string;
  papel: PapelUsuario;
  situacao: SituacaoUsuario;
  criado_em: string;
  atualizado_em: string;
}
