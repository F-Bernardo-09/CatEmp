import type { ReactNode } from "react";
import { AuthProvider } from "../contexts/AuthContext";
import { CarrinhoProvider } from "../contexts/CarrinhoContext";

interface AppProvidersProps {
  children: ReactNode;
}

function AppProviders({ children }: AppProvidersProps) {
  return (
    <AuthProvider>
      <CarrinhoProvider>{children}</CarrinhoProvider>
    </AuthProvider>
  );
}

export default AppProviders;
