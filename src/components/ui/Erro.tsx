interface ErroProps {
  mensagem: string;
}

function Erro({ mensagem }: ErroProps) {
  return (
    <div role="alert">
      <p>{mensagem}</p>
    </div>
  );
}

export default Erro;
