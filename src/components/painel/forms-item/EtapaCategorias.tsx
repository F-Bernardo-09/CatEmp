import { useState } from "react";
import type { KeyboardEvent, Ref } from "react";

import CampoFormulario from "./CampoFormulario";

interface EtapaCategoriasProps {
  etapaRef: Ref<HTMLFieldSetElement>;
  categoriasDisponiveis: string[];
  categoriasSelecionadas: string[];
  onAlternarCategoria: (categoria: string) => void;
  onAdicionarCategoria: (categoria: string) => string | null;
}

const LIMITE_CATEGORIAS = 5;

function EtapaCategorias({
  etapaRef,
  categoriasDisponiveis,
  categoriasSelecionadas,
  onAlternarCategoria,
  onAdicionarCategoria,
}: EtapaCategoriasProps) {
  const [novaCategoria, setNovaCategoria] = useState("");
  const [erroCategoria, setErroCategoria] = useState("");

  function handleCategoriaKeyDown(event: KeyboardEvent<HTMLInputElement>) {
    if (event.key === "Enter") {
      event.preventDefault();
      adicionarCategoria();
    }
  }

  function adicionarCategoria() {
    const erro = onAdicionarCategoria(novaCategoria);
    setErroCategoria(erro ?? "");
    if (!erro) setNovaCategoria("");
  }

  return (
    <fieldset ref={etapaRef} className="form-step">
      <legend className="form-step-title">Categorias</legend>

      <div>
        <div className="flex flex-wrap gap-2">
          {categoriasDisponiveis.map((categoria) => {
            const selecionada = categoriasSelecionadas.includes(categoria);

            return (
              <button
                key={categoria}
                type="button"
                aria-pressed={selecionada}
                disabled={
                  !selecionada &&
                  categoriasSelecionadas.length >= LIMITE_CATEGORIAS
                }
                onClick={() => {
                  setErroCategoria("");
                  onAlternarCategoria(categoria);
                }}
                className={`
                  rounded-full border px-5 py-2 text-sm transition-colors
                  ${
                    selecionada
                      ? "border-primary bg-primary text-text-inverse"
                      : "border-transparent bg-surface text-text-secondary hover:border-border"
                  }
                  disabled:cursor-not-allowed disabled:opacity-50
                `}
              >
                {categoria}
              </button>
            );
          })}
        </div>
        {categoriasDisponiveis.length === 0 && (
          <p className="mt-2 text-sm text-text-secondary">
            Nenhuma categoria adicionada.
          </p>
        )}
        <p className="form-counter" aria-live="polite">
          {categoriasSelecionadas.length}/{LIMITE_CATEGORIAS} selecionadas
        </p>
      </div>

      <div className="flex items-start gap-3">
        <CampoFormulario
          id="novaCategoria"
          label="Nova categoria"
          error={erroCategoria}
          counter={`${novaCategoria.length}/100`}
          containerClassName="min-w-0 flex-1"
          controlProps={{
            name: "novaCategoria",
            type: "text",
            maxLength: 100,
            pattern: String.raw`.*\S.*`,
            title: "O nome da categoria não pode conter apenas espaços.",
            placeholder: "Nome",
            value: novaCategoria,
            onChange: (event) => {
              setNovaCategoria(event.target.value);
              setErroCategoria("");
            },
            onKeyDown: handleCategoriaKeyDown,
          }}
        />
        <button
          type="button"
          onClick={adicionarCategoria}
          disabled={!novaCategoria.trim()}
          className="mt-7 shrink-0 rounded-button bg-primary px-6 py-3 text-sm font-semibold text-text-inverse transition-colors hover:bg-primary-hover disabled:cursor-not-allowed disabled:opacity-50"
        >
          Adicionar
        </button>
      </div>

    </fieldset>
  );
}

export default EtapaCategorias;
