export type TipoItem = "produto" | "servico";
export type ModalidadeItem = "aluguel" | "venda";

export interface ImagemItem {
  id: string;
  arquivo: File;
  tema: string;
  textoAlternativo: string;
  principal: boolean;
}

export interface AdicionalServico {
  id: string;
  nome: string;
  precoMinimo: string;
  imagem: File | null;
}

export interface DadosFormulario {
  tipo: TipoItem | "";
  modalidade: ModalidadeItem | "";
  titulo: string;
  descricao: string;
  preco: string;
  altura: string;
  largura: string;
  profundidade: string;
  precoReposicao: string;
  imagens: ImagemItem[];
  categorias: string[];
  adicionais: AdicionalServico[];
}
