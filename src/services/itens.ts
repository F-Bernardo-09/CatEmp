import { supabase } from "../lib/supabase";
import type { ItemBase, ItemListaResumo, ItemModalidade, ItemSituacao, ItemTipo } from "../schemas/item";

export interface DadosNovoItem {
  tipo: ItemTipo;
  modalidade: ItemModalidade;
  titulo: string;
  descricao: string;
  preco_base: number;
  preco_reposicao: number;
  altura: number;
  largura: number;
  profundidade: number;
}

export interface DadosAtualizacaoItem {
  tipo?: ItemTipo;
  modalidade?: ItemModalidade;
  titulo?: string;
  descricao?: string;
  preco_base?: number;
  preco_reposicao?: number;
  altura?: number;
  largura?: number;
  profundidade?: number;
  situacao?: ItemSituacao;
  em_destaque?: boolean;
}

async function obterLojaId(): Promise<string> {
  const {
    data: { user },
    error: erroUsuario,
  } = await supabase.auth.getUser();

  if (erroUsuario) throw erroUsuario;
  if (!user) throw new Error("É necessário entrar para gerenciar itens.");

  const { data: loja, error } = await supabase
    .from("lojas")
    .select("id")
    .eq("usuario_id", user.id)
    .maybeSingle();

  if (error) throw error;
  if (!loja) throw new Error("Não foi encontrada uma loja para este usuário.");

  return loja.id;
}

export interface FiltrosItens {
  modalidade?: "aluguel" | "venda";
  situacao?: ItemSituacao;
  busca?: string;
}

export async function listarItensDaLoja(
  filtros: FiltrosItens = {},
): Promise<ItemListaResumo[]> {
  const lojaId = await obterLojaId();

  let query = supabase
    .from("itens")
    .select("id, titulo, modalidade, situacao, preco_base, atualizado_em")
    .eq("loja_id", lojaId);

  if (filtros.modalidade) {
    query = query.eq("modalidade", filtros.modalidade);
  }

  if (filtros.situacao) {
    query = query.eq("situacao", filtros.situacao);
  }

  if (filtros.busca) {
    query = query.ilike("titulo", `%${filtros.busca}%`);
  }

  const { data, error } = await query.order("atualizado_em", {
    ascending: false,
  });

  if (error) throw error;

  const itens = data ?? [];
  if (itens.length === 0) {
    return [];
  }

  const itemIds = itens.map((item) => item.id);
  const { data: fotos, error: erroFotos } = await supabase
    .from("fotos")
    .select("item_id, caminho_storage, principal")
    .in("item_id", itemIds)
    .order("posicao", { ascending: true });

  if (erroFotos) throw erroFotos;

  const fotosPorItem = new Map<string, string>();
  for (const foto of fotos ?? []) {
    const url = supabase.storage.from("fotos").getPublicUrl(foto.caminho_storage)
      .data.publicUrl;
    const chave = foto.principal ? "principal" : "fallback";
    if (!fotosPorItem.has(foto.item_id) || chave === "principal") {
      fotosPorItem.set(foto.item_id, url);
    }
  }

  return itens.map((item) => ({
    id: item.id,
    titulo: item.titulo,
    modalidade: item.modalidade,
    situacao: item.situacao,
    preco_base: Number(item.preco_base),
    atualizado_em: item.atualizado_em,
    foto_url: fotosPorItem.get(item.id),
  }));
}

export async function alterarSituacaoItem(
  itemId: string,
  situacao: ItemSituacao,
): Promise<void> {
  const lojaId = await obterLojaId();

  const { error } = await supabase
    .from("itens")
    .update({ situacao })
    .eq("id", itemId)
    .eq("loja_id", lojaId);

  if (error) throw error;
}

export async function criarItem(dados: DadosNovoItem): Promise<ItemBase> {
  const lojaId = await obterLojaId();

  const { data, error } = await supabase
    .from("itens")
    .insert({
      loja_id: lojaId,
      tipo: dados.tipo,
      modalidade: dados.modalidade,
      titulo: dados.titulo,
      descricao: dados.descricao,
      preco_base: dados.preco_base,
      preco_reposicao: dados.preco_reposicao,
      altura: dados.altura,
      largura: dados.largura,
      profundidade: dados.profundidade,
    })
    .select(
      "id, loja_id, codigo_publico, tipo, modalidade, titulo, descricao, " +
      "altura, largura, profundidade, preco_base, preco_reposicao, " +
      "situacao, em_destaque, criado_em, atualizado_em",
    )
    .single();

  if (error) throw error;
  return {
    ...data,
    preco_base: Number(data.preco_base),
    preco_reposicao: Number(data.preco_reposicao),
    altura: Number(data.altura),
    largura: Number(data.largura),
    profundidade: Number(data.profundidade),
  };
}

export async function atualizarItem(
  itemId: string,
  dados: DadosAtualizacaoItem,
): Promise<ItemBase> {
  const lojaId = await obterLojaId();

  const { data, error } = await supabase
    .from("itens")
    .update(dados)
    .eq("id", itemId)
    .eq("loja_id", lojaId)
    .select(
      "id, loja_id, codigo_publico, tipo, modalidade, titulo, descricao, " +
      "altura, largura, profundidade, preco_base, preco_reposicao, " +
      "situacao, em_destaque, criado_em, atualizado_em",
    )
    .single();

  if (error) throw error;
  return {
    ...data,
    preco_base: Number(data.preco_base),
    preco_reposicao: Number(data.preco_reposicao),
    altura: Number(data.altura),
    largura: Number(data.largura),
    profundidade: Number(data.profundidade),
  };
}

export async function obterItem(itemId: string): Promise<ItemBase> {
  const lojaId = await obterLojaId();

  const { data, error } = await supabase
    .from("itens")
    .select(
      "id, loja_id, codigo_publico, tipo, modalidade, titulo, descricao, " +
      "altura, largura, profundidade, preco_base, preco_reposicao, " +
      "situacao, em_destaque, criado_em, atualizado_em",
    )
    .eq("id", itemId)
    .eq("loja_id", lojaId)
    .single();

  if (error) throw error;
  return {
    ...data,
    preco_base: Number(data.preco_base),
    preco_reposicao: Number(data.preco_reposicao),
    altura: Number(data.altura),
    largura: Number(data.largura),
    profundidade: Number(data.profundidade),
  };
}

export async function excluirItem(itemId: string): Promise<void> {
  const lojaId = await obterLojaId();

  const { data: fotos, error: erroFotos } = await supabase
    .from("fotos")
    .select("caminho_storage")
    .eq("item_id", itemId)
    .eq("loja_id", lojaId);

  if (erroFotos) throw erroFotos;

  const caminhos = (fotos ?? []).map((foto) => foto.caminho_storage);

  if (caminhos.length > 0) {
    const { error: erroStorage } = await supabase.storage
      .from("fotos")
      .remove(caminhos);

    if (erroStorage) throw erroStorage;
  }

  const { error } = await supabase
    .from("itens")
    .delete()
    .eq("id", itemId)
    .eq("loja_id", lojaId);

  if (error) throw error;
}

export async function criarItem(dados: DadosNovoItem): Promise<ItemBase> {
  const lojaId = await obterLojaId();

  const { data, error } = await supabase
    .from("itens")
    .insert({
      loja_id: lojaId,
      tipo: dados.tipo,
      modalidade: dados.modalidade,
      titulo: dados.titulo,
      descricao: dados.descricao,
      preco_base: dados.preco_base,
      preco_reposicao: dados.preco_reposicao,
      altura: dados.altura,
      largura: dados.largura,
      profundidade: dados.profundidade,
    })
    .select(
      "id, loja_id, codigo_publico, tipo, modalidade, titulo, descricao, " +
      "altura, largura, profundidade, preco_base, preco_reposicao, " +
      "situacao, em_destaque, criado_em, atualizado_em",
    )
    .single();

  if (error) throw error;
  return {
    ...data,
    preco_base: Number(data.preco_base),
    preco_reposicao: Number(data.preco_reposicao),
    altura: Number(data.altura),
    largura: Number(data.largura),
    profundidade: Number(data.profundidade),
  };
}

export async function atualizarItem(
  itemId: string,
  dados: DadosAtualizacaoItem,
): Promise<ItemBase> {
  const lojaId = await obterLojaId();

  const { data, error } = await supabase
    .from("itens")
    .update(dados)
    .eq("id", itemId)
    .eq("loja_id", lojaId)
    .select(
      "id, loja_id, codigo_publico, tipo, modalidade, titulo, descricao, " +
      "altura, largura, profundidade, preco_base, preco_reposicao, " +
      "situacao, em_destaque, criado_em, atualizado_em",
    )
    .single();

  if (error) throw error;
  return {
    ...data,
    preco_base: Number(data.preco_base),
    preco_reposicao: Number(data.preco_reposicao),
    altura: Number(data.altura),
    largura: Number(data.largura),
    profundidade: Number(data.profundidade),
  };
}

export async function obterItem(itemId: string): Promise<ItemBase> {
  const lojaId = await obterLojaId();

  const { data, error } = await supabase
    .from("itens")
    .select(
      "id, loja_id, codigo_publico, tipo, modalidade, titulo, descricao, " +
      "altura, largura, profundidade, preco_base, preco_reposicao, " +
      "situacao, em_destaque, criado_em, atualizado_em",
    )
    .eq("id", itemId)
    .eq("loja_id", lojaId)
    .single();

  if (error) throw error;
  return {
    ...data,
    preco_base: Number(data.preco_base),
    preco_reposicao: Number(data.preco_reposicao),
    altura: Number(data.altura),
    largura: Number(data.largura),
    profundidade: Number(data.profundidade),
  };
}
