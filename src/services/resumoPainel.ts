import { supabase } from "../lib/supabase";

export interface ResumoPainel {
  itensPublicados: number;
  itensOcultos: number;
  fotosCadastradas: number;
}

export async function obterResumoPainel(lojaId: string): Promise<ResumoPainel> {
  const [itensPublicados, itensOcultos, fotosCadastradas] = await Promise.all([
    supabase
      .from("itens")
      .select("id", { count: "exact", head: true })
      .eq("loja_id", lojaId)
      .eq("situacao", "disponivel"),
    supabase
      .from("itens")
      .select("id", { count: "exact", head: true })
      .eq("loja_id", lojaId)
      .eq("situacao", "oculto"),
    supabase
      .from("fotos")
      .select("id", { count: "exact", head: true })
      .eq("loja_id", lojaId),
  ]);

  if (itensPublicados.error) throw itensPublicados.error;
  if (itensOcultos.error) throw itensOcultos.error;
  if (fotosCadastradas.error) throw fotosCadastradas.error;

  return {
    itensPublicados: itensPublicados.count ?? 0,
    itensOcultos: itensOcultos.count ?? 0,
    fotosCadastradas: fotosCadastradas.count ?? 0,
  };
}
