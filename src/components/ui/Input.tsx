import type { InputHTMLAttributes } from "react";

type InputProps = InputHTMLAttributes<HTMLInputElement>;

function Input({ className = "", ...props }: InputProps) {
  return (
    <input
      className={`
        w-full rounded-input border border-border bg-card
        px-5 py-3 text-sm text-text
        placeholder:text-text-secondary
        outline-none transition
        focus:border-primary focus:ring-1 focus:ring-primary
        disabled:cursor-not-allowed disabled:opacity-50
        ${className}
      `}
      {...props}
    />
  );
}

export default Input;
