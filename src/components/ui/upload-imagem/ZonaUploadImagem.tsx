import { useRef, useState } from "react";
import type { ChangeEvent, DragEvent, FormEvent, ReactNode } from "react";

import { IconeUpload } from "../icones";
import {
  ACCEPT_IMAGENS,
  mensagemFormatoInvalido,
  separarImagensPorTipo,
} from "./validacao";

interface ZonaUploadImagemProps {
  id: string;
  name?: string;
  /** Aceita várias imagens. Sem isso, só a primeira imagem válida é usada. */
  multiple?: boolean;
  /**
   * Torna o campo obrigatório na validação nativa do formulário.
   * Deixa de ser exigido assim que `previa` é informada.
   */
  required?: boolean;
  /** Erro externo (por exemplo, de campo obrigatório). Tem prioridade. */
  erro?: string;
  /** Prévia da imagem já escolhida (modo de uma imagem). */
  previa?: ReactNode;
  /** Chamado apenas com arquivos de formato válido. */
  onArquivos: (arquivos: File[]) => void;
  onInvalid?: (event: FormEvent<HTMLInputElement>) => void;
}

function ZonaUploadImagem({
  id,
  name,
  multiple = false,
  required = false,
  erro = "",
  previa,
  onArquivos,
  onInvalid,
}: ZonaUploadImagemProps) {
  const [arrastando, setArrastando] = useState(false);
  const [erroFormato, setErroFormato] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  const mensagemErro = erro || erroFormato;
  const idDica = `${id}-dica`;
  const idErro = `${id}-erro`;

  function processar(arquivos: File[]) {
    const { validas, invalidas } = separarImagensPorTipo(arquivos);
    const aceitas = multiple ? validas : validas.slice(0, 1);

    inputRef.current?.setCustomValidity("");
    setErroFormato(mensagemFormatoInvalido(invalidas));

    if (aceitas.length > 0) onArquivos(aceitas);
  }

  function handleChange(event: ChangeEvent<HTMLInputElement>) {
    const input = event.currentTarget;
    processar(Array.from(input.files ?? []));
    input.value = "";
  }

  function handleDragOver(event: DragEvent<HTMLLabelElement>) {
    event.preventDefault();
    setArrastando(true);
  }

  function handleDragLeave(event: DragEvent<HTMLLabelElement>) {
    if (!event.currentTarget.contains(event.relatedTarget as Node | null)) {
      setArrastando(false);
    }
  }

  function handleDrop(event: DragEvent<HTMLLabelElement>) {
    event.preventDefault();
    setArrastando(false);
    processar(Array.from(event.dataTransfer.files));
  }

  let estado = "border-border bg-card hover:border-primary hover:bg-surface/60";
  if (mensagemErro) estado = "border-red-700 bg-card";
  if (arrastando) estado = "border-primary bg-surface";

  const textoPrincipal = arrastando
    ? "Solte para adicionar"
    : multiple
      ? "Arraste as imagens ou clique para selecionar"
      : "Arraste a imagem ou clique para selecionar";

  const dica = multiple
    ? "JPEG, PNG ou WebP. Você pode enviar várias de uma vez."
    : "JPEG, PNG ou WebP.";

  return (
    <div>
      <label
        htmlFor={id}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={`flex cursor-pointer rounded-card border-2 border-dashed transition-colors has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-primary has-[:focus-visible]:ring-offset-2 ${
          previa
            ? "flex-col items-center gap-4 p-4 sm:flex-row"
            : "flex-col items-center gap-3 px-6 py-8 text-center"
        } ${estado}`}
      >
        <input
          ref={inputRef}
          id={id}
          name={name}
          type="file"
          accept={ACCEPT_IMAGENS}
          multiple={multiple}
          required={required && !previa}
          onChange={handleChange}
          onInvalid={onInvalid}
          aria-describedby={mensagemErro ? idErro : idDica}
          className="sr-only"
        />

        {previa ?? (
          <span className="flex size-12 items-center justify-center rounded-full bg-surface text-text">
            <IconeUpload className="size-6" />
          </span>
        )}

        <span
          className={`flex flex-col gap-1 ${previa ? "text-center sm:text-left" : ""}`}
        >
          <span className="text-sm font-semibold text-text">
            {previa && !arrastando ? "Trocar imagem" : textoPrincipal}
          </span>
          <span id={idDica} className="text-sm text-text-secondary">
            {dica}
          </span>
        </span>
      </label>

      {mensagemErro && (
        <p id={idErro} role="alert" className="form-error">
          {mensagemErro}
        </p>
      )}
    </div>
  );
}

export default ZonaUploadImagem;
