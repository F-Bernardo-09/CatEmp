import { criarSupabaseAdmin } from "../_shared/supabase-admin.ts";
import { corsHeaders } from "../_shared/cors.ts";
import { sha256 } from "../_shared/hash.ts";
import { responder } from "../_shared/respostas.ts";

const CATEGORIAS_PADRAO = [
  { modalidade: "aluguel", nome: "Mesas diversas" },
  { modalidade: "aluguel", nome: "Vasos de flores" },
  { modalidade: "aluguel", nome: "Cortinas" },
  { modalidade: "aluguel", nome: "Tapetes" },
  { modalidade: "aluguel", nome: "Bandejas" },
  { modalidade: "aluguel", nome: "Arcos temáticos" },
  { modalidade: "aluguel", nome: "Luminárias" },
  { modalidade: "aluguel", nome: "Balões" },
  { modalidade: "aluguel", nome: "Cilindros" },
  { modalidade: "aluguel", nome: "Bancos" },
  { modalidade: "aluguel", nome: "Pratos" },
  { modalidade: "aluguel", nome: "Talheres" },
  { modalidade: "aluguel", nome: "Ursos" },
  { modalidade: "venda", nome: "Colchas de cama" },
  { modalidade: "venda", nome: "Cortinas" },
];

interface DadosCadastro {
  nome?: unknown;
  email?: unknown;
  senha?: unknown;
  token?: unknown;
  nome_comercial?: unknown;
  whatsapp?: unknown;
  slug?: unknown;
}

function texto(valor: unknown): string {
  return typeof valor === "string" ? valor.trim() : "";
}

function criarSlug(valor: string): string {
  return valor
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 60)
    .replace(/-+$/g, "");
}

function criarSlugUnico(base: string): string {
  const sufixo = crypto.randomUUID().replace(/-/g, "").slice(0, 6);
  const limiteBase = 60 - sufixo.length - 1;
  const parteBase = base.slice(0, limiteBase).replace(/-+$/g, "");
  return `${parteBase}-${sufixo}`;
}

function erroTexto(erro: unknown): string {
  return erro instanceof Error ? erro.message : "Erro desconhecido.";
}

Deno.serve(async (requisicao) => {
  if (requisicao.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  if (requisicao.method !== "POST") {
    return responder(405, { erro: "Método não permitido." });
  }

  let corpoDesconhecido: unknown;
  try {
    corpoDesconhecido = await requisicao.json();
  } catch {
    return responder(400, { erro: "O corpo da requisição deve ser JSON válido." });
  }

  if (
    typeof corpoDesconhecido !== "object" ||
    corpoDesconhecido === null ||
    Array.isArray(corpoDesconhecido)
  ) {
    return responder(400, { erro: "O corpo da requisição deve ser um objeto JSON." });
  }

  const corpo = corpoDesconhecido as DadosCadastro;
  const nome = texto(corpo.nome);
  const email = texto(corpo.email).toLowerCase();
  const senha = typeof corpo.senha === "string" ? corpo.senha : "";
  const token = texto(corpo.token);
  const nomeComercial = texto(corpo.nome_comercial);
  const numeroInformado = texto(corpo.whatsapp).replace(/\D/g, "");
  const whatsapp =
    numeroInformado.length === 10 || numeroInformado.length === 11
      ? `55${numeroInformado}`
      : numeroInformado;
  const slugInformado = texto(corpo.slug);
  const slugBase = criarSlug(slugInformado || nomeComercial);

  if (nome.length < 2 || nome.length > 120) {
    return responder(400, {
      erro: "Informe um nome com pelo menos 2 e no máximo 120 caracteres.",
    });
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || email.length > 254) {
    return responder(400, { erro: "Informe um e-mail válido." });
  }
  if (senha.length < 8) {
    return responder(400, { erro: "A senha deve ter pelo menos 8 caracteres." });
  }
  if (!token || token.length > 128) {
    return responder(400, { erro: "Informe um token válido." });
  }
  if (!nomeComercial || nomeComercial.length > 120) {
    return responder(400, { erro: "Informe o nome comercial da loja." });
  }
  if (!/^[0-9]{12,13}$/.test(whatsapp)) {
    return responder(400, {
      erro: "Informe o WhatsApp com DDD e número válido.",
    });
  }
  if (!slugBase || !/^[a-z0-9]+(-[a-z0-9]+)*$/.test(slugBase)) {
    return responder(400, { erro: "O nome da loja não gera um endereço válido." });
  }

  try {
    const supabase = criarSupabaseAdmin();
    const tokenHash = await sha256(token);
    const agora = new Date().toISOString();
    const { data: registroToken, error: erroToken } = await supabase
      .from("tokens_acesso")
      .select("id")
      .eq("token_hash", tokenHash)
      .is("usado_em", null)
      .is("revogado_em", null)
      .gt("expira_em", agora)
      .maybeSingle();

    if (erroToken) throw erroToken;
    if (!registroToken) {
      return responder(400, { erro: "Token inválido, expirado ou já utilizado." });
    }

    const { data: usuarioCriado, error: erroCriarUsuario } =
      await supabase.auth.admin.createUser({
        email,
        password: senha,
        email_confirm: true,
        user_metadata: { nome },
      });

    if (erroCriarUsuario) {
      return responder(400, { erro: erroCriarUsuario.message });
    }

    const usuarioId = usuarioCriado.user.id;
    let tokenConsumido = false;
    let lojaId: string | null = null;
    let categoriasCriadas = false;

    try {
      const { data: tokenAtualizado, error: erroConsumirToken } = await supabase
        .from("tokens_acesso")
        .update({ usado_em: new Date().toISOString(), usado_por: usuarioId })
        .eq("id", registroToken.id)
        .is("usado_em", null)
        .is("revogado_em", null)
        .gt("expira_em", new Date().toISOString())
        .select("id")
        .maybeSingle();

      if (erroConsumirToken) throw erroConsumirToken;
      if (!tokenAtualizado) {
        const { error } = await supabase.auth.admin.deleteUser(usuarioId);
        if (error) {
          console.error("Não foi possível remover conta após conflito de token:", error);
          return responder(500, { erro: "Não foi possível concluir o cadastro." });
        }
        return responder(409, { erro: "Este token já foi utilizado." });
      }
      tokenConsumido = true;

      const { error: erroPerfil } = await supabase.from("usuarios").insert({
        id: usuarioId,
        nome,
        papel: "vendedor",
      });
      if (erroPerfil) throw erroPerfil;

      let slug = slugBase;
      const { data: slugExistente, error: erroSlug } = await supabase
        .from("lojas")
        .select("id")
        .eq("slug", slug)
        .maybeSingle();
      if (erroSlug) throw erroSlug;
      if (slugExistente) slug = criarSlugUnico(slugBase);

      const { data: loja, error: erroLoja } = await supabase
        .from("lojas")
        .insert({
          usuario_id: usuarioId,
          nome_comercial: nomeComercial,
          slug,
          email,
          whatsapp,
        })
        .select("id, slug")
        .single();
      if (erroLoja) throw erroLoja;
      lojaId = loja.id;

      const categorias = CATEGORIAS_PADRAO.map(({ modalidade, nome: nomeCategoria }) => ({
        loja_id: loja.id,
        modalidade,
        nome: nomeCategoria,
        slug: criarSlug(nomeCategoria),
      }));
      const { error: erroCategorias } = await supabase
        .from("categorias")
        .insert(categorias);
      if (erroCategorias) throw erroCategorias;
      categoriasCriadas = true;

      return responder(201, {
        mensagem: "Cadastro concluído.",
        usuario_id: usuarioId,
        loja_id: loja.id,
        slug: loja.slug,
      });
    } catch (erroCadastro) {
      const errosRollback: string[] = [];

      if (tokenConsumido) {
        const { error } = await supabase
          .from("tokens_acesso")
          .update({ usado_em: null, usado_por: null })
          .eq("id", registroToken.id)
          .eq("usado_por", usuarioId);
        if (error) errosRollback.push(`Token: ${erroTexto(error)}`);
      }

      if (lojaId && categoriasCriadas) {
        const { error } = await supabase
          .from("categorias")
          .delete()
          .eq("loja_id", lojaId);
        if (error) errosRollback.push(`Categorias: ${erroTexto(error)}`);
      }

      if (lojaId) {
        const { error } = await supabase
          .from("lojas")
          .delete()
          .eq("id", lojaId);
        if (error) errosRollback.push(`Loja: ${erroTexto(error)}`);
      }

      const { error: erroExcluirUsuario } =
        await supabase.auth.admin.deleteUser(usuarioId);
      if (erroExcluirUsuario) {
        errosRollback.push(`Usuário: ${erroTexto(erroExcluirUsuario)}`);
      }

      console.error("Falha ao cadastrar vendedora:", erroCadastro, errosRollback);
      return responder(500, {
        erro: "Não foi possível concluir o cadastro.",
        ...(errosRollback.length > 0 && { rollback: errosRollback }),
      });
    }
  } catch (erro) {
    console.error("Falha na função cadastrar-vendedora:", erro);
    return responder(500, { erro: "Não foi possível processar o cadastro." });
  }
});