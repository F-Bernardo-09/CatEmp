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
  precoReposicao: string;
  emDestaque: boolean;
  onTipoChange: (tipo: TipoItem | "") => void;
  onModalidadeChange: (modalidade: ModalidadeItem | "") => void;
  onTituloChange: (titulo: string) => void;
  onDescricaoChange: (descricao: string) => void;
  onPrecoChange: (preco: string) => void;
  onPrecoReposicaoChange: (precoReposicao: string) => void;
  onDestaqueChange: (emDestaque: boolean) => void;
}

function EtapaDadosBasicos({
  etapaRef,
  tipo,
  modalidade,
  titulo,
  descricao,
  preco,
  precoReposicao,
  emDestaque,
  onTipoChange,
  onModalidadeChange,
  onTituloChange,
  onDescricaoChange,
  onPrecoChange,
  onPrecoReposicaoChange,
  onDestaqueChange,
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
          required: true,
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
            ? "Preço mínimo (R$)"
            : tipo === "produto"
              ? "Preço fixo (R$)"
              : "Preço (R$)"
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

      <label className="flex items-center gap-3 text-sm font-medium text-text">
        <input
          name="emDestaque"
          type="checkbox"
          checked={emDestaque}
          onChange={(event) => onDestaqueChange(event.target.checked)}
          className="size-4 accent-primary"
        />
        Exibir este item em destaque no catálogo
      </label>

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
    </fieldset>
  );
}

export default EtapaDadosBasicos;
