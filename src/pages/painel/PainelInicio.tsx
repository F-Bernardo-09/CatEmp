import LayoutPainel from "../../components/layout/LayoutPainel";

function PainelInicio() {
  return (
    <LayoutPainel>
      <header>
        <h1>Painel da loja</h1>
        <p>Gerencie os produtos e serviços da sua loja.</p>
      </header>

      <section aria-labelledby="resumo-titulo">
        <h2 id="resumo-titulo">Resumo da loja</h2>

        <article>
          <h3>Itens publicados</h3>
          <p>Quantidade de itens publicados</p>
        </article>

        <article>
          <h3>Rascunhos</h3>
          <p>Quantidade de itens em rascunho</p>
        </article>

        <article>
          <h3>Armazenamento de fotos</h3>
          <p>Espaço utilizado pelas fotos</p>
        </article>
      </section>

      <section aria-labelledby="atalhos-titulo">
        <h2 id="atalhos-titulo">Atalhos</h2>

        <nav aria-label="Atalhos do painel">
          <ul>
            <li>
              <a href="/painel/itens/novo">Cadastrar novo item</a>
            </li>

            <li>
              <a href="/painel/loja">Ver minha loja pública</a>
            </li>
          </ul>
        </nav>
      </section>

      <section aria-labelledby="situacao-titulo">
        <h2 id="situacao-titulo">Situação da loja</h2>
        <p>
          A situação da loja será apresentada aqui após a integração dos dados.
        </p>
      </section>
    </LayoutPainel>
  );
}

export default PainelInicio;
