import { useEffect, useRef, useState } from "react";
import type { KeyboardEvent } from "react";

import { IconeCheck, IconeMais, IconeTag } from "../../../ui/icones";
import type { ImagemItem } from "../types";

const TAMANHO_MAXIMO_TEMA = 60;

function classeChip(selecionado: boolean) {
  const base =
    "inline-flex items-center gap-1.5 rounded-full border px-4 py-1.5 text-sm transition-colors";

  return selecionado
    ? `${base} border-primary bg-primary text-text-inverse`
    : `${base} border-border bg-card text-text hover:border-primary`;
}

interface SeletorTemaProps {
  imagem: ImagemItem;
  temasDisponiveis: string[];
  aberto: boolean;
  onAbrir: () => void;
  onFechar: () => void;
  onSelecionar: (tema: string) => void;
  /** Retorna `true` quando o tema foi criado e aplicado à imagem. */
  onCriar: (nome: string) => boolean;
}

function SeletorTema({
  imagem,
  temasDisponiveis,
  aberto,
  onAbrir,
  onFechar,
  onSelecionar,
  onCriar,
}: SeletorTemaProps) {
  const [consulta, setConsulta] = useState("");
  const [erro, setErro] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);
  const idPainel = `temas-imagem-${imagem.id}`;

  useEffect(() => {
    if (aberto) inputRef.current?.focus();
  }, [aberto]);

  const termo = consulta.trim();
  const termoNormalizado = termo.toLowerCase();
  const temaExistente = temasDisponiveis.find(
    (tema) => tema.toLowerCase() === termoNormalizado,
  );
  const temasFiltrados = temasDisponiveis.filter((tema) =>
    tema.toLowerCase().includes(termoNormalizado),
  );
  const podeCriar = termo !== "" && !temaExistente;
  const semResultados =
    temasDisponiveis.length > 0 && termo !== "" && temasFiltrados.length === 0;

  function fechar() {
    setConsulta("");
    setErro("");
    onFechar();
  }

  function confirmar() {
    if (temaExistente) {
      onSelecionar(temaExistente);
      return;
    }

    if (podeCriar && !onCriar(termo)) {
      setErro("Não foi possível criar o tema. Tente outro nome.");
    }
  }

  function handleKeyDown(event: KeyboardEvent<HTMLInputElement>) {
    if (event.key === "Enter") {
      event.preventDefault();
      confirmar();
    }

    if (event.key === "Escape") {
      event.stopPropagation();
      fechar();
    }
  }

  if (!aberto) {
    return imagem.tema ? (
      <div className="flex flex-wrap items-center gap-3">
        <span className={classeChip(true)}>
          <IconeTag />
          {imagem.tema}
        </span>
        <button
          type="button"
          aria-expanded={false}
          aria-controls={idPainel}
          onClick={onAbrir}
          className="text-sm font-medium text-text-secondary underline hover:text-text"
        >
          Alterar tema
        </button>
      </div>
    ) : (
      <button
        type="button"
        aria-expanded={false}
        aria-controls={idPainel}
        onClick={onAbrir}
        className="inline-flex items-center gap-1.5 self-start rounded-full border border-dashed border-border px-4 py-1.5 text-sm font-medium text-text-secondary transition-colors hover:border-primary hover:text-text"
      >
        <IconeMais />
        Adicionar tema
      </button>
    );
  }

  return (
    <div
      id={idPainel}
      className="flex flex-col gap-3 rounded-card bg-surface/60 p-4"
    >
      <div>
        <input
          ref={inputRef}
          type="text"
          value={consulta}
          maxLength={TAMANHO_MAXIMO_TEMA}
          placeholder="Buscar ou criar tema"
          aria-label="Buscar ou criar tema"
          aria-invalid={erro ? true : undefined}
          onChange={(event) => {
            setConsulta(event.target.value);
            setErro("");
          }}
          onKeyDown={handleKeyDown}
          className={`form-control ${erro ? "form-control-invalid" : ""}`}
        />
        {erro && (
          <p role="alert" className="form-error">
            {erro}
          </p>
        )}
        {consulta.length > 0 && (
          <p className="form-counter">
            {consulta.length}/{TAMANHO_MAXIMO_TEMA}
          </p>
        )}
      </div>

      {(temasFiltrados.length > 0 || podeCriar) && (
        <div className="flex flex-wrap gap-2">
          {temasFiltrados.map((tema) => (
            <button
              key={tema}
              type="button"
              aria-pressed={imagem.tema === tema}
              onClick={() => onSelecionar(tema)}
              className={classeChip(imagem.tema === tema)}
            >
              {imagem.tema === tema && <IconeCheck />}
              {tema}
            </button>
          ))}

          {podeCriar && (
            <button
              type="button"
              onClick={confirmar}
              className="inline-flex items-center gap-1.5 rounded-full border border-dashed border-primary bg-card px-4 py-1.5 text-sm font-medium text-text transition-colors hover:bg-primary hover:text-text-inverse"
            >
              <IconeMais />
              Criar “{termo}”
            </button>
          )}
        </div>
      )}

      {temasDisponiveis.length === 0 && !termo && (
        <p className="text-sm text-text-secondary">
          Ainda não há temas. Digite um nome para criar o primeiro.
        </p>
      )}

      {semResultados && !podeCriar && (
        <p className="text-sm text-text-secondary">Nenhum tema encontrado.</p>
      )}

      <button
        type="button"
        aria-expanded
        aria-controls={idPainel}
        onClick={fechar}
        className="self-start text-sm font-medium text-text-secondary underline hover:text-text"
      >
        Cancelar
      </button>
    </div>
  );
}

export default SeletorTema;
