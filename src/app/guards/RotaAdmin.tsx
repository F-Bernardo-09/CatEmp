import { Navigate, Outlet } from "react-router";
import { useAuth } from "../../hooks/useAuth";
import Carregando from "../../components/ui/Carregando";
import CabecalhoPublico from "../../components/layout/CabecalhoPublico";

function RotaAdmin() {
  const { perfil, carregando, autenticado } = useAuth();

  if (carregando) {
    return <Carregando mensagem="Verificando permissões..." />;
  }

  if (!autenticado || !perfil || perfil.situacao !== "ativa") {
    return <Navigate to="/entrar" replace />;
  }

  if (perfil.papel !== "admin") {
    return <Navigate to="/painel" replace />;
  }

  return (
    <>
      <CabecalhoPublico />
      <Outlet />
    </>
  );
}

export default RotaAdmin;
