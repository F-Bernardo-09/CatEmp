import { useRef, useState } from "react";
import type { FormEvent } from "react";

type TipoItem = "produto" | "servico";
type SituacaoItem = "rascunho" | "publicado";

interface FormItemProps {
  itemId?: string;
}

interface DadosFormulario {
  tipo: TipoItem | "";
  titulo: string;
  descricao: string;
  dimensoes: string;
  preco: string;
  categorias: string[];
  situacao: SituacaoItem;
  destaque: boolean;
}

function FormItem({ itemId }: FormItemProps) {
  const [etapaAtual, setEtapaAtual] = useState(1);
  const etapaRef = useRef<HTMLFieldSetElement>(null);

  const [dados, setDados] = useState<DadosFormulario>({
    tipo: "",
    titulo: "",
    descricao: "",
    dimensoes: "",
    preco: "",
    categorias: [],
    situacao: "rascunho",
    destaque: false,
  });

  const totalEtapas = 4;

  function atualizarCampo<K extends keyof DadosFormulario>(
    campo: K,
    valor: DadosFormulario[K],
  ) {
    setDados((dadosAtuais) => ({
      ...dadosAtuais,
      [campo]: valor,
    }));
  }

  function avancarEtapa() {
    if (!etapaRef.current?.reportValidity()) {
      return;
    }

    setEtapaAtual((etapa) => Math.min(etapa + 1, totalEtapas));
  }

  function voltarEtapa() {
    setEtapaAtual((etapa) => Math.max(etapa - 1, 1));
  }

  function finalizarFormulario(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    // A integração com o cadastro do item será implementada posteriormente.
    console.log(dados);
  }

  return (
    <form onSubmit={finalizarFormulario}>
      <header>
        <h2>{itemId ? "Editar item" : "Cadastrar item"}</h2>
        <p>
          Etapa {etapaAtual} de {totalEtapas}
        </p>
      </header>

      {etapaAtual === 1 && (
        <fieldset ref={etapaRef}>
          <legend>Informações básicas</legend>

          <label htmlFor="tipo">Tipo de item</label>
          <select
            id="tipo"
            name="tipo"
            required
            value={dados.tipo}
            onChange={(event) =>
              atualizarCampo("tipo", event.target.value as TipoItem | "")
            }
          >
            <option value="" disabled>
              Selecione o tipo
            </option>
            <option value="produto">Produto</option>
            <option value="servico">Serviço</option>
          </select>

          <label htmlFor="titulo">Título</label>
          <input
            id="titulo"
            name="titulo"
            type="text"
            required
            value={dados.titulo}
            onChange={(event) => atualizarCampo("titulo", event.target.value)}
          />

          <label htmlFor="descricao">Descrição</label>
          <textarea
            id="descricao"
            name="descricao"
            rows={4}
            value={dados.descricao}
            onChange={(event) =>
              atualizarCampo("descricao", event.target.value)
            }
          />
        </fieldset>
      )}

      {etapaAtual === 2 && (
        <fieldset ref={etapaRef}>
          <legend>Características e preço</legend>

          <label htmlFor="dimensoes">Dimensões</label>
          <input
            id="dimensoes"
            name="dimensoes"
            type="text"
            placeholder="Ex.: 2m x 3m"
            value={dados.dimensoes}
            onChange={(event) =>
              atualizarCampo("dimensoes", event.target.value)
            }
          />

          <label htmlFor="preco">Preço (R$)</label>
          <input
            id="preco"
            name="preco"
            type="number"
            min="0"
            step="0.01"
            required
            value={dados.preco}
            onChange={(event) => atualizarCampo("preco", event.target.value)}
          />
        </fieldset>
      )}

      {etapaAtual === 3 && (
        <fieldset ref={etapaRef}>
          <legend>Categorias</legend>

          <label htmlFor="categorias">Selecione as categorias</label>
          <select
            id="categorias"
            name="categorias"
            multiple
            value={dados.categorias}
            onChange={(event) => {
              const categoriasSelecionadas = Array.from(
                event.target.selectedOptions,
                (option) => option.value,
              );

              atualizarCampo("categorias", categoriasSelecionadas);
            }}
          >
            {/* As categorias serão carregadas da loja. */}
          </select>

          <p>Você poderá selecionar mais de uma categoria.</p>
        </fieldset>
      )}

      {etapaAtual === 4 && (
        <fieldset ref={etapaRef}>
          <legend>Publicação</legend>

          <label htmlFor="situacao">Situação do item</label>
          <select
            id="situacao"
            name="situacao"
            value={dados.situacao}
            onChange={(event) =>
              atualizarCampo("situacao", event.target.value as SituacaoItem)
            }
          >
            <option value="rascunho">Rascunho</option>
            <option value="publicado">Publicado</option>
          </select>

          <label>
            <input
              type="checkbox"
              name="destaque"
              checked={dados.destaque}
              onChange={(event) =>
                atualizarCampo("destaque", event.target.checked)
              }
            />
            Destacar este item
          </label>
        </fieldset>
      )}

      <nav aria-label="Navegação do formulário">
        {etapaAtual > 1 && (
          <button type="button" onClick={voltarEtapa}>
            Voltar
          </button>
        )}

        {etapaAtual < totalEtapas ? (
          <button type="button" onClick={avancarEtapa}>
            Próximo
          </button>
        ) : (
          <button type="submit">Concluir</button>
        )}
      </nav>
    </form>
  );
}

export default FormItem;
