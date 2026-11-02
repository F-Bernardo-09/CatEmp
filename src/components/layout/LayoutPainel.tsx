import type { ReactNode } from "react";

interface LayoutPainelProps {
  children: ReactNode;
}

function LayoutPainel({ children }: LayoutPainelProps) {
  return (
    <div className="min-h-screen bg-white p-3 sm:p-6">
      <main className="mx-auto min-h-screen w-full max-w-6xl p-5 sm:p-8">
        {children}
      </main>
    </div>
  );
}

export default LayoutPainel;
