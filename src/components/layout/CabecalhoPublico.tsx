function CabecalhoPublico() {
  return (
    <header className="bg-primary px-5 py-4 text-text-inverse sm:py-5">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-6">
        <h1 className="shrink-0 text-xl font-extrabold tracking-[0.16em]">
          CATEMP
        </h1>

        {/* Área reservada para a barra de navegação e pesquisa */}
      </div>
    </header>
  );
}

export default CabecalhoPublico;
