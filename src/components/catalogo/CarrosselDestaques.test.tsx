import { fireEvent, render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router";
import { describe, expect, it } from "vitest";
import CarrosselDestaques from "./CarrosselDestaques";

const itens = [
  {
    id: "vaso-aurora",
    titulo: "Vaso Aurora",
    imagemUrl: "https://example.com/vaso.jpg",
    link: "/produto/vaso-aurora",
  },
  {
    id: "poltrona-nuvem",
    titulo: "Poltrona Nuvem",
    imagemUrl: "https://example.com/poltrona.jpg",
    link: "/produto/poltrona-nuvem",
  },
  {
    id: "bolsa-trama",
    titulo: "Bolsa Trama",
    imagemUrl: "https://example.com/bolsa.jpg",
    link: "/produto/bolsa-trama",
  },
];

describe("CarrosselDestaques", () => {
  it("mostra a mensagem de estado vazio quando não há itens", () => {
    render(
      <MemoryRouter>
        <CarrosselDestaques itens={[]} />
      </MemoryRouter>,
    );

    expect(
      screen.getByText(/ainda não há itens em destaque/i),
    ).toBeInTheDocument();
  });

  it("mostra o primeiro item e avança para o próximo destaque", () => {
    render(
      <MemoryRouter>
        <CarrosselDestaques itens={itens} />
      </MemoryRouter>,
    );

    expect(screen.getByRole("heading", { name: /vaso aurora/i })).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: /próximo destaque/i }));

    expect(screen.getByRole("heading", { name: /poltrona nuvem/i })).toBeInTheDocument();
  });
});
