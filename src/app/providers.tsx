import type { ReactNode } from "react";
import { AuthProvider } from "../contexts/AuthContext";

interface AppProvidersProps {
  children: ReactNode;
}

function AppProviders({ children }: AppProvidersProps) {
  return <AuthProvider>{children}</AuthProvider>;
}

export default AppProviders;
