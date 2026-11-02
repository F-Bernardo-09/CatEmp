interface ErroProps {
  mensagem: string;
}

function Erro({ mensagem }: ErroProps) {
  return (
    <div role="alert">
      <p className="text-xs text-red-600">{mensagem}</p>
    </div>
  );
}

export default Erro;
