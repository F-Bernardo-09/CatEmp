import { useState, type FormEvent } from "react";
import { useNavigate } from "react-router";

import { useAuth } from "../../hooks/useAuth";
import Button from "../../components/ui/Button";
import Input from "../../components/ui/Input";
import Erro from "../../components/ui/Erro";

function Entrar() {
  const { entrar } = useAuth();
  const navegar = useNavigate();

  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [erro, setErro] = useState("");
  const [carregando, setCarregando] = useState(false);

  async function handleSubmit(evento: FormEvent<HTMLFormElement>) {
    evento.preventDefault();

    setErro("");
    setCarregando(true);

    try {
      const perfil = await entrar(email, senha);

      if (perfil.papel === "admin") {
        navegar("/admin/tokens");
      } else {
        navegar("/painel");
      }
    } catch (erroLogin) {
      console.error("Erro ao entrar:", erroLogin);
      setErro(
        erroLogin instanceof Error &&
          erroLogin.message === "A conta não possui um perfil ativo."
          ? "Não foi possível acessar esta conta. Tente novamente ou fale com o suporte."
          : "Não foi possível entrar. Verifique seu e-mail e senha ou tente novamente.",
      );
    } finally {
      setCarregando(false);
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-page p-6">
      <section className="w-full max-w-md rounded-card bg-surface p-8 shadow-lg sm:p-10">
        <header className="mb-8 text-center">
          <h1 className="mb-8 text-3xl font-bold tracking-tight text-text">
            CATEMP
          </h1>

          <h2 className="text-2xl font-semibold text-text">Bem-vindo!</h2>

          <p className="mt-2 text-sm text-text-secondary">
            Faça login para gerenciar sua loja.
          </p>
        </header>

        <form onSubmit={handleSubmit} className="flex flex-col gap-5">
          <div className="flex flex-col gap-2">
            <label htmlFor="email" className="text-sm font-medium text-text">
              E-mail
            </label>

            <Input
              id="email"
              type="email"
              value={email}
              onChange={(evento) => setEmail(evento.target.value)}
              placeholder="Digite seu e-mail"
              required
            />
          </div>

          <div className="flex flex-col gap-2">
            <label htmlFor="senha" className="text-sm font-medium text-text">
              Senha
            </label>

            <Input
              id="senha"
              type="password"
              value={senha}
              onChange={(evento) => setSenha(evento.target.value)}
              placeholder="Digite sua senha"
              required
            />
          </div>

          {erro && <Erro mensagem={erro} />}

          <div className="pt-2">
            <Button type="submit" disabled={carregando}>
              {carregando ? "Entrando..." : "Entrar"}
            </Button>
          </div>
        </form>
      </section>
    </main>
  );
}

export default Entrar;
