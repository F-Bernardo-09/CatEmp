import { criarSupabaseAdmin } from "../_shared/supabase-admin.ts";
import { corsHeaders } from "../_shared/cors.ts";
import { responder } from "../_shared/respostas.ts";

interface DadosRevogacao {
  token_id?: unknown;
}

function ehUUID(valor: string): boolean {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
    valor,
  );
}

Deno.serve(async (requisicao) => {
  if (requisicao.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  if (requisicao.method !== "POST") {
    return responder(405, { erro: "Método não permitido." });
  }

  const autorizacao = requisicao.headers.get("Authorization");
  const correspondencia = autorizacao?.match(/^Bearer\s+(.+)$/i);
  const jwt = correspondencia?.[1];

  if (!jwt) {
    return responder(401, { erro: "Autenticação necessária." });
  }

  let corpoDesconhecido: unknown;

  try {
    corpoDesconhecido = await requisicao.json();
  } catch {
    return responder(400, {
      erro: "O corpo da requisição deve ser JSON válido.",
    });
  }

  if (
    typeof corpoDesconhecido !== "object" ||
    corpoDesconhecido === null ||
    Array.isArray(corpoDesconhecido)
  ) {
    return responder(400, {
      erro: "O corpo da requisição deve ser um objeto JSON.",
    });
  }

  const corpo = corpoDesconhecido as DadosRevogacao;
  const tokenId =
    typeof corpo.token_id === "string" ? corpo.token_id.trim() : "";

  if (!ehUUID(tokenId)) {
    return responder(400, {
      erro: "Informe um identificador de token válido.",
    });
  }

  try {
    const supabase = criarSupabaseAdmin();

    const { data: dadosAuth, error: erroAuth } =
      await supabase.auth.getUser(jwt);

    if (erroAuth || !dadosAuth.user) {
      return responder(401, {
        erro: "Sessão inválida ou expirada.",
      });
    }

    const usuarioId = dadosAuth.user.id;

    const { data: usuario, error: erroUsuario } = await supabase
      .from("usuarios")
      .select("papel, situacao")
      .eq("id", usuarioId)
      .maybeSingle();

    if (erroUsuario) throw erroUsuario;

    if (!usuario || usuario.papel !== "admin" || usuario.situacao !== "ativa") {
      return responder(403, {
        erro: "Apenas administradores ativos podem revogar tokens.",
      });
    }

    const { data: token, error: erroRevogacao } = await supabase
      .from("tokens_acesso")
      .update({ revogado_em: new Date().toISOString() })
      .eq("id", tokenId)
      .is("usado_em", null)
      .is("revogado_em", null)
      .select("id")
      .maybeSingle();

    if (erroRevogacao) throw erroRevogacao;

    if (!token) {
      return responder(409, {
        erro: "Este token não está disponível para revogação.",
      });
    }

    return responder(200, {
      mensagem: "Token revogado com sucesso.",
    });
  } catch (erro) {
    console.error("Falha na função revogar-token:", erro);

    return responder(500, {
      erro: "Não foi possível revogar o token.",
    });
  }
});
