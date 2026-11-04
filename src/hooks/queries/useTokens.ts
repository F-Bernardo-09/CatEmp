import { useCallback, useEffect, useState } from "react";

import type { TokenAcesso } from "../../schemas/token";
import { listarTokens } from "../../services/tokens";

export function useTokens() {
  const [tokens, setTokens] = useState<TokenAcesso[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState("");

  const atualizar = useCallback(async () => {
    setCarregando(true);
    setErro("");
    try {
      setTokens(await listarTokens());
    } catch (erroCarregamento) {
      console.error("Erro ao carregar tokens:", erroCarregamento);
      setErro(
        erroCarregamento instanceof Error
          ? erroCarregamento.message
          : "Não foi possível carregar os tokens.",
      );
    } finally {
      setCarregando(false);
    }
  }, []);

  useEffect(() => {
    void atualizar();
  }, [atualizar]);

  return { tokens, carregando, erro, atualizar };
}