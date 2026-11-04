import { supabase } from "../lib/supabase";

export async function listarTemas(): Promise<string[]> {
  const {
    data: { user },
    error: erroUsuario,
  } = await supabase.auth.getUser();

  if (erroUsuario) throw erroUsuario;
  if (!user) throw new Error("É necessário entrar para carregar os temas.");

  const { data: loja, error: erroLoja } = await supabase
    .from("lojas")
    .select("id")
    .eq("usuario_id", user.id)
    .maybeSingle();

  if (erroLoja) throw erroLoja;
  if (!loja) throw new Error("Não foi encontrada uma loja para este usuário.");

  const { data, error } = await supabase
    .from("temas")
    .select("nome")
    .eq("loja_id", loja.id)
    .order("nome");

  if (error) throw error;
  return (data ?? []).map((tema) => tema.nome);
}