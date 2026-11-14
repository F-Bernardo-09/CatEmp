import { useEffect, useState, type FormEvent } from "react";

import LayoutPainel from "../../components/layout/LayoutPainel";
import { useLojaDoUsuario } from "../../hooks/useLojaDoUsuario";
import { salvarLojaDoUsuario } from "../../services/lojas";
import type { Loja } from "../../schemas/loja";

const estadoInicial: Omit<Loja, "id" | "usuario_id" | "criado_em" | "atualizado_em"> = {
  nome_comercial: "",
  slug: "",
  descricao: "",
  logo_url: null,
  capa_url: null,
  email: "",
  telefone: "",
  whatsapp: "",
  bairro: "",
  cidade: "",
  estado: "",
  situacao: "ativa",
};

function PerfilLoja() {
  const { loja, carregando, erro, atualizar } = useLojaDoUsuario();
  const [formulario, setFormulario] = useState(estadoInicial);
  const [salvando, setSalvando] = useState(false);
  const [mensagem, setMensagem] = useState("");

  useEffect(() => {
    if (!loja) return;

    setFormulario({
      nome_comercial: loja.nome_comercial,
      slug: loja.slug,
      descricao: loja.descricao ?? "",
      logo_url: loja.logo_url ?? null,
      capa_url: loja.capa_url ?? null,
      email: loja.email ?? "",
      telefone: loja.telefone ?? "",
      whatsapp: loja.whatsapp,
      bairro: loja.bairro ?? "",
      cidade: loja.cidade ?? "",
      estado: loja.estado ?? "",
      situacao: loja.situacao,
    });
  }, [loja]);

  function atualizarCampo<T extends keyof typeof formulario>(campo: T, valor: (typeof formulario)[T]) {
    setFormulario((atual) => ({
      ...atual,
      [campo]: valor,
    }));
  }

  async function salvar(evento: FormEvent<HTMLFormElement>) {
    evento.preventDefault();
    setSalvando(true);
    setMensagem("");

    try {
      await salvarLojaDoUsuario({
        ...formulario,
        whatsapp: formulario.whatsapp.replace(/\D/g, ""),
      });
      await atualizar();
      setMensagem("Perfil da loja salvo com sucesso.");
    } catch (erroSalvar) {
      console.error("Erro ao salvar loja:", erroSalvar);
      setMensagem(
        erroSalvar instanceof Error
          ? erroSalvar.message
          : "Não foi possível salvar a loja.",
      );
    } finally {
      setSalvando(false);
    }
  }

  const linkPublico = loja?.slug
    ? `${window.location.origin}/loja/${loja.slug}`
    : "Cadastre uma loja para gerar o link público.";

  return (
    <LayoutPainel>
      <div className="mx-auto flex w-full max-w-4xl flex-col gap-8">
        <header className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-sm text-text-secondary">Painel da loja</p>
            <h1 className="mt-1 text-2xl font-bold text-text">Perfil da loja</h1>
          </div>
          <span className="rounded-full border border-border bg-white px-3 py-1 text-xs font-medium text-text-secondary">
            {loja?.situacao ?? "pendente"}
          </span>
        </header>

        {erro && (
          <p role="alert" className="rounded border border-red-200 bg-red-50 p-3 text-sm text-red-700">
            {erro}
          </p>
        )}

        {mensagem && (
          <p className="rounded border border-green-200 bg-green-50 p-3 text-sm text-green-700">
            {mensagem}
          </p>
        )}

        {carregando ? (
          <p className="text-sm text-text-secondary">Carregando perfil da loja...</p>
        ) : (
          <form onSubmit={salvar} className="flex flex-col gap-6 rounded-card border border-border bg-card p-5">
            <div className="rounded border border-border bg-white p-4">
              <p className="text-xs font-medium uppercase tracking-[0.08em] text-text-secondary">
                Link público
              </p>
              <p className="mt-2 break-all text-sm text-text">{linkPublico}</p>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <label className="form-field md:col-span-2">
                <span className="form-label">Nome comercial</span>
                <input
                  className="form-control"
                  value={formulario.nome_comercial}
                  onChange={(evento) => atualizarCampo("nome_comercial", evento.target.value)}
                  required
                />
              </label>

              <label className="form-field">
                <span className="form-label">Slug</span>
                <input
                  className="form-control"
                  value={formulario.slug}
                  onChange={(evento) => atualizarCampo("slug", evento.target.value)}
                  required
                />
              </label>

              <label className="form-field">
                <span className="form-label">WhatsApp</span>
                <input
                  className="form-control"
                  value={formulario.whatsapp}
                  onChange={(evento) => atualizarCampo("whatsapp", evento.target.value)}
                  required
                  inputMode="numeric"
                />
              </label>

              <label className="form-field md:col-span-2">
                <span className="form-label">Descrição</span>
                <textarea
                  className="form-control min-h-28"
                  value={formulario.descricao ?? ""}
                  onChange={(evento) => atualizarCampo("descricao", evento.target.value)}
                />
              </label>

              <label className="form-field">
                <span className="form-label">E-mail</span>
                <input
                  className="form-control"
                  type="email"
                  value={formulario.email ?? ""}
                  onChange={(evento) => atualizarCampo("email", evento.target.value)}
                />
              </label>

              <label className="form-field">
                <span className="form-label">Telefone</span>
                <input
                  className="form-control"
                  value={formulario.telefone ?? ""}
                  onChange={(evento) => atualizarCampo("telefone", evento.target.value)}
                />
              </label>

              <label className="form-field">
                <span className="form-label">Bairro</span>
                <input
                  className="form-control"
                  value={formulario.bairro ?? ""}
                  onChange={(evento) => atualizarCampo("bairro", evento.target.value)}
                />
              </label>

              <label className="form-field">
                <span className="form-label">Cidade</span>
                <input
                  className="form-control"
                  value={formulario.cidade ?? ""}
                  onChange={(evento) => atualizarCampo("cidade", evento.target.value)}
                />
              </label>

              <label className="form-field">
                <span className="form-label">Estado</span>
                <input
                  className="form-control"
                  maxLength={2}
                  value={formulario.estado ?? ""}
                  onChange={(evento) => atualizarCampo("estado", evento.target.value.toUpperCase())}
                />
              </label>
            </div>

            <div className="flex items-center justify-end gap-3">
              <button
                type="submit"
                disabled={salvando}
                className="rounded-button bg-primary px-6 py-3 text-sm font-semibold text-text-inverse transition-colors hover:bg-primary-hover disabled:cursor-not-allowed disabled:opacity-50"
              >
                {salvando ? "Salvando..." : "Salvar perfil"}
              </button>
            </div>
          </form>
        )}
      </div>
    </LayoutPainel>
  );
}

export default PerfilLoja;
