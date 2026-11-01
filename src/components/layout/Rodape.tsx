import type { ReactNode } from "react";

interface RodapeProps {
  children: ReactNode;
}

function Rodape({ children }: RodapeProps) {
  return <footer>{children}</footer>;
}

export default Rodape;
