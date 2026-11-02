import { useRef, useState } from "react";
import type { FormEvent } from "react";

import LayoutPainel from "../layout/LayoutPainel";

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

const etapas = [
  "Informações básicas",
  "Características e preço",
  "Categorias",
  "Publicação",
];

const classeLabel = "mb-2 block text-sm font-medium text-text";

const classeCampo = `
  w-full rounded-input border border-border bg-card
  px-5 py-3 text-sm text-text
  placeholder:text-text-secondary
  outline-none transition
  focus:border-primary focus:ring-1 focus:ring-primary
  disabled:cursor-not-allowed disabled:opacity-50
`;

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

  const [categoriasDisponiveis, setCategoriasDisponiveis] = useState<string[]>(
    [],
  );
  const [novaCategoria, setNovaCategoria] = useState("");

  const totalEtapas = etapas.length;
  const progresso = (etapaAtual / totalEtapas) * 100;

  function atualizarCampo<K extends keyof DadosFormulario>(
    campo: K,
    valor: DadosFormulario[K],
  ) {
    setDados((dadosAtuais) => ({
      ...dadosAtuais,
      [campo]: valor,
    }));
  }

  function alternarCategoria(categoria: string) {
    const selecionadas = dados.categorias.includes(categoria)
      ? dados.categorias.filter((item) => item !== categoria)
      : [...dados.categorias, categoria];

    atualizarCampo("categorias", selecionadas);
  }

  function adicionarCategoria() {
    const nome = novaCategoria.trim();

    if (!nome) return;

    const categoriaExistente = categoriasDisponiveis.find(
      (categoria) => categoria.toLowerCase() === nome.toLowerCase(),
    );

    if (categoriaExistente) {
      if (!dados.categorias.includes(categoriaExistente)) {
        atualizarCampo("categorias", [...dados.categorias, categoriaExistente]);
      }

      setNovaCategoria("");
      return;
    }

    setCategoriasDisponiveis((categorias) => [...categorias, nome]);
    atualizarCampo("categorias", [...dados.categorias, nome]);
    setNovaCategoria("");
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
    <LayoutPainel>
      <div className="mx-auto flex w-full max-w-3xl flex-col gap-8">
        {/* Cabeçalho */}
        <header>
          <p className="text-sm text-text-secondary">Painel da loja</p>

          <h1 className="mt-1 text-2xl font-bold text-text">
            {itemId ? "Editar item" : "Cadastrar item"}
          </h1>

          <p className="mt-2 text-sm text-text-secondary">
            Preencha as informações para cadastrar seu produto ou serviço.
          </p>
        </header>

        {/* Progresso */}
        <section
          aria-label="Progresso do formulário"
          className="flex flex-col gap-3"
        >
          <div
            className="h-2 w-full overflow-hidden rounded-full bg-surface"
            role="progressbar"
            aria-valuemin={0}
            aria-valuemax={100}
            aria-valuenow={progresso}
            aria-label="Progresso do cadastro"
          >
            <div
              className="h-full rounded-full bg-primary transition-all duration-300"
              style={{ width: `${progresso}%` }}
            />
          </div>
        </section>

        <form onSubmit={finalizarFormulario} className="flex flex-col gap-8">
          {/* Etapa 1: Informações básicas */}
          {etapaAtual === 1 && (
            <fieldset ref={etapaRef} className="flex flex-col gap-5">
              <legend className="mb-5 text-lg font-bold text-text">
                Informações básicas
              </legend>

              <div>
                <label htmlFor="tipo" className={classeLabel}>
                  Tipo de item
                </label>

                <select
                  id="tipo"
                  name="tipo"
                  required
                  value={dados.tipo}
                  onChange={(event) =>
                    atualizarCampo("tipo", event.target.value as TipoItem | "")
                  }
                  className={`${classeCampo} appearance-none pr-12`}
                >
                  <option value="" disabled>
                    Selecione o tipo
                  </option>
                  <option value="produto">Produto</option>
                  <option value="servico">Serviço</option>
                </select>
              </div>

              <div>
                <label htmlFor="titulo" className={classeLabel}>
                  Título
                </label>

                <input
                  id="titulo"
                  name="titulo"
                  type="text"
                  maxLength={150}
                  placeholder="Ex.: Decoração de aniversário"
                  required
                  value={dados.titulo}
                  onChange={(event) =>
                    atualizarCampo("titulo", event.target.value)
                  }
                  className={classeCampo}
                />
              </div>

              <div>
                <label htmlFor="descricao" className={classeLabel}>
                  Descrição
                </label>

                <textarea
                  id="descricao"
                  name="descricao"
                  rows={5}
                  placeholder="Descreva os detalhes do produto ou serviço."
                  value={dados.descricao}
                  onChange={(event) =>
                    atualizarCampo("descricao", event.target.value)
                  }
                  className={`${classeCampo} min-h-32 resize-y rounded-card`}
                />
              </div>

              <div>
                <label htmlFor="preco" className={classeLabel}>
                  {dados.tipo === "servico"
                    ? "Preço mínimo (R$) *"
                    : "Preço fixo (R$) *"}
                </label>

                <input
                  id="preco"
                  name="preco"
                  type="number"
                  min="0"
                  max="99999999.99"
                  step="0.01"
                  placeholder="0,00"
                  required
                  value={dados.preco}
                  onChange={(event) =>
                    atualizarCampo("preco", event.target.value)
                  }
                  className={classeCampo}
                />

                {dados.tipo === "servico" && (
                  <p className="mt-2 text-xs text-text-secondary">
                    O valor informado é uma referência mínima. O orçamento final
                    será combinado pelo WhatsApp.
                  </p>
                )}
              </div>
            </fieldset>
          )}

          {/* Etapa 2: Categorias */}
          {etapaAtual === 2 && (
            <fieldset ref={etapaRef} className="flex flex-col gap-5">
              <legend className="mb-5 text-lg font-bold text-text">
                Adicionar categorias
              </legend>

              <div className="flex flex-wrap gap-2">
                {categoriasDisponiveis.map((categoria) => {
                  const selecionada = dados.categorias.includes(categoria);

                  return (
                    <button
                      key={categoria}
                      type="button"
                      aria-pressed={selecionada}
                      onClick={() => alternarCategoria(categoria)}
                      className={`
                        rounded-full border px-6 py-3 text-sm
                        transition-colors
                        ${
                          selecionada
                            ? "border-primary bg-primary text-text-inverse"
                            : "border-transparent bg-surface text-text-secondary hover:border-border"
                        }
                      `}
                    >
                      {categoria}
                    </button>
                  );
                })}
              </div>

              {categoriasDisponiveis.length === 0 && (
                <p className="text-sm text-text-secondary">
                  Você ainda não possui categorias cadastradas. Adicione uma
                  para começar.
                </p>
              )}

              <div className="flex flex-col gap-3 sm:flex-row">
                <input
                  id="novaCategoria"
                  name="novaCategoria"
                  type="text"
                  maxLength={60}
                  placeholder="Nome da nova categoria"
                  value={novaCategoria}
                  onChange={(event) => setNovaCategoria(event.target.value)}
                  onKeyDown={(event) => {
                    if (event.key === "Enter") {
                      event.preventDefault();
                      adicionarCategoria();
                    }
                  }}
                  className={classeCampo}
                />

                <button
                  type="button"
                  onClick={adicionarCategoria}
                  disabled={!novaCategoria.trim()}
                  className="
                    shrink-0 rounded-button bg-primary px-6 py-3
                    text-sm font-semibold text-text-inverse
                    transition-colors hover:bg-primary-hover
                    disabled:cursor-not-allowed disabled:opacity-50
                  "
                >
                  Adicionar categoria
                </button>
              </div>

              <p className="text-xs text-text-secondary">
                Selecione uma ou mais categorias. As categorias adicionadas
                ficam disponíveis para reutilização durante este formulário.
              </p>
            </fieldset>
          )}

          {/* Etapa 3: Publicação */}
          {etapaAtual === 3 && (
            <fieldset ref={etapaRef} className="flex flex-col gap-5">
              <legend className="mb-5 text-lg font-bold text-text">
                Publicação
              </legend>

              <div>
                <label htmlFor="situacao" className={classeLabel}>
                  Situação do item
                </label>

                <select
                  id="situacao"
                  name="situacao"
                  value={dados.situacao}
                  onChange={(event) =>
                    atualizarCampo(
                      "situacao",
                      event.target.value as SituacaoItem,
                    )
                  }
                  className={`${classeCampo} pr-12`}
                >
                  <option value="rascunho">Rascunho</option>
                  <option value="publicado">Publicado</option>
                </select>
              </div>

              <label className="flex cursor-pointer items-center gap-3 text-sm text-text">
                <input
                  type="checkbox"
                  name="destaque"
                  checked={dados.destaque}
                  onChange={(event) =>
                    atualizarCampo("destaque", event.target.checked)
                  }
                  className="size-4 accent-primary"
                />
                Destacar este item
              </label>

              <p className="text-xs text-text-secondary">
                Para publicar um item, será necessário cadastrar pelo menos uma
                foto e defini-la como principal.
              </p>
            </fieldset>
          )}

          {/* Navegação */}
          <nav
            aria-label="Navegação do formulário"
            className="flex items-center justify-between gap-3 border-t border-border pt-6"
          >
            {etapaAtual > 1 ? (
              <button
                type="button"
                onClick={voltarEtapa}
                className="rounded-button border border-border bg-white px-6 py-3 text-sm font-semibold text-text transition-colors hover:bg-surface"
              >
                Voltar
              </button>
            ) : (
              <span />
            )}

            {etapaAtual < totalEtapas ? (
              <button
                type="button"
                onClick={avancarEtapa}
                className="rounded-button bg-primary px-8 py-3 text-sm font-semibold text-text-inverse transition-colors hover:bg-primary-hover"
              >
                Próximo
              </button>
            ) : (
              <button
                type="submit"
                className="rounded-button bg-primary px-8 py-3 text-sm font-semibold text-text-inverse transition-colors hover:bg-primary-hover"
              >
                Concluir
              </button>
            )}
          </nav>
        </form>
      </div>
    </LayoutPainel>
  );
}

export default FormItem;
