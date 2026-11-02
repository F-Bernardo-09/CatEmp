interface CarregandoProps {
  mensagem?: string;
}

function Carregando({ mensagem = "Carregando..." }: CarregandoProps) {
  return (
    <div role="status" aria-live="polite">
      {mensagem}
    </div>
  );
}

export default Carregando;
