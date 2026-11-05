import { Navigate, Outlet } from "react-router";
import { useAuth } from "../../hooks/useAuth";
import Carregando from "../../components/ui/Carregando";
import CabecalhoPublico from "../../components/layout/CabecalhoPublico";

function RotaProtegida() {
  const { autenticado, carregando } = useAuth();

  if (carregando) {
    return <Carregando mensagem="Verificando autenticação..." />;
  }

  if (!autenticado) {
    return <Navigate to="/entrar" replace />;
  }

  return (
    <>
      <CabecalhoPublico />
      <Outlet />
    </>
  );
}

export default RotaProtegida;
