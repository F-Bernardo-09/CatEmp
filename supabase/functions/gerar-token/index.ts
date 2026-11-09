import { criarSupabaseAdmin } from "../_shared/supabase-admin.ts";
import { corsHeaders } from "../_shared/cors.ts";
import { sha256 } from "../_shared/hash.ts";
import { responder } from "../_shared/respostas.ts";

interface DadosGeracao {
  emitido_para?: unknown;
  validade_dias?: unknown;
}

function gerarTokenSeguro(): string {
  const bytes = crypto.getRandomValues(new Uint8Array(32));

  return Array.from(bytes)
    .map((byte) => byte.toString(16).padStart(2, "0"))
    .join("");
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

  const corpo = corpoDesconhecido as DadosGeracao;

  const emitidoPara =
    typeof corpo.emitido_para === "string" ? corpo.emitido_para.trim() : "";

  const validadeDias = corpo.validade_dias;

  if (!emitidoPara || emitidoPara.length > 120) {
    return responder(400, {
      erro: "Informe um destinatário com até 120 caracteres.",
    });
  }

  if (
    typeof validadeDias !== "number" ||
    !Number.isInteger(validadeDias) ||
    validadeDias < 1 ||
    validadeDias > 365
  ) {
    return responder(400, {
      erro: "A validade deve ser um número inteiro entre 1 e 365 dias.",
    });
  }

  try {
    const supabase = criarSupabaseAdmin();

    // Valida o JWT e identifica o usuário autenticado.
    const { data: dadosAuth, error: erroAuth } =
      await supabase.auth.getUser(jwt);

    if (erroAuth || !dadosAuth.user) {
      return responder(401, {
        erro: "Sessão inválida ou expirada.",
      });
    }

    const usuarioId = dadosAuth.user.id;

    // Confere o papel e a situação diretamente no banco.
    const { data: usuario, error: erroUsuario } = await supabase
      .from("usuarios")
      .select("papel, situacao")
      .eq("id", usuarioId)
      .maybeSingle();

    if (erroUsuario) throw erroUsuario;

    if (!usuario || usuario.papel !== "admin" || usuario.situacao !== "ativa") {
      return responder(403, {
        erro: "Apenas administradores ativos podem gerar tokens.",
      });
    }

    // Gera o token e calcula seu hash.
    const token = gerarTokenSeguro();
    const tokenHash = await sha256(token);

    const expiraEm = new Date();
    expiraEm.setUTCDate(expiraEm.getUTCDate() + validadeDias);

    // Persiste somente o hash, nunca o token original.
    const { data: registro, error: erroInsercao } = await supabase
      .from("tokens_acesso")
      .insert({
        token_hash: tokenHash,
        criado_por: usuarioId,
        emitido_para: emitidoPara,
        expira_em: expiraEm.toISOString(),
      })
      .select("expira_em")
      .single();

    if (erroInsercao) throw erroInsercao;

    return responder(201, {
      token,
      emitido_para: emitidoPara,
      expira_em: registro.expira_em,
    });
  } catch (erro) {
    console.error("Falha na função gerar-token:", erro);

    return responder(500, {
      erro: "Não foi possível gerar o token.",
    });
  }
});
