export type TipoItem = "produto" | "servico";

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
  titulo: string;
  descricao: string;
  preco: string;
  imagens: ImagemItem[];
  categorias: string[];
  adicionais: AdicionalServico[];
}
