import type { ReactNode } from "react";

interface EstadoVazioProps {
  titulo: string;
  descricao?: string;
  children?: ReactNode;
}

function EstadoVazio({ titulo, descricao, children }: EstadoVazioProps) {
  return (
    <section>
      <h2>{titulo}</h2>
      {descricao && <p>{descricao}</p>}
      {children}
    </section>
  );
}

export default EstadoVazio;
