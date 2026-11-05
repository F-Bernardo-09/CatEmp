import { supabase } from "../lib/supabase";
import type { Usuario } from "../types/database";

export async function entrar(email: string, senha: string) {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password: senha,
  });

  if (error) {
    throw error;
  }

  const perfil = await obterPerfil(data.user.id);

  if (!perfil || perfil.situacao !== "ativa") {
    const { error: erroSaida } = await supabase.auth.signOut();
    if (erroSaida) throw erroSaida;

    throw new Error("A conta não possui um perfil ativo.");
  }

  return { usuario: data.user, perfil };
}

export async function sair() {
  const { error } = await supabase.auth.signOut();

  if (error) {
    throw error;
  }
}

export async function obterSessao() {
  const { data, error } = await supabase.auth.getSession();

  if (error) {
    throw error;
  }

  return data.session;
}

export async function obterPerfil(usuarioId: string): Promise<Usuario | null> {
  const { data, error } = await supabase
    .from("usuarios")
    .select("*")
    .eq("id", usuarioId)
    .maybeSingle();

  if (error) {
    throw error;
  }

  return data;
}
