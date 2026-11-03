import { useRef, useState } from "react";
import type { FormEvent } from "react";

import LayoutPainel from "../layout/LayoutPainel";
import EtapaAdicionais from "./forms-item/EtapaAdicionais";
import EtapaCategorias from "./forms-item/EtapaCategorias";
import EtapaDadosBasicos from "./forms-item/EtapaDadosBasicos";
import EtapaImagensTemas from "./forms-item/EtapaImagensTemas";
import type {
  AdicionalServico,
  DadosFormulario,
} from "./forms-item/types";

type EtapaId = "basicos" | "imagens" | "categorias" | "adicionais";

interface Etapa {
  id: EtapaId;
  titulo: string;
}

interface FormItemProps {
  itemId?: string;
}

const etapasComuns: Etapa[] = [
  { id: "basicos", titulo: "Informações básicas" },
  { id: "imagens", titulo: "Imagens e temas" },
  { id: "categorias", titulo: "Categorias" },
];

const etapaAdicionais: Etapa = {
  id: "adicionais",
  titulo: "Adicionais do serviço",
};

function FormItem({ itemId }: FormItemProps) {
  const [etapaAtual, setEtapaAtual] = useState(1);
  const etapaRef = useRef<HTMLFieldSetElement>(null);
  const [dados, setDados] = useState<DadosFormulario>({
    tipo: "",
    titulo: "",
    descricao: "",
    preco: "",
    imagens: [],
    categorias: [],
    adicionais: [],
  });
  const [categoriasDisponiveis, setCategoriasDisponiveis] = useState<string[]>(
    [],
  );
  const [temasDisponiveis, setTemasDisponiveis] = useState<string[]>([]);

  const etapas =
    dados.tipo === "servico"
      ? [...etapasComuns, etapaAdicionais]
      : etapasComuns;
  const totalEtapas = etapas.length;
  const etapaConfig = etapas[etapaAtual - 1];
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
    setDados((dadosAtuais) => {
      const jaSelecionada = dadosAtuais.categorias.includes(categoria);
      if (!jaSelecionada && dadosAtuais.categorias.length >= 5) {
        return dadosAtuais;
      }

      return {
        ...dadosAtuais,
        categorias: jaSelecionada
          ? dadosAtuais.categorias.filter((item) => item !== categoria)
          : [...dadosAtuais.categorias, categoria],
      };
    });
  }

  function adicionarCategoria(nomeInformado: string): string | null {
    const nome = nomeInformado.trim();
    if (!nome) return "Informe o nome da categoria.";

    const categoria =
      categoriasDisponiveis.find(
        (categoriaAtual) =>
          categoriaAtual.toLowerCase() === nome.toLowerCase(),
      ) ?? nome;

    const jaSelecionada = dados.categorias.includes(categoria);
    if (!jaSelecionada && dados.categorias.length >= 5) {
      return "Você pode selecionar no máximo cinco categorias.";
    }

    if (!categoriasDisponiveis.includes(categoria)) {
      setCategoriasDisponiveis((categoriasAtuais) => [
        ...categoriasAtuais,
        categoria,
      ]);
    }

    if (!jaSelecionada) {
      setDados((dadosAtuais) => ({
        ...dadosAtuais,
        categorias: [...dadosAtuais.categorias, categoria],
      }));
    }

    return null;
  }

  function adicionarImagens(arquivos: File[]) {
    setDados((dadosAtuais) => ({
      ...dadosAtuais,
      imagens: [
        ...dadosAtuais.imagens,
        ...arquivos.map((arquivo) => ({
          id: crypto.randomUUID(),
          arquivo,
          tema: "",
        })),
      ],
    }));
  }

  function atualizarTemaImagem(id: string, tema: string) {
    setDados((dadosAtuais) => ({
      ...dadosAtuais,
      imagens: dadosAtuais.imagens.map((imagem) =>
        imagem.id === id ? { ...imagem, tema } : imagem,
      ),
    }));
  }

  function adicionarTema(nomeInformado: string): string | null {
    const nome = nomeInformado.trim();
    if (!nome) return null;

    const temaExistente = temasDisponiveis.find(
      (tema) => tema.toLocaleLowerCase() === nome.toLocaleLowerCase(),
    );
    const tema = temaExistente ?? nome;

    if (!temaExistente) {
      setTemasDisponiveis((temasAtuais) => [...temasAtuais, tema]);
    }

    return tema;
  }

  function removerImagem(id: string) {
    setDados((dadosAtuais) => ({
      ...dadosAtuais,
      imagens: dadosAtuais.imagens.filter((imagem) => imagem.id !== id),
    }));
  }

  function adicionarAdicional() {
    setDados((dadosAtuais) => ({
      ...dadosAtuais,
      adicionais: [
        ...dadosAtuais.adicionais,
        {
          id: crypto.randomUUID(),
          nome: "",
          precoMinimo: "",
          imagem: null,
        },
      ],
    }));
  }

  function atualizarAdicional(
    id: string,
    alteracoes: Partial<Omit<AdicionalServico, "id">>,
  ) {
    setDados((dadosAtuais) => ({
      ...dadosAtuais,
      adicionais: dadosAtuais.adicionais.map((adicional) =>
        adicional.id === id ? { ...adicional, ...alteracoes } : adicional,
      ),
    }));
  }

  function removerAdicional(id: string) {
    setDados((dadosAtuais) => ({
      ...dadosAtuais,
      adicionais: dadosAtuais.adicionais.filter(
        (adicional) => adicional.id !== id,
      ),
    }));
  }

  function avancarEtapa() {
    if (!etapaRef.current?.reportValidity()) return;

    setEtapaAtual((etapa) => Math.min(etapa + 1, totalEtapas));
  }

  function voltarEtapa() {
    setEtapaAtual((etapa) => Math.max(etapa - 1, 1));
  }

  function finalizarFormulario(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    console.log(dados);
  }

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
              onAdicionarImagens={adicionarImagens}
              onAdicionarTema={adicionarTema}
              onAtualizarTema={atualizarTemaImagem}
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
