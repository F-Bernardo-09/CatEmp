import type { ButtonHTMLAttributes } from "react";

type BotaoProps = ButtonHTMLAttributes<HTMLButtonElement>;

function Botao({ children, ...props }: BotaoProps) {
  return <button {...props}>{children}</button>;
}

export default Botao;
