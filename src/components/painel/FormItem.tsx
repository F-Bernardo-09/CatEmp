import LayoutPainel from "../layout/LayoutPainel";
import EtapaAdicionais from "./forms-item/EtapaAdicionais";
import EtapaCategorias from "./forms-item/EtapaCategorias";
import EtapaDadosBasicos from "./forms-item/EtapaDadosBasicos";
import EtapaImagensTemas from "./forms-item/EtapaImagensTemas/EtapaImagensTemas";
import useFormItem from "./forms-item/useFormItem";

interface FormItemProps {
  itemId?: string;
}

function FormItem({ itemId }: FormItemProps) {
  const {
    etapaAtual,
    etapaRef,
    dados,
    categoriasDisponiveis,
    temasDisponiveis,
    erroImagens,
    totalEtapas,
    etapaConfig,
    progresso,
    atualizarCampo,
    alternarCategoria,
    adicionarCategoria,
    adicionarImagens,
    atualizarTextoAlternativo,
    definirImagemPrincipal,
    moverImagem,
    atualizarTemaImagem,
    adicionarTema,
    removerImagem,
    adicionarAdicional,
    atualizarAdicional,
    removerAdicional,
    avancarEtapa,
    voltarEtapa,
    finalizarFormulario,
  } = useFormItem();

  return (
    <LayoutPainel>
      <div className="mx-auto flex w-full max-w-3xl flex-col gap-8">
        <header>
          <p className="text-sm text-text-secondary">Painel da loja</p>
          <h1 className="mt-1 text-2xl font-bold text-text">
            {itemId ? "Editar item" : "Cadastrar item"}
          </h1>
        </header>

        <section
          aria-label="Progresso do formulário"
          className="flex flex-col gap-3"
        >
          <p className="text-sm text-text-secondary">
            Etapa {etapaAtual} de {totalEtapas}: {etapaConfig?.titulo}
          </p>
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
          {etapaConfig?.id === "basicos" && (
            <EtapaDadosBasicos
              etapaRef={etapaRef}
              tipo={dados.tipo}
              titulo={dados.titulo}
              descricao={dados.descricao}
              preco={dados.preco}
              onTipoChange={(tipo) => atualizarCampo("tipo", tipo)}
              onTituloChange={(titulo) => atualizarCampo("titulo", titulo)}
              onDescricaoChange={(descricao) =>
                atualizarCampo("descricao", descricao)
              }
              onPrecoChange={(preco) => atualizarCampo("preco", preco)}
            />
          )}

          {etapaConfig?.id === "imagens" && (
            <EtapaImagensTemas
              etapaRef={etapaRef}
              imagens={dados.imagens}
              temasDisponiveis={temasDisponiveis}
              erro={erroImagens}
              onAdicionarImagens={adicionarImagens}
              onAdicionarTema={adicionarTema}
              onAtualizarTema={atualizarTemaImagem}
              onAtualizarTextoAlternativo={atualizarTextoAlternativo}
              onDefinirPrincipal={definirImagemPrincipal}
              onMoverImagem={moverImagem}
              onRemoverImagem={removerImagem}
            />
          )}

          {etapaConfig?.id === "categorias" && (
            <EtapaCategorias
              etapaRef={etapaRef}
              categoriasDisponiveis={categoriasDisponiveis}
              categoriasSelecionadas={dados.categorias}
              onAlternarCategoria={alternarCategoria}
              onAdicionarCategoria={adicionarCategoria}
            />
          )}

          {etapaConfig?.id === "adicionais" && (
            <EtapaAdicionais
              etapaRef={etapaRef}
              adicionais={dados.adicionais}
              onAdicionarAdicional={adicionarAdicional}
              onAtualizarAdicional={atualizarAdicional}
              onRemoverAdicional={removerAdicional}
            />
          )}

          <nav
            aria-label="Navegação do formulário"
            className="flex items-center justify-between gap-3 border-t border-border pt-6"
          >
            {etapaAtual > 1 ? (
              <button
                type="button"
                onClick={voltarEtapa}
                className="rounded-button border border-border bg-card px-6 py-3 text-sm font-semibold text-text transition-colors hover:bg-surface"
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
