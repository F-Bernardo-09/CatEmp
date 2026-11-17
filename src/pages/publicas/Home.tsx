import { Link } from "react-router";
import CabecalhoPublico from "../../components/layout/CabecalhoPublico";
import Rodape from "../../components/layout/Rodape";

function Home() {
  return (
    <div className="flex min-h-screen flex-col bg-page text-text">
      <CabecalhoPublico />

      <main className="mx-auto flex w-full max-w-4xl flex-1 flex-col items-center justify-center px-4 py-16 text-center">
        <span className="rounded-full bg-primary/10 px-4 py-1.5 text-xs font-semibold tracking-wider text-primary uppercase">
          Plataforma para Microempreendedoras
        </span>
        <h1 className="mt-4 text-4xl font-extrabold tracking-tight text-text sm:text-5xl">
          Sua loja online, com a sua identidade.
        </h1>
        <p className="mt-4 max-w-2xl text-base text-text-secondary sm:text-lg">
          O CATEMP permite que cada empreendedora tenha seu próprio espaço exclusivo de divulgação de produtos e serviços, catálogo organizado e atendimento direto pelo WhatsApp.
        </p>

        <div className="mt-8 flex flex-wrap justify-center gap-4">
          <Link
            to="/entrar"
            className="rounded-button bg-primary px-6 py-3 text-sm font-semibold text-text-inverse transition-colors hover:bg-primary-hover shadow-sm"
          >
            Acessar painel da loja
          </Link>
          <Link
            to="/cadastro"
            className="rounded-button border border-border bg-white px-6 py-3 text-sm font-semibold text-text transition-colors hover:bg-surface shadow-sm"
          >
            Cadastrar com token
          </Link>
        </div>
      </main>

      <Rodape />
    </div>
  );
}

export default Home;
