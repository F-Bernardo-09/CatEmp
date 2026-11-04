import { useState } from "react";
import type { FormEvent, Ref } from "react";

import { IconeLixeira, IconeMais } from "../../ui/icones";
import { ZonaUploadImagem } from "../../ui/upload-imagem";
import CampoFormulario from "./CampoFormulario";
import { obterMensagemValidacao } from "./estilos";
import { MiniaturaImagem } from "./MiniaturaImagem";
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

  function definirErro(chave: string, mensagem: string) {
    setErros((errosAtuais) => ({ ...errosAtuais, [chave]: mensagem }));
  }

  function validarCampo(
    chave: string,
    nomeCampo: string,
    event: FormEvent<HTMLInputElement>,
  ) {
    const mensagem = obterMensagemValidacao(event.currentTarget, nomeCampo);
    event.currentTarget.setCustomValidity(mensagem);
    definirErro(chave, mensagem);
  }

  function limparErro(chave: string, event: FormEvent<HTMLInputElement>) {
    event.currentTarget.setCustomValidity("");
    definirErro(chave, "");
  }

  function handleImagem(id: string, [imagem]: File[]) {
    definirErro(`imagem-${id}`, "");
    onAtualizarAdicional(id, { imagem });
  }

  return (
    <fieldset ref={etapaRef} className="form-step">
      <legend className="form-step-title">Adicionais do serviço</legend>

      {adicionais.length === 0 && (
        <p className="text-sm text-text-secondary">
          Nenhum adicional adicionado.
        </p>
      )}

      {adicionais.length > 0 && (
        <ul className="flex flex-col gap-4">
          {adicionais.map((adicional, indice) => (
            <li
              key={adicional.id}
              className="flex flex-col gap-4 rounded-card border border-border bg-card p-4"
            >
              <div className="flex items-center justify-between gap-3">
                <h3 className="font-semibold text-text">
                  Adicional {indice + 1}
                </h3>
                <button
                  type="button"
                  aria-label={`Remover adicional ${indice + 1}`}
                  onClick={() => onRemoverAdicional(adicional.id)}
                  className="-m-1.5 shrink-0 rounded-full p-1.5 text-text-secondary transition-colors hover:bg-surface hover:text-text"
                >
                  <IconeLixeira className="size-5" />
                </button>
              </div>

              <ZonaUploadImagem
                id={`imagem-adicional-${adicional.id}`}
                required
                erro={erros[`imagem-${adicional.id}`]}
                previa={
                  adicional.imagem && (
                    <MiniaturaImagem
                      arquivo={adicional.imagem}
                      alt={`Pré-visualização do adicional ${indice + 1}`}
                    />
                  )
                }
                onArquivos={(arquivos) => handleImagem(adicional.id, arquivos)}
                onInvalid={(event) =>
                  validarCampo(
                    `imagem-${adicional.id}`,
                    "a imagem do adicional",
                    event,
                  )
                }
              />

              <div className="grid gap-4 sm:grid-cols-[1fr_12rem]">
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
              </div>
            </li>
          ))}
        </ul>
      )}

      <button
        type="button"
        onClick={onAdicionarAdicional}
        className="inline-flex items-center gap-2 self-start rounded-button border border-border px-6 py-3 text-sm font-semibold text-text transition-colors hover:bg-surface"
      >
        <IconeMais />
        Adicionar adicional
      </button>
    </fieldset>
  );
}

export default EtapaAdicionais;
