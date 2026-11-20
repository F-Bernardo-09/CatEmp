import {
  createContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";

import type { ItemCarrinho } from "../types/carrinho";

const CHAVE_ARMAZENAMENTO = "catemp:carrinho:v1";

interface CarrinhoContextData {
  itens: ItemCarrinho[];
  quantidadeItens: number;
  total: number;
  adicionar: (item: Omit<ItemCarrinho, "chave" | "quantidade">) => void;
  remover: (chave: string) => void;
  alterarQuantidade: (chave: string, quantidade: number) => void;
  substituir: (itens: ItemCarrinho[]) => void;
  limpar: () => void;
}

export const CarrinhoContext = createContext<CarrinhoContextData | undefined>(
  undefined,
);

interface CarrinhoProviderProps {
  children: ReactNode;
}

function itemValido(item: unknown): item is ItemCarrinho {
  if (!item || typeof item !== "object") return false;
  const valor = item as Record<string, unknown>;
  return (
    typeof valor.chave === "string" &&
    typeof valor.itemId === "string" &&
    typeof valor.lojaId === "string" &&
    typeof valor.lojaSlug === "string" &&
    typeof valor.lojaNome === "string" &&
    typeof valor.lojaWhatsapp === "string" &&
    typeof valor.titulo === "string" &&
    (valor.tipo === undefined ||
      valor.tipo === "produto" ||
      valor.tipo === "servico") &&
    (valor.modalidade === "aluguel" || valor.modalidade === "venda") &&
    typeof valor.precoBase === "number" &&
    typeof valor.precoReposicao === "number" &&
    typeof valor.quantidade === "number"
  );
}

export function CarrinhoProvider({ children }: CarrinhoProviderProps) {
  const [itens, setItens] = useState<ItemCarrinho[]>([]);

  useEffect(() => {
    try {
      const salvo = window.localStorage.getItem(CHAVE_ARMAZENAMENTO);
      if (!salvo) return;
      const dados: unknown = JSON.parse(salvo);
      if (Array.isArray(dados)) {
        setItens(dados.filter(itemValido));
      }
    } catch (erro) {
      console.error("Não foi possível restaurar o carrinho:", erro);
    }
  }, []);

  useEffect(() => {
    try {
      window.localStorage.setItem(
        CHAVE_ARMAZENAMENTO,
        JSON.stringify(itens),
      );
    } catch (erro) {
      console.error("Não foi possível salvar o carrinho:", erro);
    }
  }, [itens]);

  function adicionar(item: Omit<ItemCarrinho, "chave" | "quantidade">) {
    setItens((atuais) => {
      const chave = `${item.lojaId}:${item.itemId}`;
      const existente = atuais.find((atual) => atual.chave === chave);

      if (existente) {
        return atuais.map((atual) =>
          atual.chave === chave
            ? { ...atual, quantidade: atual.quantidade + 1 }
            : atual,
        );
      }

      return [...atuais, { ...item, chave, quantidade: 1 }];
    });
  }

  function remover(chave: string) {
    setItens((atuais) => atuais.filter((item) => item.chave !== chave));
  }

  function alterarQuantidade(chave: string, quantidade: number) {
    const novaQuantidade = Math.max(1, Math.floor(quantidade));
    setItens((atuais) =>
      atuais.map((item) =>
        item.chave === chave
          ? { ...item, quantidade: novaQuantidade }
          : item,
      ),
    );
  }

  function substituir(novosItens: ItemCarrinho[]) {
    setItens(novosItens.filter(itemValido));
  }

  function limpar() {
    setItens([]);
  }

  const quantidadeItens = itens.reduce(
    (total, item) => total + item.quantidade,
    0,
  );
  const total = itens.reduce(
    (total, item) =>
      total + item.precoBase * item.quantidade,
    0,
  );

  return (
    <CarrinhoContext.Provider
      value={{
        itens,
        quantidadeItens,
        total,
        adicionar,
        remover,
        alterarQuantidade,
        substituir,
        limpar,
      }}
    >
      {children}
    </CarrinhoContext.Provider>
  );
}