import { supabase } from "../lib/supabase";
import type { Loja } from "../schemas/loja";

const CAMPOS_LOJA =
  "id, usuario_id, nome_comercial, slug, descricao, logo_url, capa_url, email, telefone, whatsapp, bairro, cidade, estado, situacao, criado_em, atualizado_em";

export async function obterLojaDoUsuario(): Promise<Loja | null> {
  const {
    data: { user },
    error: erroAuth,
  } = await supabase.auth.getUser();

  if (erroAuth) throw erroAuth;
  if (!user) return null;

  const { data, error } = await supabase
    .from("lojas")
    .select(CAMPOS_LOJA)
    .eq("usuario_id", user.id)
    .maybeSingle();

  if (error) throw error;
  return data ?? null;
}

export async function buscarLojaPorSlug(slug: string): Promise<Loja | null> {
  const { data, error } = await supabase
    .from("lojas")
    .select(CAMPOS_LOJA)
    .eq("slug", slug)
    .maybeSingle();

  if (error) throw error;
  return data ?? null;
}

export async function salvarLojaDoUsuario(
  dados: Partial<Loja>,
): Promise<Loja> {
  const loja = await obterLojaDoUsuario();

  if (!loja) {
    throw new Error("Cadastre uma loja antes de editar o perfil.");
  }

  const payload = {
    ...dados,
    whatsapp: (dados.whatsapp ?? loja.whatsapp).replace(/\D/g, ""),
  };

  const { data, error } = await supabase
    .from("lojas")
    .update(payload)
    .eq("id", loja.id)
    .select(CAMPOS_LOJA)
    .single();

  if (error) throw error;
  return data;
}
