import { BrowserRouter, Route, Routes } from "react-router";

import Home from "../pages/publicas/Home";
import Entrar from "../pages/publicas/Entrar";
import PainelInicio from "../pages/painel/PainelInicio";
import FormItem from "../components/painel/FormItem";
import NaoEncontrada from "../pages/NaoEncontrada";

import RotaProtegida from "./guards/RotaProtegida";
import RotaAdmin from "./guards/RotaAdmin";

function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/entrar" element={<Entrar />} />

        <Route element={<RotaProtegida />}>
          <Route path="/painel" element={<PainelInicio />} />
          <Route path="/painel/itens/novo" element={<FormItem />} />
        </Route>

        <Route element={<RotaAdmin />}>
          {/* As rotas administrativas serão adicionadas aqui. */}
        </Route>

        <Route path="*" element={<NaoEncontrada />} />
      </Routes>
    </BrowserRouter>
  );
}

export default AppRouter;
