import { useEffect, useState, type FormEvent } from "react";
import { Link } from "react-router";

import LayoutPainel from "../../components/layout/LayoutPainel";
import type {
  Categoria,
  ModalidadeCategoria,
} from "../../schemas/categoria";
import {
  alterarSituacaoCategoria,
  atualizarCategoria,
  criarCategoria,
  excluirCategoria,
  listarCategorias,
} from "../../services/categorias";

function mensagemDoErro(erro: unknown): string {
  return erro instanceof Error ? erro.message : "Não foi possível concluir a operação.";
}

function Categorias() {
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [nome, setNome] = useState("");
  const [modalidade, setModalidade] = useState<ModalidadeCategoria>("aluguel");
  const [categoriaEditando, setCategoriaEditando] = useState<string | null>(null);
  const [carregando, setCarregando] = useState(true);
  const [salvando, setSalvando] = useState(false);
  const [erro, setErro] = useState("");

  async function carregarCategorias() {
    setCarregando(true);
    setErro("");

    try {
      setCategorias(await listarCategorias());
    } catch (erroCarregamento) {
      console.error("Erro ao carregar categorias:", erroCarregamento);
      setErro(mensagemDoErro(erroCarregamento));
    } finally {
      setCarregando(false);
    }
  }

  useEffect(() => {
    void carregarCategorias();
  }, []);

  function limparFormulario() {
    setNome("");
    setModalidade("aluguel");
    setCategoriaEditando(null);
  }

  function editar(categoria: Categoria) {
    setCategoriaEditando(categoria.id);
    setNome(categoria.nome);
    setModalidade(categoria.modalidade);
    setErro("");
  }

  async function salvar(evento: FormEvent<HTMLFormElement>) {
    evento.preventDefault();
    setSalvando(true);
    setErro("");

    try {
      if (categoriaEditando) {
        await atualizarCategoria(categoriaEditando, nome, modalidade);
      } else {
        await criarCategoria(nome, modalidade);
      }

      limparFormulario();
      await carregarCategorias();
    } catch (erroSalvamento) {
      console.error("Erro ao salvar categoria:", erroSalvamento);
      setErro(mensagemDoErro(erroSalvamento));
    } finally {
      setSalvando(false);
    }
  }

  async function alternarSituacao(categoria: Categoria) {
    setErro("");

    try {
      await alterarSituacaoCategoria(
        categoria.id,
        categoria.situacao === "ativa" ? "inativa" : "ativa",
      );
      await carregarCategorias();
    } catch (erroAtualizacao) {
      console.error("Erro ao alterar situação da categoria:", erroAtualizacao);
      setErro(mensagemDoErro(erroAtualizacao));
    }
  }

  async function remover(categoria: Categoria) {
    if (
      !window.confirm(
        `Excluir a categoria "${categoria.nome}"? Itens associados podem impedir a exclusão.`,
      )
    ) {
      return;
    }

    setErro("");
    try {
      await excluirCategoria(categoria.id);
      await carregarCategorias();
    } catch (erroExclusao) {
      console.error("Erro ao excluir categoria:", erroExclusao);
      setErro(mensagemDoErro(erroExclusao));
    }
  }

  const grupos: { modalidade: ModalidadeCategoria; titulo: string }[] = [
    { modalidade: "aluguel", titulo: "Aluguel" },
    { modalidade: "venda", titulo: "Venda" },
  ];

  return (
    <LayoutPainel>
      <div className="mx-auto flex w-full max-w-4xl flex-col gap-8">
        <header className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-sm text-text-secondary">Painel da loja</p>
            <h1 className="mt-1 text-2xl font-bold text-text">Categorias</h1>
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
          <h2 className="text-lg font-semibold text-text">
            {categoriaEditando ? "Editar categoria" : "Adicionar categoria"}
          </h2>
          <div className="grid gap-4 sm:grid-cols-[1fr_12rem]">
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
            <label className="form-field">
              <span className="form-label">Modalidade</span>
              <select
                className="form-control form-select"
                value={modalidade}
                onChange={(evento) => {
                  const valor = evento.target.value;
                  if (valor === "aluguel" || valor === "venda") {
                    setModalidade(valor);
                  }
                }}
              >
                <option value="aluguel">Aluguel</option>
                <option value="venda">Venda</option>
              </select>
            </label>
          </div>
          {erro && (
            <p role="alert" className="form-error">
              {erro}
            </p>
          )}
          <div className="flex flex-wrap gap-3">
            <button
              type="submit"
              disabled={salvando}
              className="rounded-button bg-primary px-6 py-3 text-sm font-semibold text-text-inverse transition-colors hover:bg-primary-hover disabled:cursor-not-allowed disabled:opacity-50"
            >
              {salvando ? "Salvando..." : categoriaEditando ? "Salvar alterações" : "Adicionar"}
            </button>
            {categoriaEditando && (
              <button
                type="button"
                onClick={limparFormulario}
                className="rounded-button border border-border px-6 py-3 text-sm font-semibold text-text"
              >
                Cancelar edição
              </button>
            )}
          </div>
        </form>

        {carregando ? (
          <p role="status" className="text-sm text-text-secondary">
            Carregando categorias...
          </p>
        ) : (
          grupos.map((grupo) => {
            const categoriasDoGrupo = categorias.filter(
              (categoria) => categoria.modalidade === grupo.modalidade,
            );

            return (
              <section key={grupo.modalidade} aria-labelledby={`titulo-${grupo.modalidade}`}>
                <h2
                  id={`titulo-${grupo.modalidade}`}
                  className="mb-3 text-lg font-semibold text-text"
                >
                  {grupo.titulo}
                </h2>
                {categoriasDoGrupo.length === 0 ? (
                  <p className="text-sm text-text-secondary">
                    Nenhuma categoria cadastrada.
                  </p>
                ) : (
                  <ul className="flex flex-col divide-y divide-border rounded-card border border-border bg-card">
                    {categoriasDoGrupo.map((categoria) => (
                      <li
                        key={categoria.id}
                        className="flex flex-wrap items-center justify-between gap-3 p-4"
                      >
                        <div>
                          <p className="font-medium text-text">{categoria.nome}</p>
                          <p className="text-sm text-text-secondary">
                            {categoria.situacao === "ativa" ? "Ativa" : "Inativa"}
                          </p>
                        </div>
                        <div className="flex flex-wrap gap-3">
                          <button
                            type="button"
                            onClick={() => editar(categoria)}
                            className="text-sm font-medium text-text underline"
                          >
                            Editar
                          </button>
                          <button
                            type="button"
                            onClick={() => void alternarSituacao(categoria)}
                            className="text-sm font-medium text-text underline"
                          >
                            {categoria.situacao === "ativa" ? "Inativar" : "Ativar"}
                          </button>
                          <button
                            type="button"
                            onClick={() => void remover(categoria)}
                            className="text-sm font-medium text-red-700 underline"
                          >
                            Excluir
                          </button>
                        </div>
                      </li>
                    ))}
                  </ul>
                )}
              </section>
            );
          })
        )}
      </div>
    </LayoutPainel>
  );
}

export default Categorias;