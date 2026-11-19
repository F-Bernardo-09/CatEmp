import { useState } from "react";
import type { FormEvent, Ref } from "react";

import CampoFormulario from "./CampoFormulario";
import { obterMensagemValidacao } from "./estilos";
import type { ModalidadeItem, TipoItem } from "./types";

interface EtapaDadosBasicosProps {
  etapaRef: Ref<HTMLFieldSetElement>;
  tipo: TipoItem | "";
  modalidade: ModalidadeItem | "";
  titulo: string;
  descricao: string;
  preco: string;
  altura: string;
  largura: string;
  profundidade: string;
  precoReposicao: string;
  onTipoChange: (tipo: TipoItem | "") => void;
  onModalidadeChange: (modalidade: ModalidadeItem | "") => void;
  onTituloChange: (titulo: string) => void;
  onDescricaoChange: (descricao: string) => void;
  onPrecoChange: (preco: string) => void;
  onAlturaChange: (altura: string) => void;
  onLarguraChange: (largura: string) => void;
  onProfundidadeChange: (profundidade: string) => void;
  onPrecoReposicaoChange: (precoReposicao: string) => void;
}

function EtapaDadosBasicos({
  etapaRef,
  tipo,
  modalidade,
  titulo,
  descricao,
  preco,
  altura,
  largura,
  profundidade,
  precoReposicao,
  onTipoChange,
  onModalidadeChange,
  onTituloChange,
  onDescricaoChange,
  onPrecoChange,
  onAlturaChange,
  onLarguraChange,
  onProfundidadeChange,
  onPrecoReposicaoChange,
}: EtapaDadosBasicosProps) {
  const [erros, setErros] = useState<Record<string, string>>({});

  function validarCampo(
    nome: string,
    chave: string,
    event: FormEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >,
  ) {
    const campo = event.currentTarget;
    const mensagem = obterMensagemValidacao(campo, nome);
    campo.setCustomValidity(mensagem);
    setErros((errosAtuais) => ({ ...errosAtuais, [chave]: mensagem }));
  }

  function limparErro(
    chave: string,
    event: FormEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >,
  ) {
    event.currentTarget.setCustomValidity("");
    setErros((errosAtuais) => ({ ...errosAtuais, [chave]: "" }));
  }

  return (
    <fieldset ref={etapaRef} className="form-step">
      <legend className="form-step-title">Informações básicas</legend>

      <CampoFormulario
        as="select"
        id="tipo"
        label="Tipo de item"
        error={erros.tipo}
        controlProps={{
          name: "tipo",
          required: true,
          value: tipo,
          onInvalid: (event) => validarCampo("o tipo de item", "tipo", event),
          onChange: (event) => {
            limparErro("tipo", event);
            onTipoChange(event.target.value as TipoItem | "");
          },
        }}
      >
        <option value="" disabled>
          Selecione o tipo
        </option>
        <option value="produto">Produto</option>
        <option value="servico">Serviço</option>
      </CampoFormulario>

      <CampoFormulario
        as="select"
        id="modalidade"
        label="Modalidade"
        error={erros.modalidade}
        controlProps={{
          name: "modalidade",
          required: true,
          value: modalidade,
          onInvalid: (event) =>
            validarCampo("a modalidade", "modalidade", event),
          onChange: (event) => {
            limparErro("modalidade", event);
            onModalidadeChange(event.target.value as ModalidadeItem | "");
          },
        }}
      >
        <option value="" disabled>
          Selecione a modalidade
        </option>
        <option value="aluguel">Aluguel</option>
        <option value="venda">Venda</option>
      </CampoFormulario>

      <CampoFormulario
        id="titulo"
        label="Título"
        error={erros.titulo}
        counter={`${titulo.length}/100`}
        controlProps={{
          name: "titulo",
          type: "text",
          maxLength: 100,
          pattern: String.raw`.*\S.*`,
          title: "O título não pode conter apenas espaços.",
          placeholder: "Ex.: Decoração de aniversário",
          required: true,
          value: titulo,
          onInvalid: (event) => validarCampo("o título", "titulo", event),
          onChange: (event) => {
            limparErro("titulo", event);
            onTituloChange(event.target.value);
          },
        }}
      />

      <CampoFormulario
        as="textarea"
        id="descricao"
        label="Descrição"
        counter={`${descricao.length}/500`}
        error={erros.descricao}
        className="min-h-32 resize-y"
        controlProps={{
          name: "descricao",
          rows: 5,
          maxLength: 500,
          placeholder: "Descrição",
          value: descricao,
          onInvalid: (event) =>
            validarCampo("a descrição", "descricao", event),
          onChange: (event) => {
            limparErro("descricao", event);
            onDescricaoChange(event.target.value);
          },
        }}
      />

      <CampoFormulario
        id="preco"
        label={
          tipo === "servico"
            ? "Valor mínimo (R$)"
            : tipo === "produto"
              ? "Valor do produto (R$)"
              : "Valor (R$)"
        }
        error={erros.preco}
        controlProps={{
          name: "preco",
          type: "number",
          min: "0.01",
          step: "0.01",
          placeholder: "0,00",
          required: true,
          value: preco,
          onInvalid: (event) => validarCampo("o valor", "preco", event),
          onChange: (event) => {
            limparErro("preco", event);
            onPrecoChange(event.target.value);
          },
        }}
      />

      <CampoFormulario
        id="precoReposicao"
        label="Preço de reposição (R$)"
        error={erros.precoReposicao}
        controlProps={{
          name: "precoReposicao",
          type: "number",
          min: "0",
          step: "0.01",
          placeholder: "0,00",
          required: true,
          value: precoReposicao,
          onInvalid: (event) =>
            validarCampo("o preço de reposição", "precoReposicao", event),
          onChange: (event) => {
            limparErro("precoReposicao", event);
            onPrecoReposicaoChange(event.target.value);
          },
        }}
      />

      <fieldset className="rounded-card border border-border p-4">
        <legend className="px-1 text-sm font-semibold text-text">
          Dimensões (cm)
        </legend>
        <div className="grid gap-4 sm:grid-cols-3">
          <CampoFormulario
            id="altura"
            label="Altura"
            error={erros.altura}
            controlProps={{
              name: "altura",
              type: "number",
              min: "0.01",
              step: "0.01",
              placeholder: "0,00",
              required: true,
              value: altura,
              onInvalid: (event) => validarCampo("a altura", "altura", event),
              onChange: (event) => {
                limparErro("altura", event);
                onAlturaChange(event.target.value);
              },
            }}
          />
          <CampoFormulario
            id="largura"
            label="Largura"
            error={erros.largura}
            controlProps={{
              name: "largura",
              type: "number",
              min: "0.01",
              step: "0.01",
              placeholder: "0,00",
              required: true,
              value: largura,
              onInvalid: (event) =>
                validarCampo("a largura", "largura", event),
              onChange: (event) => {
                limparErro("largura", event);
                onLarguraChange(event.target.value);
              },
            }}
          />
          <CampoFormulario
            id="profundidade"
            label="Profundidade"
            error={erros.profundidade}
            controlProps={{
              name: "profundidade",
              type: "number",
              min: "0.01",
              step: "0.01",
              placeholder: "0,00",
              required: true,
              value: profundidade,
              onInvalid: (event) =>
                validarCampo("a profundidade", "profundidade", event),
              onChange: (event) => {
                limparErro("profundidade", event);
                onProfundidadeChange(event.target.value);
              },
            }}
          />
        </div>
      </fieldset>
    </fieldset>
  );
}

export default EtapaDadosBasicos;
