import CarrosselDestaques from "../../components/catalogo/CarrosselDestaques";
import type { ItemDestaque } from "../../components/catalogo/types";
import CabecalhoPublico from "../../components/layout/CabecalhoPublico";
import Rodape from "../../components/layout/Rodape";

const itensDestaque: ItemDestaque[] = [
  {
    id: "vaso-aurora",
    titulo: "Vaso Aurora",
    imagemUrl:
      "https://images.unsplash.com/photo-1578749556568-bc2c40e68b61?auto=format&fit=crop&w=1800&q=85",
    link: "/produto/vaso-aurora",
  },
  {
    id: "poltrona-nuvem",
    titulo: "Poltrona Nuvem",
    imagemUrl:
      "https://images.unsplash.com/photo-1503602642458-232111445657?auto=format&fit=crop&w=1800&q=85",
    link: "/produto/poltrona-nuvem",
  },
  {
    id: "bolsa-trama",
    titulo: "Bolsa Trama",
    imagemUrl:
      "https://images.unsplash.com/photo-1490481651871-ab68de25d43d?auto=format&fit=crop&w=1800&q=85",
    link: "/produto/bolsa-trama",
  },
];

function Home() {
  return (
    <div className="flex min-h-screen flex-col bg-card text-text">
      <CabecalhoPublico />

      <main className="flex-1">
        <h1 className="sr-only">Produtos e serviços de quem empreende</h1>
        <CarrosselDestaques itens={itensDestaque} />
      </main>

      <Rodape />
    </div>
  );
}

export default Home;
