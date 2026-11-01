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
      await entrar(email, senha);
      navegar("/painel");
    } catch {
      setErro("Não foi possível entrar. Verifique seu e-mail e senha.");
    } finally {
      setCarregando(false);
    }
  }

  return (
    <main>
      <section>
        <h1>CATEMP</h1>
        <h2>Bem-vindo!</h2>
        <p>Faça login para gerenciar sua loja.</p>

        <form onSubmit={handleSubmit}>
          <div>
            <label htmlFor="email">E-mail</label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(evento) => setEmail(evento.target.value)}
              placeholder="Digite seu e-mail"
              required
            />
          </div>

          <div>
            <label htmlFor="senha">Senha</label>
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

          <Button type="submit" disabled={carregando}>
            {carregando ? "Entrando..." : "Entrar"}
          </Button>
        </form>
      </section>
    </main>
  );
}

export default Entrar;
