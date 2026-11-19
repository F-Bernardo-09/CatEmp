import { useContext } from "react";

import { CarrinhoContext } from "../contexts/CarrinhoContext";

export function useCarrinho() {
  const contexto = useContext(CarrinhoContext);

  if (!contexto) {
    throw new Error(
      "useCarrinho deve ser utilizado dentro de um CarrinhoProvider.",
    );
  }

  return contexto;
}