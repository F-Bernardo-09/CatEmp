import type { ButtonHTMLAttributes } from "react";

type BotaoProps = ButtonHTMLAttributes<HTMLButtonElement>;

function Button({ children, ...props }: BotaoProps) {
  return <button {...props}>{children}</button>;
}

export default Button;
