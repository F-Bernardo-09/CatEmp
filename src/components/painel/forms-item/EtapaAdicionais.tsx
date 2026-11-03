import { useState } from "react";
import type { ChangeEvent, FormEvent, Ref } from "react";

import { MiniaturaImagem } from "./MiniaturaImagem";
import CampoFormulario from "./CampoFormulario";
import { obterMensagemValidacao } from "./estilos";
import type { AdicionalServico } from "./types";

interface EtapaAdicionaisProps {
  etapaRef: Ref<HTMLFieldSetElement>;
  adicionais: AdicionalServico[];
  onAdicionarAdicional: () => void;
  onAtualizarAdicional: (
    id: string,
    alteracoes: Partial<Omit<AdicionalServico, "id">>,
  ) => void;
  onRemoverAdicional: (id: string) => void;
}

function EtapaAdicionais({
  etapaRef,
  adicionais,
  onAdicionarAdicional,
  onAtualizarAdicional,
  onRemoverAdicional,
}: EtapaAdicionaisProps) {
  const [erros, setErros] = useState<Record<string, string>>({});

  function handleImagemChange(
    id: string,
    event: ChangeEvent<HTMLInputElement>,
  ) {
    const imagem = event.currentTarget.files?.[0] ?? null;
    const tipoAceito =
      imagem &&
      ["image/jpeg", "image/png", "image/webp"].includes(imagem.type);
    const chave = `imagem-${id}`;
    const mensagem = imagem && !tipoAceito
      ? "Use uma imagem no formato JPEG, PNG ou WebP."
      : "";

    event.currentTarget.setCustomValidity(mensagem);
    setErros((errosAtuais) => ({ ...errosAtuais, [chave]: mensagem }));
    onAtualizarAdicional(id, {
      imagem: tipoAceito ? imagem : null,
    });
  }

  function validarCampo(
    chave: string,
    nomeCampo: string,
    event: FormEvent<HTMLInputElement>,
  ) {
    const mensagem = obterMensagemValidacao(event.currentTarget, nomeCampo);
    event.currentTarget.setCustomValidity(mensagem);
    setErros((errosAtuais) => ({ ...errosAtuais, [chave]: mensagem }));
  }

  function limparErro(
    chave: string,
    event: FormEvent<HTMLInputElement>,
  ) {
    event.currentTarget.setCustomValidity("");
    setErros((errosAtuais) => ({ ...errosAtuais, [chave]: "" }));
  }

  return (
    <fieldset ref={etapaRef} className="form-step">
      <legend className="form-step-title">
        Adicionais do serviço
      </legend>
      {adicionais.map((adicional, indice) => (
        <article
          key={adicional.id}
          className="flex flex-col gap-4 rounded-card border border-border p-4"
        >
          <h3 className="font-semibold text-text">Adicional {indice + 1}</h3>
          <div>
            <CampoFormulario
              id={`imagem-adicional-${adicional.id}`}
              label="Imagem"
              error={erros[`imagem-${adicional.id}`]}
              controlProps={{
                type: "file",
                accept: ".jpg,.jpeg,.png,.webp,image/jpeg,image/png,image/webp",
                required: true,
                onInvalid: (event) =>
                  validarCampo(
                    `imagem-${adicional.id}`,
                    "a imagem do adicional",
                    event,
                  ),
                onChange: (event) => handleImagemChange(adicional.id, event),
              }}
            />
            {adicional.imagem && (
              <MiniaturaImagem
                arquivo={adicional.imagem}
                alt={`Pré-visualização do adicional ${indice + 1}`}
              />
            )}
          </div>
          <CampoFormulario
            id={`nome-adicional-${adicional.id}`}
            label="Nome"
            error={erros[`nome-${adicional.id}`]}
            counter={`${adicional.nome.length}/100`}
            controlProps={{
              type: "text",
              maxLength: 100,
              pattern: String.raw`.*\S.*`,
              title: "O nome não pode conter apenas espaços.",
              required: true,
              value: adicional.nome,
              onInvalid: (event) =>
                validarCampo(
                  `nome-${adicional.id}`,
                  "o nome do adicional",
                  event,
                ),
              onChange: (event) => {
                limparErro(`nome-${adicional.id}`, event);
                onAtualizarAdicional(adicional.id, {
                  nome: event.target.value,
                });
              },
            }}
          />
          <CampoFormulario
            id={`preco-adicional-${adicional.id}`}
            label="Preço mínimo (R$)"
            error={erros[`preco-${adicional.id}`]}
            controlProps={{
              type: "number",
              min: "0",
              step: "0.01",
              required: true,
              value: adicional.precoMinimo,
              onInvalid: (event) =>
                validarCampo(
                  `preco-${adicional.id}`,
                  "o preço mínimo",
                  event,
                ),
              onChange: (event) => {
                limparErro(`preco-${adicional.id}`, event);
                onAtualizarAdicional(adicional.id, {
                  precoMinimo: event.target.value,
                });
              },
            }}
          />
          <button
            type="button"
            onClick={() => onRemoverAdicional(adicional.id)}
            className="self-start text-sm font-medium text-text-secondary underline"
          >
            Remover adicional
          </button>
        </article>
      ))}

      <button
        type="button"
        onClick={onAdicionarAdicional}
        className="self-start rounded-button border border-border px-6 py-3 text-sm font-semibold text-text transition-colors hover:bg-surface"
      >
        Adicionar adicional
      </button>
    </fieldset>
  );
}

export default EtapaAdicionais;
