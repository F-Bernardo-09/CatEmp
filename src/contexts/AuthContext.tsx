import { createContext, useEffect, useState, type ReactNode } from "react";
import type { User } from "@supabase/supabase-js";
import { supabase } from "../lib/supabase";
import * as authService from "../services/auth";
import type { Usuario } from "../types/database";

interface AuthContextData {
  usuario: User | null;
  perfil: Usuario | null;
  carregando: boolean;
  autenticado: boolean;
  entrar: (email: string, senha: string) => Promise<Usuario>;
  sair: () => Promise<void>;
}

export const AuthContext = createContext<AuthContextData | undefined>(
  undefined,
);

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [usuario, setUsuario] = useState<User | null>(null);
  const [perfil, setPerfil] = useState<Usuario | null>(null);
  const [carregando, setCarregando] = useState(true);

  useEffect(() => {
    let ativo = true;
    let temporizador: ReturnType<typeof setTimeout>;

    async function carregarUsuario(usuarioAuth: User | null) {
      if (!ativo) return;

      setUsuario(usuarioAuth);

      if (!usuarioAuth) {
        setPerfil(null);
        setCarregando(false);
        return;
      }

      setCarregando(true);

      try {
        const dadosPerfil = await authService.obterPerfil(usuarioAuth.id);

        if (ativo) {
          setPerfil(dadosPerfil);
        }
      } catch (erro) {
        console.error("Erro ao carregar perfil:", erro);

        if (ativo) {
          setPerfil(null);
        }
      } finally {
        if (ativo) {
          setCarregando(false);
        }
      }
    }

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_evento, sessao) => {
      clearTimeout(temporizador);

      temporizador = setTimeout(() => {
        void carregarUsuario(sessao?.user ?? null);
      }, 0);
    });

    return () => {
      ativo = false;
      clearTimeout(temporizador);
      subscription.unsubscribe();
    };
  }, []);

  async function entrar(email: string, senha: string): Promise<Usuario> {
    const sessao = await authService.entrar(email, senha);

    setUsuario(sessao.usuario);
    setPerfil(sessao.perfil);
    setCarregando(false);

    return sessao.perfil;
  }

  async function sair() {
    await authService.sair();
  }

  const valor: AuthContextData = {
    usuario,
    perfil,
    carregando,
    autenticado: usuario !== null,
    entrar,
    sair,
  };

  return <AuthContext.Provider value={valor}>{children}</AuthContext.Provider>;
}
