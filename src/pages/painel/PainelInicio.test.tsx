import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router";
import { beforeEach, describe, expect, it, vi } from "vitest";

import PainelInicio from "./PainelInicio";

const mocks = vi.hoisted(() => ({
  useAuth: vi.fn(),
  useLojaDoUsuario: vi.fn(),
  obterResumoPainel: vi.fn(),
}));

vi.mock("../../hooks/useAuth", () => mocks);
vi.mock("../../hooks/useLojaDoUsuario", () => mocks);
vi.mock("../../services/resumoPainel", () => mocks);

describe("PainelInicio", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.useAuth.mockReturnValue({ perfil: { nome: "João" } });
    mocks.useLojaDoUsuario.mockReturnValue({
      loja: {
        id: "loja-1",
        slug: "minha-loja",
        situacao: "ativa",
      },
      carregando: false,
      erro: "",
      atualizar: vi.fn(),
    });
    mocks.obterResumoPainel.mockResolvedValue({
      itensPublicados: 4,
      itensRascunho: 2,
      fotosCadastradas: 7,
    });
  });

  it("mostra as contagens retornadas para a loja do usuário", async () => {
    render(
      <MemoryRouter>
        <PainelInicio />
      </MemoryRouter>,
    );

    expect(await screen.findByText("4")).toBeInTheDocument();
    expect(screen.getByText("2")).toBeInTheDocument();
    expect(screen.getByText("7")).toBeInTheDocument();
    expect(mocks.obterResumoPainel).toHaveBeenCalledWith("loja-1");
  });

  it("avisa quando a loja está suspensa", () => {
    mocks.useLojaDoUsuario.mockReturnValue({
      loja: {
        id: "loja-1",
        slug: "minha-loja",
        situacao: "suspensa",
      },
      carregando: false,
      erro: "",
      atualizar: vi.fn(),
    });

    render(
      <MemoryRouter>
        <PainelInicio />
      </MemoryRouter>,
    );

    expect(screen.getByText("Loja inativa")).toBeInTheDocument();
    expect(
      screen.getByText(/sua loja está suspensa e não aparece/i),
    ).toBeInTheDocument();
  });
});
