import { useRef, useState, type FormEvent } from "react";
import { Link, useNavigate } from "react-router";

import { supabase } from "../../lib/supabase";

interface DadosCadastro {
  nome: string;
  email: string;
  senha: string;
  confirmarSenha: string;
  token: string;
  nomeComercial: string;
  whatsapp: string;
  slug: string;
}

function Cadastro() {
  const navegar = useNavigate();
  const etapaRef = useRef<HTMLFieldSetElement>(null);
  const [etapa, setEtapa] = useState<1 | 2>(1);
  const [dados, setDados] = useState<DadosCadastro>({
    nome: "",
    email: "",
    senha: "",
    confirmarSenha: "",
    token: "",
    nomeComercial: "",
    whatsapp: "",
    slug: "",
  });
  const [erro, setErro] = useState("");
  const [salvando, setSalvando] = useState(false);

  function atualizar<K extends keyof DadosCadastro>(
    campo: K,
    valor: DadosCadastro[K],
  ) {
    setDados((atuais) => ({ ...atuais, [campo]: valor }));
  }

  function proximaEtapa() {
    if (!etapaRef.current?.reportValidity()) return;
    setErro("");
    setEtapa(2);
  }

  async function cadastrar(evento: FormEvent<HTMLFormElement>) {
    evento.preventDefault();
    if (!etapaRef.current?.reportValidity()) return;

    setErro("");
    setSalvando(true);
    try {
      const { error } = await supabase.functions.invoke("cadastrar-vendedora", {
        body: {
          nome: dados.nome.trim(),
          email: dados.email.trim(),
          senha: dados.senha,
          token: dados.token.trim(),
          nome_comercial: dados.nomeComercial.trim(),
          whatsapp: dados.whatsapp.replace(/\D/g, ""),
          slug: dados.slug.trim(),
        },
      });

      if (error) throw error;
      navegar("/entrar", { replace: true });
    } catch (erroCadastro) {
      console.error("Erro ao cadastrar loja:", erroCadastro);
      setErro(
        erroCadastro instanceof Error
          ? erroCadastro.message
          : "Não foi possível concluir o cadastro. Confira os dados e o token.",
      );
    } finally {
      setSalvando(false);
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-page p-6">
      <section className="w-full max-w-2xl rounded-card bg-surface p-8 shadow-lg sm:p-10">
        <header className="mb-8">
          <h1 className="text-3xl font-bold tracking-tight text-text">CATEMP</h1>
          <h2 className="mt-6 text-2xl font-semibold text-text">
            Cadastro de vendedora
          </h2>
          <p className="mt-2 text-sm text-text-secondary">
            Etapa {etapa} de 2:{" "}
            {etapa === 1 ? "seus dados de acesso" : "dados da loja"}
          </p>
        </header>

        <form onSubmit={cadastrar} className="flex flex-col gap-6">
          {etapa === 1 ? (
            <fieldset ref={etapaRef} className="form-step">
              <legend className="form-step-title">Seus dados de acesso</legend>
              <label className="form-field">
                <span className="form-label">Nome completo</span>
                <input
                  className="form-control"
                  autoComplete="name"
                  maxLength={120}
                  minLength={2}
                  value={dados.nome}
                  onChange={(evento) => atualizar("nome", evento.target.value)}
                  required
                />
              </label>
              <label className="form-field">
                <span className="form-label">E-mail</span>
                <input
                  className="form-control"
                  type="email"
                  autoComplete="email"
                  maxLength={254}
                  value={dados.email}
                  onChange={(evento) => atualizar("email", evento.target.value)}
                  required
                />
              </label>
              <label className="form-field">
                <span className="form-label">Senha</span>
                <input
                  className="form-control"
                  type="password"
                  autoComplete="new-password"
                  minLength={8}
                  value={dados.senha}
                  onChange={(evento) => atualizar("senha", evento.target.value)}
                  required
                />
              </label>
              <label className="form-field">
                <span className="form-label">Confirmar senha</span>
                <input
                  className="form-control"
                  type="password"
                  autoComplete="new-password"
                  value={dados.confirmarSenha}
                  onChange={(evento) =>
                    atualizar("confirmarSenha", evento.target.value)
                  }
                  pattern={dados.senha.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}
                  title="As senhas devem ser iguais."
                  required
                />
              </label>
              <label className="form-field">
                <span className="form-label">Token de acesso</span>
                <input
                  className="form-control"
                  autoComplete="off"
                  value={dados.token}
                  onChange={(evento) => atualizar("token", evento.target.value)}
                  required
                />
              </label>
            </fieldset>
          ) : (
            <fieldset ref={etapaRef} className="form-step">
              <legend className="form-step-title">Dados da loja</legend>
              <label className="form-field">
                <span className="form-label">Nome comercial</span>
                <input
                  className="form-control"
                  maxLength={120}
                  value={dados.nomeComercial}
                  onChange={(evento) =>
                    atualizar("nomeComercial", evento.target.value)
                  }
                  required
                />
              </label>
              <label className="form-field">
                <span className="form-label">WhatsApp com DDD</span>
                <input
                  className="form-control"
                  type="tel"
                  autoComplete="tel-national"
                  inputMode="numeric"
                  pattern="[0-9() +.-]{10,20}"
                  title="Informe o número com DDD, sem código do país."
                  value={dados.whatsapp}
                  onChange={(evento) =>
                    atualizar("whatsapp", evento.target.value)
                  }
                  required
                />
              </label>
              <label className="form-field">
                <span className="form-label">Endereço da loja (opcional)</span>
                <input
                  className="form-control"
                  maxLength={60}
                  pattern="[a-zA-Z0-9]+(-[a-zA-Z0-9]+)*"
                  title="Use letras, números e hífens, sem espaços."
                  placeholder="Ex.: minha-loja"
                  value={dados.slug}
                  onChange={(evento) => atualizar("slug", evento.target.value)}
                />
                <span className="text-sm text-text-secondary">
                  Se ficar em branco, será gerado a partir do nome comercial.
                </span>
              </label>
            </fieldset>
          )}

          {erro && (
            <p role="alert" className="form-error">
              {erro}
            </p>
          )}

          <nav className="flex items-center justify-between gap-3 border-t border-border pt-6">
            {etapa === 2 ? (
              <button
                type="button"
                onClick={() => {
                  setErro("");
                  setEtapa(1);
                }}
                className="rounded-button border border-border px-6 py-3 text-sm font-semibold text-text"
              >
                Voltar
              </button>
            ) : (
              <Link
                to="/entrar"
                className="text-sm font-medium text-text-secondary underline"
              >
                Já tenho conta
              </Link>
            )}
            {etapa === 1 ? (
              <button
                type="button"
                onClick={proximaEtapa}
                className="rounded-button bg-primary px-8 py-3 text-sm font-semibold text-text-inverse transition-colors hover:bg-primary-hover"
              >
                Continuar
              </button>
            ) : (
              <button
                type="submit"
                disabled={salvando}
                className="rounded-button bg-primary px-8 py-3 text-sm font-semibold text-text-inverse transition-colors hover:bg-primary-hover disabled:cursor-not-allowed disabled:opacity-50"
              >
                {salvando ? "Cadastrando..." : "Concluir cadastro"}
              </button>
            )}
          </nav>
        </form>
      </section>
    </main>
  );
}

export default Cadastro;