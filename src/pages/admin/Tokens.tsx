import { useState, type FormEvent } from "react";
import { Link } from "react-router";

import LayoutAdmin from "../../components/layout/LayoutAdmin";
import { useTokens } from "../../hooks/queries/useTokens";
import type { NovoTokenAcesso, TokenAcesso } from "../../schemas/token";
import { gerarToken, revogarToken } from "../../services/tokens";

function situacaoToken(token: TokenAcesso): string {
  if (token.revogado_em) return "Revogado";
  if (token.usado_em) return "Usado";
  if (new Date(token.expira_em).getTime() <= Date.now()) return "Vencido";
  return "Disponível";
}

function dataHora(valor: string): string {
  return new Intl.DateTimeFormat("pt-BR", {
    dateStyle: "short",
    timeStyle: "short",
  }).format(new Date(valor));
}

function Tokens() {
  const { tokens, carregando, erro, atualizar } = useTokens();
  const [emitidoPara, setEmitidoPara] = useState("");
  const [validadeDias, setValidadeDias] = useState("7");
  const [tokenGerado, setTokenGerado] = useState<NovoTokenAcesso | null>(null);
  const [salvando, setSalvando] = useState(false);
  const [erroOperacao, setErroOperacao] = useState("");

  async function criar(evento: FormEvent<HTMLFormElement>) {
    evento.preventDefault();
    setSalvando(true);
    setErroOperacao("");
    setTokenGerado(null);
    try {
      const resultado = await gerarToken(emitidoPara, Number(validadeDias));
      setTokenGerado(resultado);
      setEmitidoPara("");
      await atualizar();
    } catch (erroGeracao) {
      console.error("Erro ao gerar token de acesso:", erroGeracao);
      setErroOperacao(
        erroGeracao instanceof Error
          ? erroGeracao.message
          : "Não foi possível gerar o token.",
      );
    } finally {
      setSalvando(false);
    }
  }

  async function revogar(token: TokenAcesso) {
    if (!window.confirm(`Revogar o token emitido para "${token.emitido_para}"?`)) {
      return;
    }
    setErroOperacao("");
    try {
      await revogarToken(token.id);
      await atualizar();
    } catch (erroRevogacao) {
      console.error("Erro ao revogar token:", erroRevogacao);
      setErroOperacao(
        erroRevogacao instanceof Error
          ? erroRevogacao.message
          : "Não foi possível revogar o token.",
      );
    }
  }

  return (
    <LayoutAdmin>
      <div className="mx-auto flex min-h-screen w-full max-w-5xl flex-col gap-8 bg-white p-5 sm:p-8">
        <header className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-sm text-text-secondary">Administração</p>
            <h1 className="mt-1 text-2xl font-bold text-text">
              Tokens de acesso
            </h1>
          </div>
          <Link
            to="/painel"
            className="text-sm font-medium text-text-secondary underline hover:text-text"
          >
            Voltar ao painel
          </Link>
        </header>

        <form
          onSubmit={criar}
          className="flex flex-col gap-4 rounded-card border border-border bg-card p-5"
        >
          <h2 className="text-lg font-semibold text-text">Gerar token</h2>
          <div className="grid gap-4 sm:grid-cols-[1fr_12rem]">
            <label className="form-field">
              <span className="form-label">Emitido para</span>
              <input
                className="form-control"
                value={emitidoPara}
                onChange={(evento) => setEmitidoPara(evento.target.value)}
                maxLength={120}
                required
              />
            </label>
            <label className="form-field">
              <span className="form-label">Validade (dias)</span>
              <input
                className="form-control"
                type="number"
                min="1"
                max="365"
                step="1"
                value={validadeDias}
                onChange={(evento) => setValidadeDias(evento.target.value)}
                required
              />
            </label>
          </div>
          {erroOperacao && (
            <p role="alert" className="form-error">
              {erroOperacao}
            </p>
          )}
          <button
            type="submit"
            disabled={salvando}
            className="self-start rounded-button bg-primary px-6 py-3 text-sm font-semibold text-text-inverse transition-colors hover:bg-primary-hover disabled:cursor-not-allowed disabled:opacity-50"
          >
            {salvando ? "Gerando..." : "Gerar token"}
          </button>
        </form>

        {tokenGerado && (
          <section
            aria-labelledby="token-gerado"
            className="rounded-card border border-green-700 bg-card p-5"
          >
            <h2 id="token-gerado" className="font-semibold text-text">
              Token gerado — copie agora
            </h2>
            <p className="mt-2 break-all rounded border border-border bg-surface p-3 font-mono text-lg">
              {tokenGerado.token}
            </p>
            <p className="mt-2 text-sm text-text-secondary">
              Emitido para {tokenGerado.emitido_para}; expira em{" "}
              {dataHora(tokenGerado.expira_em)}. Ele não será exibido novamente.
            </p>
            <button
              type="button"
              onClick={() => setTokenGerado(null)}
              className="mt-3 text-sm font-medium text-text underline"
            >
              Fechar
            </button>
          </section>
        )}

        {erro && (
          <p role="alert" className="form-error">
            {erro}
          </p>
        )}

        <section aria-labelledby="lista-tokens">
          <h2 id="lista-tokens" className="mb-3 text-lg font-semibold text-text">
            Tokens emitidos
          </h2>
          {carregando ? (
            <p role="status" className="text-sm text-text-secondary">
              Carregando tokens...
            </p>
          ) : tokens.length === 0 ? (
            <p className="text-sm text-text-secondary">Nenhum token emitido.</p>
          ) : (
            <div className="overflow-x-auto rounded-card border border-border bg-card">
              <table className="w-full border-collapse text-left text-sm">
                <thead className="bg-surface">
                  <tr>
                    <th className="p-3 font-semibold">Emitido para</th>
                    <th className="p-3 font-semibold">Situação</th>
                    <th className="p-3 font-semibold">Expira em</th>
                    <th className="p-3 font-semibold">Criado em</th>
                    <th className="p-3 font-semibold">Ações</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {tokens.map((token) => {
                    const situacao = situacaoToken(token);
                    return (
                      <tr key={token.id}>
                        <td className="p-3">{token.emitido_para}</td>
                        <td className="p-3">{situacao}</td>
                        <td className="p-3">{dataHora(token.expira_em)}</td>
                        <td className="p-3">{dataHora(token.criado_em)}</td>
                        <td className="p-3">
                          {situacao === "Disponível" && (
                            <button
                              type="button"
                              onClick={() => void revogar(token)}
                              className="font-medium text-red-700 underline"
                            >
                              Revogar
                            </button>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </div>
    </LayoutAdmin>
  );
}

export default Tokens;