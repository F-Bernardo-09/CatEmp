import { BrowserRouter, Route, Routes } from "react-router";

import Home from "../pages/publicas/Home";
import Buscar from "../pages/publicas/Buscar";
import Loja from "../pages/publicas/Loja";
import DetalheItem from "../pages/publicas/DetalheItem";
import Entrar from "../pages/publicas/Entrar";
import Cadastro from "../pages/publicas/Cadastro";
import Tokens from "../pages/admin/Tokens";
import PainelInicio from "../pages/painel/PainelInicio";
import PerfilLoja from "../pages/painel/PerfilLoja";
import ItensLista from "../pages/painel/ItensLista";
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
        {/* Institucional e autenticação da plataforma */}
        <Route path="/" element={<Home />} />
        <Route path="/entrar" element={<Entrar />} />
        <Route path="/cadastro" element={<Cadastro />} />

        {/* Rotas administrativas e do painel */}
        <Route element={<RotaProtegida />}>
          <Route path="/painel" element={<PainelInicio />} />
          <Route path="/painel/loja" element={<PerfilLoja />} />
          <Route path="/painel/categorias" element={<Categorias />} />
          <Route path="/painel/temas" element={<Temas />} />
          <Route path="/painel/itens" element={<ItensLista />} />
          <Route path="/painel/itens/novo" element={<FormItem />} />
          <Route path="/painel/itens/:id" element={<FormItem />} />
        </Route>

        <Route element={<RotaAdmin />}>
          <Route path="/admin/tokens" element={<Tokens />} />
        </Route>

        {/* Rotas no contexto exclusivo de cada loja */}
        <Route path="/:slug" element={<Loja />} />
        <Route path="/:slug/buscar" element={<Buscar />} />
        <Route path="/:slug/item/:codigo" element={<DetalheItem />} />

        {/* Rota legada para retrocompatibilidade /loja/:slug */}
        <Route path="/loja/:slug" element={<Loja />} />
        <Route path="/loja/:slug/buscar" element={<Buscar />} />
        <Route path="/loja/:slug/item/:codigo" element={<DetalheItem />} />

        <Route path="*" element={<NaoEncontrada />} />
      </Routes>
    </BrowserRouter>
  );
}

export default AppRouter;
