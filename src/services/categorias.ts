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


/**
 * Vincula categorias a um item substituindo todas as associações anteriores.
 * Recebe os nomes das categorias; cria as que ainda não existem na modalidade
 * do item e grava os registros em item_categorias.
 */
export async function vincularCategorias(
  itemId: string,
  modalidade: ModalidadeCategoria,
  nomes: string[],
): Promise<void> {
  if (nomes.length === 0) return;

  const lojaId = await obterLojaId();

  // Garante que cada categoria existe, criando as novas
  const categoriaIds: string[] = [];
  for (const nomeInformado of nomes) {
    const nome = nomeInformado.trim();
    const slug = gerarSlug(nome);

    const { data, error } = await supabase
      .from("categorias")
      .upsert(
        { loja_id: lojaId, modalidade, nome, slug },
        { onConflict: "loja_id,modalidade,slug" },
      )
      .select("id")
      .single();

    if (error) throw error;
    categoriaIds.push(data.id);
  }

  // Remove vínculos anteriores e insere os novos
  const { error: erroDelete } = await supabase
    .from("item_categorias")
    .delete()
    .eq("item_id", itemId)
    .eq("loja_id", lojaId);

  if (erroDelete) throw erroDelete;

  if (categoriaIds.length > 0) {
    const registros = categoriaIds.map((categoriaId) => ({
      item_id: itemId,
      loja_id: lojaId,
      modalidade,
      categoria_id: categoriaId,
    }));

    const { error: erroInsert } = await supabase
      .from("item_categorias")
      .insert(registros);

    if (erroInsert) throw erroInsert;
  }
}
