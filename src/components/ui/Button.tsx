import type { ButtonHTMLAttributes } from "react";

type BotaoProps = ButtonHTMLAttributes<HTMLButtonElement>;

function Button({ children, className = "", ...props }: BotaoProps) {
  return (
    <button
      className={`
        w-full rounded-button bg-primary px-6 py-3
        text-sm font-semibold text-text-inverse
        transition-colors hover:bg-primary-hover
        disabled:cursor-not-allowed disabled:opacity-50
        ${className}
      `}
      {...props}
    >
      {children}
    </button>
  );
}

export default Button;
