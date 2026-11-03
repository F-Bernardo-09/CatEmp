import { useState } from "react";
import type { Ref } from "react";

import { ZonaUploadImagem } from "../../../ui/upload-imagem";
import type { ImagemItem } from "../types";
import CartaoImagem from "./CartaoImagem";

interface EtapaImagensTemasProps {
  etapaRef: Ref<HTMLFieldSetElement>;
  imagens: ImagemItem[];
  temasDisponiveis: string[];
  erro?: string;
  onAdicionarImagens: (arquivos: File[]) => void;
  /** Normaliza e registra o tema. Retorna `null` quando o nome é inválido. */
  onAdicionarTema: (tema: string) => string | null;
  onAtualizarTema: (id: string, tema: string) => void;
  onAtualizarTextoAlternativo: (id: string, texto: string) => void;
  onDefinirPrincipal: (id: string) => void;
  onMoverImagem: (id: string, deslocamento: -1 | 1) => void;
  onRemoverImagem: (id: string) => void;
}

function EtapaImagensTemas({
  etapaRef,
  imagens,
  temasDisponiveis,
  erro = "",
  onAdicionarImagens,
  onAdicionarTema,
  onAtualizarTema,
  onAtualizarTextoAlternativo,
  onDefinirPrincipal,
  onMoverImagem,
  onRemoverImagem,
}: EtapaImagensTemasProps) {
  const [imagemEditandoId, setImagemEditandoId] = useState<string | null>(null);

  function selecionarTema(imagemId: string, tema: string) {
    onAtualizarTema(imagemId, tema);
    setImagemEditandoId(null);
  }

  function criarTema(imagemId: string, nome: string) {
    const tema = onAdicionarTema(nome);

    if (!tema) return false;

    selecionarTema(imagemId, tema);
    return true;
  }

  const total = imagens.length;

  return (
    <fieldset ref={etapaRef} className="form-step">
      <legend className="form-step-title">Adicionar imagens e temas</legend>

      <ZonaUploadImagem
        id="imagens"
        name="imagens"
        multiple
        onArquivos={onAdicionarImagens}
      />

      {total > 0 && (
        <div className="flex flex-col gap-3">
          <p className="form-label">
            {total} {total === 1 ? "imagem adicionada" : "imagens adicionadas"}
          </p>

          <ul className="flex flex-col gap-3">
            {imagens.map((imagem, indice) => (
              <CartaoImagem
                key={imagem.id}
                imagem={imagem}
                indice={indice}
                total={total}
                temasDisponiveis={temasDisponiveis}
                editandoTema={imagemEditandoId === imagem.id}
                onAbrirEditor={() => setImagemEditandoId(imagem.id)}
                onFecharEditor={() => setImagemEditandoId(null)}
                onSelecionarTema={(tema) => selecionarTema(imagem.id, tema)}
                onCriarTema={(nome) => criarTema(imagem.id, nome)}
                onAtualizarTextoAlternativo={(texto) =>
                  onAtualizarTextoAlternativo(imagem.id, texto)
                }
                onDefinirPrincipal={() => onDefinirPrincipal(imagem.id)}
                onMover={(deslocamento) => onMoverImagem(imagem.id, deslocamento)}
                onRemover={() => onRemoverImagem(imagem.id)}
              />
            ))}
          </ul>
        </div>
      )}
      {erro && (
        <p role="alert" className="form-error">
          {erro}
        </p>
      )}
    </fieldset>
  );
}

export default EtapaImagensTemas;
