import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router";
import type { FormEvent } from "react";

import { supabase } from "../../../lib/supabase";
import { vincularCategorias } from "../../../services/categorias";
import { listarExtrasServico, criarExtrasServico } from "../../../services/extras";
import { enviarFotosItem, obterEstadoFotos } from "../../../services/fotos";
import { criarItem, atualizarItem, obterItem } from "../../../services/itens";
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

function useFormItem(itemId?: string) {
  const modoEdicao = Boolean(itemId);
  const navigate = useNavigate();

  // Guarda o progresso do salvamento: se algo falhar no meio, "Concluir"
  // continua de onde parou em vez de criar outro item ou repetir fotos.
  const progressoSalvamento = useRef({
    itemId: "",
    lojaId: "",
    fotosEnviadas: false,
    categoriasVinculadas: false,
  });

  const [etapaAtual, setEtapaAtual] = useState(1);
  const etapaRef = useRef<HTMLFieldSetElement>(null);

  const [carregandoItem, setCarregandoItem] = useState(modoEdicao);
  const [erroCarregar, setErroCarregar] = useState("");

  const [dados, setDados] = useState<DadosFormulario>({
    tipo: "",
    modalidade: "",
    titulo: "",
    descricao: "",
    preco: "",
    precoReposicao: "",
    emDestaque: false,
    imagens: [],
    categorias: [],
    adicionais: [],
  });

  const [categoriasDisponiveis, setCategoriasDisponiveis] = useState<string[]>(
    [],
  );
  const [temasDisponiveis, setTemasDisponiveis] = useState<string[]>([]);
  const [erroImagens, setErroImagens] = useState("");

  // Carrega temas da loja
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

  // Carrega dados do item existente no modo edição
  useEffect(() => {
    if (!itemId) return;

    let ativo = true;
    setCarregandoItem(true);
    setErroCarregar("");

    async function carregarItemExistente() {
      try {
        // Dados básicos do item
        const item = await obterItem(itemId!);

        // Categorias vinculadas ao item
        const { data: catData, error: catError } = await supabase
          .from("item_categorias")
          .select("categorias(nome)")
          .eq("item_id", itemId);

        if (catError) throw catError;

        const nomesCategoria = (catData ?? [])
          .map((row: any) => row.categorias?.nome as string | undefined)
          .filter((nome): nome is string => Boolean(nome));

        // Adicionais (somente para serviços)
        let adicionaisCarregados: AdicionalServico[] = [];
        if (item.tipo === "servico") {
          try {
            const extras = await listarExtrasServico(itemId!);
            adicionaisCarregados = extras.map((extra) => ({
              id: extra.id,
              nome: extra.nome,
              precoMinimo: String(extra.preco_minimo),
              imagem: null, // arquivos originais não são re-carregáveis
              novo: false,
            }));
          } catch (erroExtras) {
            console.warn("Não foi possível carregar os adicionais:", erroExtras);
          }
        }

        if (!ativo) return;

        setDados({
          tipo: item.tipo,
          modalidade: item.modalidade,
          titulo: item.titulo,
          descricao: item.descricao,
          preco: String(item.preco_base),
          precoReposicao: String(item.preco_reposicao),
          emDestaque: item.em_destaque,
          imagens: [], // fotos existentes não são recarregadas como File
          categorias: nomesCategoria,
          adicionais: adicionaisCarregados,
        });

        setCategoriasDisponiveis(nomesCategoria);
      } catch (erro) {
        if (!ativo) return;
        setErroCarregar(
          erro instanceof Error ? erro.message : "Erro ao carregar o item.",
        );
      } finally {
        if (ativo) setCarregandoItem(false);
      }
    }

    void carregarItemExistente();
    return () => {
      ativo = false;
    };
  }, [itemId]);

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
          novo: true,
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
    if (etapaConfig?.id === "imagens" && dados.imagens.length === 0 && !modoEdicao) {
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

  const [salvando, setSalvando] = useState(false);
  const [erroSalvar, setErroSalvar] = useState("");

  async function salvarItem() {
    if (!dados.tipo || !dados.modalidade) {
      setErroSalvar("Selecione o tipo e a modalidade do item.");
      return;
    }
    if (!dados.descricao.trim()) {
      setErroSalvar("Informe a descrição do item.");
      return;
    }

    setSalvando(true);
    setErroSalvar("");

    try {
      const progresso = progressoSalvamento.current;

      const camposItem = {
        tipo: dados.tipo,
        modalidade: dados.modalidade,
        titulo: dados.titulo.trim(),
        descricao: dados.descricao.trim(),
        preco_base: Number(dados.preco),
        preco_reposicao: Number(dados.precoReposicao),
        em_destaque: dados.emDestaque,
      };

      // 1) Item: edita se já existe (edição ou tentativa anterior), senão cria
      const idExistente = itemId ?? progresso.itemId;
      let resolvedItemId: string;
      let lojaId: string;

      if (idExistente) {
        const item = await atualizarItem(idExistente, camposItem);
        resolvedItemId = item.id;
        lojaId = item.loja_id;
      } else {
        const item = await criarItem(camposItem);
        resolvedItemId = item.id;
        lojaId = item.loja_id;
      }
      progresso.itemId = resolvedItemId;
      progresso.lojaId = lojaId;

      // 2) Fotos novas (na edição, as já salvas continuam; só entram as adicionadas)
      if (dados.imagens.length > 0 && !progresso.fotosEnviadas) {
        const existentes = await obterEstadoFotos(resolvedItemId);
        await enviarFotosItem(
          resolvedItemId,
          lojaId,
          dados.imagens.map((imagem, indice) => ({
            arquivo: imagem.arquivo,
            tema: imagem.tema,
            textoAlternativo: imagem.textoAlternativo,
            posicao: existentes.proximaPosicao + indice,
            principal: existentes.temPrincipal ? false : imagem.principal,
          })),
          existentes,
        );
        progresso.fotosEnviadas = true;
      }

      // 3) Categorias (substitui todas; lista vazia limpa os vínculos)
      if (!progresso.categoriasVinculadas) {
        await vincularCategorias(
          resolvedItemId,
          dados.modalidade,
          dados.categorias,
        );
        progresso.categoriasVinculadas = true;
      }

      // 4) Adicionais novos (só serviço; os já salvos não têm File e têm novo=false)
      if (dados.tipo === "servico") {
        // Em modo edição, adicionais com novo=false já existem no banco — ignorar.
        // Em modo criação, todos os adicionais são novos.
        const adicionaisNovos = dados.adicionais.filter((a) => a.novo);

        // Validar: todo adicional novo precisa de imagem (o campo é required, mas o
        // componente de upload não é um <input> nativo — validamos aqui explicitamente)
        const semImagem = adicionaisNovos.filter((a) => a.imagem === null);
        if (semImagem.length > 0) {
          throw new Error(
            semImagem.length === 1
              ? "Adicione uma foto para o adicional sem imagem."
              : `Adicione uma foto para os ${semImagem.length} adicionais sem imagem.`,
          );
        }

        if (adicionaisNovos.length > 0) {
          await criarExtrasServico(
            resolvedItemId,
            adicionaisNovos.map((a) => ({
              nome: a.nome,
              precoMinimo: a.precoMinimo,
              imagem: a.imagem!,
            })),
          );
        }
      }

      navigate("/painel/itens");
    } catch (erro) {
      console.error("Erro detalhado ao salvar item:", erro);
      setErroSalvar(
        erro instanceof Error ? erro.message : "Erro ao salvar o item.",
      );
    } finally {
      setSalvando(false);
    }
  }

  function finalizarFormulario(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    void salvarItem();
  }

  return {
    modoEdicao,
    carregandoItem,
    erroCarregar,
    etapaAtual,
    etapaRef,
    dados,
    salvando,
    erroSalvar,
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