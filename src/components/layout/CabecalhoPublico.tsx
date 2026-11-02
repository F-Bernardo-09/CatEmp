import type { ReactNode } from "react";

interface CabecalhoPublicoProps {
  children: ReactNode;
}

function CabecalhoPublico({ children }: CabecalhoPublicoProps) {
  return <header>{children}</header>;
}

export default CabecalhoPublico;
