import { useState } from "react";
import type { ChangeEvent, KeyboardEvent, Ref } from "react";

import CampoFormulario from "./CampoFormulario";
import { MiniaturaImagem } from "./MiniaturaImagem";
import type { ImagemItem } from "./types";

interface EtapaImagensTemasProps {
  etapaRef: Ref<HTMLFieldSetElement>;
  imagens: ImagemItem[];
  temasDisponiveis: string[];
  onAdicionarImagens: (arquivos: File[]) => void;
  onAdicionarTema: (tema: string) => string | null;
  onAtualizarTema: (id: string, tema: string) => void;
  onRemoverImagem: (id: string) => void;
}

function EtapaImagensTemas({
  etapaRef,
  imagens,
  temasDisponiveis,
  onAdicionarImagens,
  onAdicionarTema,
  onAtualizarTema,
  onRemoverImagem,
}: EtapaImagensTemasProps) {
  const [erroArquivo, setErroArquivo] = useState("");
  const [novoTema, setNovoTema] = useState("");
  const [erroTema, setErroTema] = useState("");
  const [imagemEditandoTemaId, setImagemEditandoTemaId] = useState<
    string | null
  >(null);

  function handleAdicionarImagens(event: ChangeEvent<HTMLInputElement>) {
    const arquivos = Array.from(event.currentTarget.files ?? []);
    const tiposAceitos = ["image/jpeg", "image/png", "image/webp"];
    const arquivosValidos = arquivos.filter((arquivo) =>
      tiposAceitos.includes(arquivo.type),
    );
    const arquivosInvalidos = arquivos
      .filter((arquivo) => !tiposAceitos.includes(arquivo.type))
      .map((arquivo) => arquivo.name);

    onAdicionarImagens(arquivosValidos);
    setErroArquivo(
      arquivosInvalidos.length
        ? `Formato não aceito: ${arquivosInvalidos.join(", ")}. Use JPEG, PNG ou WebP.`
        : "",
    );
    event.currentTarget.value = "";
  }

  function handleTemaKeyDown(
    imagemId: string,
    event: KeyboardEvent<HTMLInputElement>,
  ) {
    if (event.key === "Enter") {
      event.preventDefault();
      adicionarTema(imagemId);
    }
  }

  function adicionarTema(imagemId: string) {
    const tema = onAdicionarTema(novoTema);

    if (!tema) {
      setErroTema("Informe o nome do tema.");
      return;
    }

    onAtualizarTema(imagemId, tema);
    setNovoTema("");
    setErroTema("");
    setImagemEditandoTemaId(null);
  }

  function alternarEditorTema(imagemId: string) {
    setImagemEditandoTemaId((idAtual) =>
      idAtual === imagemId ? null : imagemId,
    );
    setNovoTema("");
    setErroTema("");
  }

  return (
    <fieldset ref={etapaRef} className="form-step">
      <legend className="form-step-title">
        Adicionar imagens e temas
      </legend>

      <CampoFormulario
        id="imagens"
        label="Imagens do item"
        error={erroArquivo}
        controlProps={{
          name: "imagens",
          type: "file",
          accept: ".jpg,.jpeg,.png,.webp,image/jpeg,image/png,image/webp",
          multiple: true,
          onChange: handleAdicionarImagens,
        }}
      />

      {imagens.length === 0 ? (
        <p className="text-sm text-text-secondary">Nenhuma imagem adicionada.</p>
      ) : (
        <div className="flex flex-col gap-4">
          {imagens.map((imagem) => (
            <article
              key={imagem.id}
              className="flex flex-col gap-4 rounded-card border border-border p-4 sm:flex-row"
            >
              <MiniaturaImagem
                arquivo={imagem.arquivo}
                alt="Pré-visualização do item"
              />
              <div className="flex min-w-0 flex-1 flex-col gap-4">
                <p className="truncate text-sm text-text-secondary">
                  {imagem.arquivo.name}
                </p>
                <div>
                  {imagem.tema && (
                    <p className="mb-2 text-sm text-text-secondary">
                      Tema: {imagem.tema}
                    </p>
                  )}
                  <button
                    type="button"
                    aria-expanded={imagemEditandoTemaId === imagem.id}
                    aria-controls={`temas-imagem-${imagem.id}`}
                    onClick={() => alternarEditorTema(imagem.id)}
                    className="rounded-button border border-border px-5 py-2 text-sm font-semibold text-text transition-colors hover:bg-surface"
                  >
                    {imagem.tema ? "Alterar tema" : "Adicionar tema"}
                  </button>
                  {imagemEditandoTemaId === imagem.id && (
                    <div
                      id={`temas-imagem-${imagem.id}`}
                      className="mt-4 flex flex-col gap-4"
                    >
                      {temasDisponiveis.length > 0 && (
                        <div>
                          <p className="form-label">Temas existentes</p>
                          <div className="flex flex-wrap gap-2">
                            {temasDisponiveis.map((tema) => (
                              <button
                                key={tema}
                                type="button"
                                aria-pressed={imagem.tema === tema}
                                onClick={() => {
                                  onAtualizarTema(imagem.id, tema);
                                  setImagemEditandoTemaId(null);
                                  setErroTema("");
                                }}
                                className={`
                                  rounded-full border px-5 py-2 text-sm transition-colors
                                  ${
                                    imagem.tema === tema
                                      ? "border-primary bg-primary text-text-inverse"
                                      : "border-transparent bg-surface text-text-secondary hover:border-border"
                                  }
                                `}
                              >
                                {tema}
                              </button>
                            ))}
                          </div>
                        </div>
                      )}

                      <div className="flex items-start gap-3">
                        <CampoFormulario
                          id={`novo-tema-${imagem.id}`}
                          label="Criar tema"
                          error={erroTema}
                          counter={`${novoTema.length}/100`}
                          containerClassName="min-w-0 flex-1"
                          controlProps={{
                            name: `novo-tema-${imagem.id}`,
                            type: "text",
                            maxLength: 100,
                            pattern: String.raw`.*\S.*`,
                            title: "O nome do tema não pode conter apenas espaços.",
                            placeholder: "Nome do tema",
                            value: novoTema,
                            onChange: (event) => {
                              setNovoTema(event.target.value);
                              setErroTema("");
                            },
                            onKeyDown: (event) =>
                              handleTemaKeyDown(imagem.id, event),
                          }}
                        />
                        <button
                          type="button"
                          onClick={() => adicionarTema(imagem.id)}
                          disabled={!novoTema.trim()}
                          className="mt-7 shrink-0 rounded-button bg-primary px-6 py-3 text-sm font-semibold text-text-inverse transition-colors hover:bg-primary-hover disabled:cursor-not-allowed disabled:opacity-50"
                        >
                          Criar e adicionar
                        </button>
                      </div>
                    </div>
                  )}
                </div>
                <button
                  type="button"
                  onClick={() => onRemoverImagem(imagem.id)}
                  className="self-start text-sm font-medium text-text-secondary underline"
                >
                  Remover imagem
                </button>
              </div>
            </article>
          ))}
        </div>
      )}

    </fieldset>
  );
}

export default EtapaImagensTemas;
