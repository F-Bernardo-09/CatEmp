import { BrowserRouter, Route, Routes } from "react-router";

import Home from "../pages/publicas/Home";
import Entrar from "../pages/publicas/Entrar";
import PainelInicio from "../pages/painel/PainelInicio";
import NaoEncontrada from "../pages/NaoEncontrada";

function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/entrar" element={<Entrar />} />

        <Route path="/painel" element={<PainelInicio />} />

        <Route path="*" element={<NaoEncontrada />} />
      </Routes>
    </BrowserRouter>
  );
}

export default AppRouter;
