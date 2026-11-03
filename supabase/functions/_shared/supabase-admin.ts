import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

export function criarSupabaseAdmin() {
  const url = Deno.env.get("SUPABASE_URL");
  const chave = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

  if (!url || !chave) {
    throw new Error("SUPABASE_URL e SUPABASE_SERVICE_ROLE_KEY são obrigatórias.");
  }

  return createClient(url, chave, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}