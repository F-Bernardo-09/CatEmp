import type { ReactNode } from "react";

interface LayoutAdminProps {
  children: ReactNode;
}

function LayoutAdmin({ children }: LayoutAdminProps) {
  return (
    <div>
      <main>{children}</main>
    </div>
  );
}

export default LayoutAdmin;
