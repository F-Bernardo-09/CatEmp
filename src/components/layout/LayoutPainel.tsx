import type { ReactNode } from "react";

interface LayoutPainelProps {
  children: ReactNode;
}

function LayoutPainel({ children }: LayoutPainelProps) {
  return (
    <div>
      <main>{children}</main>
    </div>
  );
}

export default LayoutPainel;
