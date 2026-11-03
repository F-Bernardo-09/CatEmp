import { useState } from "react";
import type { FormEvent, Ref } from "react";

import CampoFormulario from "./CampoFormulario";
import { obterMensagemValidacao } from "./estilos";
import type { TipoItem } from "./types";

interface EtapaDadosBasicosProps {
  etapaRef: Ref<HTMLFieldSetElement>;
  tipo: TipoItem | "";
  titulo: string;
  descricao: string;
  preco: string;
  onTipoChange: (tipo: TipoItem | "") => void;
  onTituloChange: (titulo: string) => void;
  onDescricaoChange: (descricao: string) => void;
  onPrecoChange: (preco: string) => void;
}

function EtapaDadosBasicos({
  etapaRef,
  tipo,
  titulo,
  descricao,
  preco,
  onTipoChange,
  onTituloChange,
  onDescricaoChange,
  onPrecoChange,
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
          onInvalid: (event) => validarCampo("a descrição", "descricao", event),
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
            ? "Valor mínimo (R$) *"
            : tipo === "produto"
              ? "Valor fixo (R$) *"
              : "Valor (R$) *"
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
    </fieldset>
  );
}

export default EtapaDadosBasicos;
