import { useEffect, useState, type FormEvent } from "react";
import { Link } from "react-router";

import LayoutPainel from "../../components/layout/LayoutPainel";
import type { Tema } from "../../services/temas";
import { criarTema, excluirTema, listarTemasDaLoja } from "../../services/temas";

function mensagemDoErro(erro: unknown): string {
  return erro instanceof Error
    ? erro.message
    : "Não foi possível concluir a operação.";
}

function Temas() {
  const [temas, setTemas] = useState<Tema[]>([]);
  const [nome, setNome] = useState("");
  const [carregando, setCarregando] = useState(true);
  const [salvando, setSalvando] = useState(false);
  const [erro, setErro] = useState("");

  async function carregarTemas() {
    setCarregando(true);
    setErro("");
    try {
      setTemas(await listarTemasDaLoja());
    } catch (erroCarregamento) {
      console.error("Erro ao carregar temas:", erroCarregamento);
      setErro(mensagemDoErro(erroCarregamento));
    } finally {
      setCarregando(false);
    }
  }

  useEffect(() => {
    void carregarTemas();
  }, []);

  async function salvar(evento: FormEvent<HTMLFormElement>) {
    evento.preventDefault();
    setSalvando(true);
    setErro("");
    try {
      await criarTema(nome);
      setNome("");
      await carregarTemas();
    } catch (erroSalvamento) {
      console.error("Erro ao criar tema:", erroSalvamento);
      setErro(mensagemDoErro(erroSalvamento));
    } finally {
      setSalvando(false);
    }
  }

  async function remover(tema: Tema) {
    if (
      !window.confirm(
        `Excluir o tema "${tema.nome}"? Temas associados a fotos não podem ser excluídos.`,
      )
    ) {
      return;
    }

    setErro("");
    try {
      await excluirTema(tema.id);
      await carregarTemas();
    } catch (erroExclusao) {
      console.error("Erro ao excluir tema:", erroExclusao);
      setErro(mensagemDoErro(erroExclusao));
    }
  }

  return (
    <LayoutPainel>
      <div className="mx-auto flex w-full max-w-4xl flex-col gap-8">
        <header className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-sm text-text-secondary">Painel da loja</p>
            <h1 className="mt-1 text-2xl font-bold text-text">Temas</h1>
          </div>
          <Link
            to="/painel"
            className="text-sm font-medium text-text-secondary underline hover:text-text"
          >
            Voltar ao painel
          </Link>
        </header>

        <form
          onSubmit={salvar}
          className="flex flex-col gap-4 rounded-card border border-border bg-card p-5"
        >
          <h2 className="text-lg font-semibold text-text">Adicionar tema</h2>
          <label className="form-field">
            <span className="form-label">Nome</span>
            <input
              className="form-control"
              value={nome}
              onChange={(evento) => setNome(evento.target.value)}
              maxLength={60}
              required
            />
          </label>
          {erro && (
            <p role="alert" className="form-error">
              {erro}
            </p>
          )}
          <button
            type="submit"
            disabled={salvando}
            className="self-start rounded-button bg-primary px-6 py-3 text-sm font-semibold text-text-inverse transition-colors hover:bg-primary-hover disabled:cursor-not-allowed disabled:opacity-50"
          >
            {salvando ? "Salvando..." : "Adicionar tema"}
          </button>
        </form>

        <section aria-labelledby="temas-cadastrados">
          <h2
            id="temas-cadastrados"
            className="mb-3 text-lg font-semibold text-text"
          >
            Temas cadastrados
          </h2>
          {carregando ? (
            <p role="status" className="text-sm text-text-secondary">
              Carregando temas...
            </p>
          ) : temas.length === 0 ? (
            <p className="text-sm text-text-secondary">
              Nenhum tema cadastrado.
            </p>
          ) : (
            <ul className="flex flex-col divide-y divide-border rounded-card border border-border bg-card">
              {temas.map((tema) => (
                <li
                  key={tema.id}
                  className="flex flex-wrap items-center justify-between gap-3 p-4"
                >
                  <span className="font-medium text-text">{tema.nome}</span>
                  <button
                    type="button"
                    onClick={() => void remover(tema)}
                    className="text-sm font-medium text-red-700 underline"
                  >
                    Excluir
                  </button>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </LayoutPainel>
  );
}

export default Temas;