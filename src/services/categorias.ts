import { supabase } from "../lib/supabase";
import { gerarSlug } from "../lib/slug";
import type {
  Categoria,
  ModalidadeCategoria,
  SituacaoCategoria,
} from "../schemas/categoria";

async function obterLojaId(): Promise<string> {
  const {
    data: { user },
    error: erroUsuario,
  } = await supabase.auth.getUser();

  if (erroUsuario) throw erroUsuario;
  if (!user) throw new Error("É necessário entrar para gerenciar categorias.");

  const { data: loja, error } = await supabase
    .from("lojas")
    .select("id")
    .eq("usuario_id", user.id)
    .maybeSingle();

  if (error) throw error;
  if (!loja) throw new Error("Não foi encontrada uma loja para este usuário.");

  return loja.id;
}

export async function listarCategorias(): Promise<Categoria[]> {
  const lojaId = await obterLojaId();
  const { data, error } = await supabase
    .from("categorias")
    .select("id, loja_id, modalidade, nome, slug, situacao")
    .eq("loja_id", lojaId)
    .order("modalidade")
    .order("nome");

  if (error) throw error;
  return data ?? [];
}

export async function criarCategoria(
  nomeInformado: string,
  modalidade: ModalidadeCategoria,
): Promise<Categoria> {
  const nome = nomeInformado.trim();
  const slug = gerarSlug(nome);

  if (!nome || nome.length > 60 || !slug) {
    throw new Error("Informe um nome de categoria válido com até 60 caracteres.");
  }

  const lojaId = await obterLojaId();
  const { data, error } = await supabase
    .from("categorias")
    .insert({ loja_id: lojaId, modalidade, nome, slug })
    .select("id, loja_id, modalidade, nome, slug, situacao")
    .single();

  if (error) throw error;
  return data;
}

export async function atualizarCategoria(
  id: string,
  nomeInformado: string,
  modalidade: ModalidadeCategoria,
): Promise<Categoria> {
  const nome = nomeInformado.trim();
  const slug = gerarSlug(nome);

  if (!nome || nome.length > 60 || !slug) {
    throw new Error("Informe um nome de categoria válido com até 60 caracteres.");
  }

  const lojaId = await obterLojaId();
  const { data, error } = await supabase
    .from("categorias")
    .update({ nome, slug, modalidade })
    .eq("id", id)
    .eq("loja_id", lojaId)
    .select("id, loja_id, modalidade, nome, slug, situacao")
    .single();

  if (error) throw error;
  return data;
}

export async function alterarSituacaoCategoria(
  id: string,
  situacao: SituacaoCategoria,
): Promise<void> {
  const lojaId = await obterLojaId();
  const { error } = await supabase
    .from("categorias")
    .update({ situacao })
    .eq("id", id)
    .eq("loja_id", lojaId);

  if (error) throw error;
}

export async function excluirCategoria(id: string): Promise<void> {
  const lojaId = await obterLojaId();
  const { error } = await supabase
    .from("categorias")
    .delete()
    .eq("id", id)
    .eq("loja_id", lojaId);

  if (error) throw error;
}