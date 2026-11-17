import { supabase } from "../lib/supabase";
import type { ItemCatalogoResumo, ItemPublico } from "../schemas/item";

export interface FiltrosCatalogo {
  modalidade?: "aluguel" | "venda";
  categoria?: string;
  busca?: string;
  page?: number;
  limit?: number;
}

export async function listarItensCatalogo(
  filtros: FiltrosCatalogo = {},
): Promise<{ itens: ItemCatalogoResumo[]; temMais: boolean }> {
  const page = filtros.page ?? 1;
  const limit = filtros.limit ?? 12;
  const offset = (page - 1) * limit;

  let query = supabase
    .from("itens")
    .select(
      "id, loja_id, titulo, modalidade, descricao, preco_base, altura, largura, profundidade, em_destaque, situacao",
      { count: "exact" },
    )
    .eq("situacao", "disponivel");

  if (filtros.modalidade) {
    query = query.eq("modalidade", filtros.modalidade);
  }

  if (filtros.busca) {
    query = query.ilike("titulo", `%${filtros.busca}%`);
  }

  const { data, error, count } = await query
    .order("em_destaque", { ascending: false })
    .order("criado_em", { ascending: false })
    .range(offset, offset + limit - 1);

  if (error) throw error;

  const itens = data ?? [];
  if (itens.length === 0) {
    return { itens: [], temMais: false };
  }

  const lojaIds = [...new Set(itens.map((item) => item.loja_id))];
  const { data: lojas, error: erroLojas } = await supabase
    .from("lojas")
    .select("id, slug, nome_comercial")
    .in("id", lojaIds);

  if (erroLojas) throw erroLojas;

  const lojasPorId = new Map<string, { slug: string; nome_comercial: string }>();
  for (const loja of lojas ?? []) {
    lojasPorId.set(loja.id, { slug: loja.slug, nome_comercial: loja.nome_comercial });
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

  const itensFormatados: ItemCatalogoResumo[] = itens.map((item) => {
    const loja = lojasPorId.get(item.loja_id);

    return {
      id: item.id,
      loja_id: item.loja_id,
      loja_slug: loja?.slug ?? "",
      loja_nome: loja?.nome_comercial ?? "Loja",
      titulo: item.titulo,
      modalidade: item.modalidade,
      descricao: item.descricao,
      preco_base: Number(item.preco_base),
      altura: Number(item.altura),
      largura: Number(item.largura),
      profundidade: Number(item.profundidade),
      foto_url: fotosPorItem.get(item.id),
      em_destaque: Boolean(item.em_destaque),
    };
  });

  const totalItens = count ?? 0;
  return {
    itens: itensFormatados,
    temMais: totalItens > page * limit,
  };
}

export async function listarCategoriasPublicas(
  modalidade: "aluguel" | "venda",
): Promise<{ id: string; nome: string; slug: string }[]> {
  const { data, error } = await supabase
    .from("categorias")
    .select("id, nome, slug")
    .eq("modalidade", modalidade)
    .eq("situacao", "ativa")
    .order("nome");

  if (error) throw error;
  return data ?? [];
}

export async function buscarItemPublico(id: string): Promise<ItemPublico | null> {
  const { data: item, error } = await supabase
    .from("itens")
    .select(
      "id, loja_id, codigo_publico, tipo, modalidade, titulo, descricao, altura, largura, profundidade, preco_base, preco_reposicao, situacao, em_destaque, criado_em, atualizado_em",
    )
    .eq("id", id)
    .eq("situacao", "disponivel")
    .maybeSingle();

  if (error) throw error;
  if (!item) return null;

  const { data: loja, error: erroLoja } = await supabase
    .from("lojas")
    .select("slug, nome_comercial, whatsapp")
    .eq("id", item.loja_id)
    .eq("situacao", "ativa")
    .maybeSingle();

  if (erroLoja) throw erroLoja;
  if (!loja) return null;

  const { data: fotosRaw, error: erroFotos } = await supabase
    .from("fotos")
    .select("caminho_storage, texto_alternativo, principal, posicao")
    .eq("item_id", id)
    .order("posicao", { ascending: true });

  if (erroFotos) throw erroFotos;

  const fotos = (fotosRaw ?? []).map((foto) => ({
    url: supabase.storage.from("fotos").getPublicUrl(foto.caminho_storage).data.publicUrl,
    texto_alternativo: foto.texto_alternativo,
    principal: foto.principal,
    posicao: foto.posicao,
  }));

  const { data: itemCategorias, error: erroCategorias } = await supabase
    .from("item_categorias")
    .select("categoria_id")
    .eq("item_id", id);

  if (erroCategorias) throw erroCategorias;

  let categorias: string[] = [];
  if (itemCategorias && itemCategorias.length > 0) {
    const categoriaIds = itemCategorias.map((ic) => ic.categoria_id);
    const { data: cats, error: erroCats } = await supabase
      .from("categorias")
      .select("nome")
      .in("id", categoriaIds);

    if (erroCats) throw erroCats;
    categorias = (cats ?? []).map((c) => c.nome);
  }

  return {
    id: item.id,
    loja_id: item.loja_id,
    codigo_publico: item.codigo_publico,
    tipo: item.tipo,
    modalidade: item.modalidade,
    titulo: item.titulo,
    descricao: item.descricao,
    altura: Number(item.altura),
    largura: Number(item.largura),
    profundidade: Number(item.profundidade),
    preco_base: Number(item.preco_base),
    preco_reposicao: Number(item.preco_reposicao),
    situacao: item.situacao,
    em_destaque: item.em_destaque,
    criado_em: item.criado_em,
    atualizado_em: item.atualizado_em,
    loja_slug: loja.slug,
    loja_nome: loja.nome_comercial,
    loja_whatsapp: loja.whatsapp,
    fotos,
    categorias,
  };
}
