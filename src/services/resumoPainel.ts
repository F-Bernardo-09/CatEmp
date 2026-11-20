import { supabase } from "../lib/supabase";

export interface ResumoPainel {
  itensPublicados: number;
  itensRascunho: number;
  fotosCadastradas: number;
}

export async function obterResumoPainel(lojaId: string): Promise<ResumoPainel> {
  const [itensPublicados, itensRascunho, fotosCadastradas] = await Promise.all([
    supabase
      .from("itens")
      .select("id", { count: "exact", head: true })
      .eq("loja_id", lojaId)
      .eq("situacao", "publicado"),
    supabase
      .from("itens")
      .select("id", { count: "exact", head: true })
      .eq("loja_id", lojaId)
      .eq("situacao", "rascunho"),
    supabase
      .from("fotos")
      .select("id", { count: "exact", head: true })
      .eq("loja_id", lojaId),
  ]);

  if (itensPublicados.error) throw itensPublicados.error;
  if (itensRascunho.error) throw itensRascunho.error;
  if (fotosCadastradas.error) throw fotosCadastradas.error;

  return {
    itensPublicados: itensPublicados.count ?? 0,
    itensRascunho: itensRascunho.count ?? 0,
    fotosCadastradas: fotosCadastradas.count ?? 0,
  };
}
