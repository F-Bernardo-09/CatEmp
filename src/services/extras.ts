import { supabase } from "../lib/supabase";

const BUCKET_FOTOS = "fotos";

export interface ExtraServico {
  id: string;
  item_id: string;
  loja_id: string;
  nome: string;
  preco_minimo: number;
  caminho_storage: string;
  url: string;
}

export interface ExtraServicoParaSalvar {
  nome: string;
  precoMinimo: number | string;
  imagem: File;
}

function extensaoImagem(arquivo: File): string {
  const extensoes: Record<string, string> = {
    "image/jpeg": "jpg",
    "image/png": "png",
    "image/webp": "webp",
  };
  const extensao = extensoes[arquivo.type];
  if (!extensao) {
    throw new Error(`Formato de imagem não aceito: ${arquivo.name}.`);
  }
  return extensao;
}

async function obterLojaId(): Promise<string> {
  const {
    data: { user },
    error: erroUsuario,
  } = await supabase.auth.getUser();
  if (erroUsuario) throw erroUsuario;
  if (!user) throw new Error("É necessário entrar para gerenciar adicionais.");

  const { data: loja, error } = await supabase
    .from("lojas")
    .select("id")
    .eq("usuario_id", user.id)
    .maybeSingle();
  if (error) throw error;
  if (!loja) throw new Error("Não foi encontrada uma loja para este usuário.");
  return loja.id;
}

function comUrl(extra: Omit<ExtraServico, "url">): ExtraServico {
  return {
    ...extra,
    url: supabase.storage
      .from(BUCKET_FOTOS)
      .getPublicUrl(extra.caminho_storage).data.publicUrl,
  };
}

export async function listarExtrasServico(
  itemId: string,
): Promise<ExtraServico[]> {
  const lojaId = await obterLojaId();
  const { data, error } = await supabase
    .from("extras_servico")
    .select("id, item_id, loja_id, nome, preco_minimo, caminho_storage")
    .eq("item_id", itemId)
    .eq("loja_id", lojaId)
    .order("criado_em");
  if (error) throw error;
  return (data ?? []).map(comUrl);
}

export async function criarExtrasServico(
  itemId: string,
  extras: ExtraServicoParaSalvar[],
): Promise<ExtraServico[]> {
  if (extras.length === 0) return [];

  const lojaId = await obterLojaId();
  const preparados = extras.map((extra) => {
    const nome = extra.nome.trim();
    const preco = Number(extra.precoMinimo);
    if (!nome || nome.length > 120 || !Number.isFinite(preco) || preco < 0) {
      throw new Error("Confira o nome e o preço de cada adicional.");
    }
    if (!extra.imagem) {
      throw new Error(`Adicione uma foto para o adicional "${nome}".`);
    }
    return {
      nome,
      preco,
      arquivo: extra.imagem,
      extensao: extensaoImagem(extra.imagem),
    };
  });

  const caminhos: string[] = [];
  try {
    for (const extra of preparados) {
      const caminho = `${lojaId}/${itemId}/extras/${crypto.randomUUID()}.${extra.extensao}`;
      const { error } = await supabase.storage
        .from(BUCKET_FOTOS)
        .upload(caminho, extra.arquivo, {
          contentType: extra.arquivo.type,
          upsert: false,
        });
      if (error) throw error;
      caminhos.push(caminho);
    }

    const registros = preparados.map((extra, indice) => ({
      item_id: itemId,
      loja_id: lojaId,
      nome: extra.nome,
      preco_minimo: extra.preco,
      caminho_storage: caminhos[indice],
    }));
    const { data, error } = await supabase
      .from("extras_servico")
      .insert(registros)
      .select("id, item_id, loja_id, nome, preco_minimo, caminho_storage");
    if (error) throw error;
    return data.map(comUrl);
  } catch (erro) {
    if (caminhos.length > 0) {
      const { error: erroLimpeza } = await supabase.storage
        .from(BUCKET_FOTOS)
        .remove(caminhos);
      if (erroLimpeza) {
        const mensagem =
          erro instanceof Error ? erro.message : "Erro desconhecido.";
        throw new Error(
          `${mensagem} Não foi possível remover todas as fotos enviadas: ${erroLimpeza.message}`,
        );
      }
    }
    throw erro;
  }
}

export async function excluirExtraServico(extra: ExtraServico): Promise<void> {
  const lojaId = await obterLojaId();
  const { error: erroRegistro } = await supabase
    .from("extras_servico")
    .delete()
    .eq("id", extra.id)
    .eq("loja_id", lojaId);
  if (erroRegistro) throw erroRegistro;

  const { error: erroArquivo } = await supabase.storage
    .from(BUCKET_FOTOS)
    .remove([extra.caminho_storage]);
  if (erroArquivo) {
    throw new Error(
      `O adicional foi excluído, mas a foto não pôde ser removida: ${erroArquivo.message}`,
    );
  }
}