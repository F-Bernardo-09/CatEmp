import { supabase } from "../lib/supabase";

export interface Tema {
  id: string;
  loja_id: string;
  nome: string;
  criado_em: string;
}

async function obterLojaId(): Promise<string> {
  const {
    data: { user },
    error: erroUsuario,
  } = await supabase.auth.getUser();

  if (erroUsuario) throw erroUsuario;
  if (!user) throw new Error("É necessário entrar para gerenciar os temas.");

  const { data: loja, error } = await supabase
    .from("lojas")
    .select("id")
    .eq("usuario_id", user.id)
    .maybeSingle();

  if (error) throw error;
  if (!loja) throw new Error("Não foi encontrada uma loja para este usuário.");

  return loja.id;
}

export async function listarTemas(): Promise<string[]> {
  const lojaId = await obterLojaId();

  const { data, error } = await supabase
    .from("temas")
    .select("nome")
    .eq("loja_id", lojaId)
    .order("nome");

  if (error) throw error;
  return (data ?? []).map((tema) => tema.nome);
}

export async function listarTemasDaLoja(): Promise<Tema[]> {
  const lojaId = await obterLojaId();
  const { data, error } = await supabase
    .from("temas")
    .select("id, loja_id, nome, criado_em")
    .eq("loja_id", lojaId)
    .order("nome");

  if (error) throw error;
  return data ?? [];
}

export async function criarTema(nomeInformado: string): Promise<Tema> {
  const nome = nomeInformado.trim();
  if (!nome || nome.length > 60) {
    throw new Error("Informe um nome de tema com até 60 caracteres.");
  }

  const lojaId = await obterLojaId();
  const { data, error } = await supabase
    .from("temas")
    .insert({ loja_id: lojaId, nome })
    .select("id, loja_id, nome, criado_em")
    .single();

  if (error) throw error;
  return data;
}

export async function excluirTema(id: string): Promise<void> {
  const lojaId = await obterLojaId();
  const { count, error: erroFotos } = await supabase
    .from("fotos")
    .select("id", { count: "exact", head: true })
    .eq("tema_id", id)
    .eq("loja_id", lojaId);

  if (erroFotos) throw erroFotos;
  if (count) {
    throw new Error("Este tema não pode ser excluído porque está associado a fotos.");
  }

  const { error } = await supabase
    .from("temas")
    .delete()
    .eq("id", id)
    .eq("loja_id", lojaId);

  if (error) throw error;
}