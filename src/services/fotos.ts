import { supabase } from "../lib/supabase";

const BUCKET_FOTOS = "fotos";

export interface FotoParaEnvio {
  arquivo: File;
  tema: string;
  textoAlternativo: string;
  posicao: number;
  principal: boolean;
}

export interface FotoItem {
  id: string;
  caminho_storage: string;
  texto_alternativo: string;
  posicao: number;
  principal: boolean;
  tema_id: string | null;
  url: string;
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

function mensagemDoErro(erro: unknown): string {
  return erro instanceof Error ? erro.message : "Erro desconhecido.";
}

async function removerUploads(caminhos: string[]): Promise<string | null> {
  if (caminhos.length === 0) return null;

  const { error } = await supabase.storage
    .from(BUCKET_FOTOS)
    .remove(caminhos);

  return error ? error.message : null;
}

export async function enviarFotosItem(
  itemId: string,
  lojaId: string,
  fotos: FotoParaEnvio[],
): Promise<FotoItem[]> {
  if (fotos.length === 0) {
    throw new Error("Adicione pelo menos uma foto ao item.");
  }

  if (fotos.filter((foto) => foto.principal).length !== 1) {
    throw new Error("O item deve ter exatamente uma foto principal.");
  }

  const posicoes = new Set<number>();
  for (const foto of fotos) {
    if (!foto.textoAlternativo.trim()) {
      throw new Error("Informe o texto alternativo de todas as fotos.");
    }
    if (!Number.isInteger(foto.posicao) || foto.posicao < 0 || posicoes.has(foto.posicao)) {
      throw new Error("A ordem das fotos é inválida.");
    }
    posicoes.add(foto.posicao);
    extensaoImagem(foto.arquivo);
  }

  const temasPorNome = new Map<string, string>();
  for (const nomeInformado of new Set(fotos.map((foto) => foto.tema.trim()).filter(Boolean))) {
    const { data, error } = await supabase
      .from("temas")
      .upsert(
        { loja_id: lojaId, nome: nomeInformado },
        { onConflict: "loja_id,nome" },
      )
      .select("id")
      .single();

    if (error) throw error;
    temasPorNome.set(nomeInformado, data.id);
  }

  const caminhosEnviados: string[] = [];

  try {
    const registros = [];
    for (const foto of [...fotos].sort((a, b) => a.posicao - b.posicao)) {
      const caminho = `${lojaId}/${itemId}/${crypto.randomUUID()}.${extensaoImagem(foto.arquivo)}`;
      const { error: erroUpload } = await supabase.storage
        .from(BUCKET_FOTOS)
        .upload(caminho, foto.arquivo, {
          contentType: foto.arquivo.type,
          upsert: false,
        });

      if (erroUpload) throw erroUpload;
      caminhosEnviados.push(caminho);
      registros.push({
        item_id: itemId,
        loja_id: lojaId,
        tema_id: temasPorNome.get(foto.tema.trim()) ?? null,
        caminho_storage: caminho,
        texto_alternativo: foto.textoAlternativo.trim(),
        posicao: foto.posicao,
        principal: foto.principal,
      });
    }

    const { data, error } = await supabase
      .from("fotos")
      .insert(registros)
      .select(
        "id, caminho_storage, texto_alternativo, posicao, principal, tema_id",
      );

    if (error) throw error;

    return data.map((foto) => ({
      ...foto,
      url: supabase.storage
        .from(BUCKET_FOTOS)
        .getPublicUrl(foto.caminho_storage).data.publicUrl,
    }));
  } catch (erro) {
    const erroLimpeza = await removerUploads(caminhosEnviados);
    if (erroLimpeza) {
      throw new Error(
        `${mensagemDoErro(erro)} Falha ao remover uploads incompletos: ${erroLimpeza}`,
      );
    }
    throw erro;
  }
}