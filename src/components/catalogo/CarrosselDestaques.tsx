import { useState } from "react";
import CardItem from "./CardItem";
import type { ItemDestaque } from "./types";

interface CarrosselDestaquesProps {
  itens: ItemDestaque[];
}

function CarrosselDestaques({ itens }: CarrosselDestaquesProps) {
  const [indiceAtivo, setIndiceAtivo] = useState(0);

  if (itens.length === 0) {
    return (
      <section
        id="destaques"
        className="mx-auto max-w-7xl px-5 py-8 sm:px-8"
        aria-label="Itens em destaque"
      >
        <div className="grid min-h-64 place-items-center rounded-card bg-surface p-8 text-center">
          <p className="max-w-md text-text-secondary">
            Ainda não há itens em destaque. Volte em breve para conhecer as
            novidades.
          </p>
        </div>
      </section>
    );
  }

  const indiceSeguro = indiceAtivo % itens.length;
  const itemAtivo = itens[indiceSeguro];

  function navegar(direcao: -1 | 1) {
    setIndiceAtivo((indiceAtual) => {
      const indiceAtualSeguro = indiceAtual % itens.length;
      return (indiceAtualSeguro + direcao + itens.length) % itens.length;
    });
  }

  return (
    <section
      id="destaques"
      className="mx-auto max-w-7xl px-5 py-6 sm:px-8 sm:py-10"
      aria-label="Itens em destaque"
    >
      <div id="destaque-atual" aria-live="polite" aria-atomic="true">
        <CardItem item={itemAtivo} />
      </div>

      {itens.length > 1 && (
        <div className="mt-5 flex items-center justify-between gap-4">
          <div
            className="flex items-center gap-2"
            aria-label="Escolher destaque"
          >
            {itens.map((item, indice) => (
              <button
                key={item.id}
                type="button"
                className={`h-2.5 rounded-full transition-all ${
                  indice === indiceSeguro
                    ? "w-8 bg-primary"
                    : "w-2.5 bg-border hover:bg-primary-hover"
                }`}
                aria-label={`Mostrar destaque ${indice + 1}: ${item.titulo}`}
                aria-current={indice === indiceSeguro ? "true" : undefined}
                aria-controls="destaque-atual"
                onClick={() => setIndiceAtivo(indice)}
              />
            ))}
          </div>

          <div className="flex gap-2">
            <button
              type="button"
              className="grid size-11 place-items-center rounded-full border border-border text-text transition-colors hover:bg-surface focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
              aria-label="Destaque anterior"
              aria-controls="destaque-atual"
              onClick={() => navegar(-1)}
            >
              <svg
                aria-hidden="true"
                viewBox="0 0 24 24"
                className="size-5"
                fill="none"
              >
                <path
                  d="m15 18-6-6 6-6"
                  stroke="currentColor"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                />
              </svg>
            </button>

            <button
              type="button"
              className="grid size-11 place-items-center rounded-full border border-border text-text transition-colors hover:bg-surface focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
              aria-label="Próximo destaque"
              aria-controls="destaque-atual"
              onClick={() => navegar(1)}
            >
              <svg
                aria-hidden="true"
                viewBox="0 0 24 24"
                className="size-5"
                fill="none"
              >
                <path
                  d="m9 18 6-6-6-6"
                  stroke="currentColor"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                />
              </svg>
            </button>
          </div>
        </div>
      )}
    </section>
  );
}

export default CarrosselDestaques;
