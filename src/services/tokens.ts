import { supabase } from "../lib/supabase";
import type { NovoTokenAcesso, TokenAcesso } from "../schemas/token";

function lerTokenGerado(dados: unknown): NovoTokenAcesso {
  if (typeof dados !== "object" || dados === null) {
    throw new Error("A resposta da geração do token está inválida.");
  }

  const resposta = dados as Record<string, unknown>;
  if (
    typeof resposta.token !== "string" ||
    typeof resposta.emitido_para !== "string" ||
    typeof resposta.expira_em !== "string"
  ) {
    throw new Error("A resposta da geração do token está incompleta.");
  }

  return {
    token: resposta.token,
    emitido_para: resposta.emitido_para,
    expira_em: resposta.expira_em,
  };
}

export async function listarTokens(): Promise<TokenAcesso[]> {
  const { data, error } = await supabase
    .from("tokens_acesso_admin")
    .select(
      "id, emitido_para, criado_por, expira_em, usado_em, usado_por, revogado_em, criado_em",
    )
    .order("criado_em", { ascending: false });

  if (error) throw error;
  return data ?? [];
}

export async function gerarToken(
  emitidoPara: string,
  validadeDias: number,
): Promise<NovoTokenAcesso> {
  const { data, error } = await supabase.functions.invoke("gerar-token", {
    body: { emitido_para: emitidoPara.trim(), validade_dias: validadeDias },
  });

  if (error) throw error;
  return lerTokenGerado(data);
}

export async function revogarToken(tokenId: string): Promise<void> {
  const { error } = await supabase.functions.invoke("revogar-token", {
    body: { token_id: tokenId },
  });

  if (error) throw error;
}