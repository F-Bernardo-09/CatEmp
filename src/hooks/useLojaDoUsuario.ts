import { useCallback, useEffect, useState } from "react";

import type { Loja } from "../schemas/loja";
import { obterLojaDoUsuario } from "../services/lojas";

export function useLojaDoUsuario() {
  const [loja, setLoja] = useState<Loja | null>(null);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState("");

  const atualizar = useCallback(async () => {
    setCarregando(true);
    setErro("");

    try {
      setLoja(await obterLojaDoUsuario());
    } catch (erroCarregamento) {
      console.error("Erro ao carregar loja do usuário:", erroCarregamento);
      setErro(
        erroCarregamento instanceof Error
          ? erroCarregamento.message
          : "Não foi possível carregar a loja.",
      );
    } finally {
      setCarregando(false);
    }
  }, []);

  useEffect(() => {
    void atualizar();
  }, [atualizar]);

  return { loja, carregando, erro, atualizar };
}
