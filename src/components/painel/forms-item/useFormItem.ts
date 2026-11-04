import { useEffect, useRef, useState } from "react";
import type { FormEvent } from "react";

import { supabase } from "../../../lib/supabase";
import { listarTemas } from "../../../services/temas";
import type { AdicionalServico, DadosFormulario } from "./types";

type EtapaId = "basicos" | "imagens" | "categorias" | "adicionais";

interface Etapa {
  id: EtapaId;
  titulo: string;
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

function useFormItem() {
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
  const [erroImagens, setErroImagens] = useState("");

  useEffect(() => {
    let ativo = true;

    async function carregarTemas() {
      const {
        data: { user },
        error,
      } = await supabase.auth.getUser();

      if (error) {
        console.error("Erro ao verificar usuário para carregar temas:", error);
        return;
      }
      if (!user) return;

      try {
        const temas = await listarTemas();
        if (ativo) setTemasDisponiveis(temas);
      } catch (erro) {
        console.error("Erro ao carregar temas:", erro);
      }
    }

    void carregarTemas();
    return () => {
      ativo = false;
    };
  }, []);

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
        (categoriaAtual) => categoriaAtual.toLowerCase() === nome.toLowerCase(),
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
    setErroImagens("");
    setDados((dadosAtuais) => ({
      ...dadosAtuais,
      imagens: [
        ...dadosAtuais.imagens,
        ...arquivos.map((arquivo, indice) => ({
          id: crypto.randomUUID(),
          arquivo,
          tema: "",
          textoAlternativo: "",
          principal: dadosAtuais.imagens.length === 0 && indice === 0,
        })),
      ],
    }));
  }

  function atualizarTextoAlternativo(id: string, textoAlternativo: string) {
    setDados((dadosAtuais) => ({
      ...dadosAtuais,
      imagens: dadosAtuais.imagens.map((imagem) =>
        imagem.id === id ? { ...imagem, textoAlternativo } : imagem,
      ),
    }));
  }

  function definirImagemPrincipal(id: string) {
    setDados((dadosAtuais) => ({
      ...dadosAtuais,
      imagens: dadosAtuais.imagens.map((imagem) => ({
        ...imagem,
        principal: imagem.id === id,
      })),
    }));
  }

  function moverImagem(id: string, deslocamento: -1 | 1) {
    setDados((dadosAtuais) => {
      const indice = dadosAtuais.imagens.findIndex((imagem) => imagem.id === id);
      const destino = indice + deslocamento;

      if (indice < 0 || destino < 0 || destino >= dadosAtuais.imagens.length) {
        return dadosAtuais;
      }

      const imagens = [...dadosAtuais.imagens];
      [imagens[indice], imagens[destino]] = [imagens[destino], imagens[indice]];
      return { ...dadosAtuais, imagens };
    });
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
    setDados((dadosAtuais) => {
      const imagens = dadosAtuais.imagens.filter((imagem) => imagem.id !== id);
      if (imagens.length > 0 && !imagens.some((imagem) => imagem.principal)) {
        imagens[0] = { ...imagens[0], principal: true };
      }
      return { ...dadosAtuais, imagens };
    });
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
    if (etapaConfig?.id === "imagens" && dados.imagens.length === 0) {
      setErroImagens("Adicione pelo menos uma foto para continuar.");
      return;
    }

    if (!etapaRef.current?.reportValidity()) return;

    setErroImagens("");
    setEtapaAtual((etapa) => Math.min(etapa + 1, totalEtapas));
  }

  function voltarEtapa() {
    setEtapaAtual((etapa) => Math.max(etapa - 1, 1));
  }

  function finalizarFormulario(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    console.log(dados);
  }

  return {
    etapaAtual,
    etapaRef,
    dados,
    categoriasDisponiveis,
    temasDisponiveis,
    erroImagens,
    etapas,
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
  };
}

export default useFormItem;
