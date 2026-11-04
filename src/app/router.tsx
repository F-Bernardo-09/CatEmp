import { BrowserRouter, Route, Routes } from "react-router";

import Home from "../pages/publicas/Home";
import Entrar from "../pages/publicas/Entrar";
import Cadastro from "../pages/publicas/Cadastro";
import Tokens from "../pages/admin/Tokens";
import PainelInicio from "../pages/painel/PainelInicio";
import Categorias from "../pages/painel/Categorias";
import Temas from "../pages/painel/Temas";
import FormItem from "../components/painel/FormItem";
import NaoEncontrada from "../pages/NaoEncontrada";

import RotaProtegida from "./guards/RotaProtegida";
import RotaAdmin from "./guards/RotaAdmin";

function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/preview" element={<Home />} />
        <Route path="/entrar" element={<Entrar />} />
        <Route path="/cadastro" element={<Cadastro />} />

        {/* Pré-visualização sem autenticação */}
        <Route path="/preview-item" element={<FormItem />} />

        <Route element={<RotaProtegida />}>
          <Route path="/painel" element={<PainelInicio />} />
          <Route path="/painel/categorias" element={<Categorias />} />
          <Route path="/painel/temas" element={<Temas />} />
          <Route path="/painel/itens/novo" element={<FormItem />} />
        </Route>

        <Route element={<RotaAdmin />}>
          <Route path="/admin/tokens" element={<Tokens />} />
        </Route>

        <Route path="*" element={<NaoEncontrada />} />
      </Routes>
    </BrowserRouter>
  );
}

export default AppRouter;
