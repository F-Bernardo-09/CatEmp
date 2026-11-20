import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router";
import { beforeEach, describe, expect, it, vi } from "vitest";

import Buscar from "./Buscar";

const mocks = vi.hoisted(() => ({
  buscarLojaPorSlug: vi.fn(),
  listarCategoriasPublicasDaLoja: vi.fn(),
  listarItensCatalogoDaLoja: vi.fn(),
}));

vi.mock("../../services/lojas", () => ({
  buscarLojaPorSlug: mocks.buscarLojaPorSlug,
}));
vi.mock("../../services/catalogo", () => ({
  listarCategoriasPublicasDaLoja: mocks.listarCategoriasPublicasDaLoja,
  listarItensCatalogoDaLoja: mocks.listarItensCatalogoDaLoja,
}));

const loja = {
  id: "loja-1",
  usuario_id: "usuario-1",
  nome_comercial: "Minha Loja",
  slug: "minha-loja",
  descricao: null,
  logo_url: null,
  capa_url: null,
  email: null,
  telefone: null,
  whatsapp: "5511999999999",
  bairro: null,
  cidade: null,
  estado: null,
  situacao: "ativa",
  criado_em: "2026-01-01T00:00:00Z",
  atualizado_em: "2026-01-01T00:00:00Z",
};

const item = {
  id: "item-1",
  codigo_publico: "ABC12",
  loja_id: loja.id,
  loja_slug: loja.slug,
  loja_nome: loja.nome_comercial,
  tipo: "produto",
  titulo: "Vaso Aurora",
  modalidade: "aluguel",
  descricao: "Vaso decorativo",
  preco_base: 20,
  foto_url: undefined,
  em_destaque: false,
};

function renderBusca() {
  return render(
    <MemoryRouter initialEntries={["/minha-loja/buscar"]}>
      <Routes>
        <Route path="/:slug/buscar" element={<Buscar />} />
      </Routes>
    </MemoryRouter>,
  );
}

describe("Buscar", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.buscarLojaPorSlug.mockResolvedValue(loja);
    mocks.listarCategoriasPublicasDaLoja.mockResolvedValue([]);
    mocks.listarItensCatalogoDaLoja.mockResolvedValue({
      itens: [item],
      temMais: false,
    });
  });

  it("permite tentar novamente quando a lista de itens falha", async () => {
    mocks.listarItensCatalogoDaLoja
      .mockRejectedValueOnce(new Error("Falha temporária"))
      .mockResolvedValueOnce({ itens: [item], temMais: false });

    renderBusca();

    expect(
      await screen.findByText(/não foi possível carregar os itens: falha temporária/i),
    ).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "Tentar novamente" }));

    expect(
      await screen.findByRole("heading", { name: "Vaso Aurora" }),
    ).toBeInTheDocument();
  });

  it("mantém itens carregados e tenta novamente uma página que falhou", async () => {
    const segundoItem = {
      ...item,
      id: "item-2",
      codigo_publico: "DEF34",
      titulo: "Mesa Aurora",
    };
    mocks.listarItensCatalogoDaLoja
      .mockResolvedValueOnce({ itens: [item], temMais: true })
      .mockRejectedValueOnce(new Error("Falha temporária"))
      .mockResolvedValueOnce({ itens: [segundoItem], temMais: false });

    renderBusca();

    expect(
      await screen.findByRole("heading", { name: "Vaso Aurora" }),
    ).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "Carregar mais" }));

    expect(
      await screen.findByText(/não foi possível carregar os itens/i),
    ).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Vaso Aurora" })).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "Tentar novamente" }));

    expect(
      await screen.findByRole("heading", { name: "Mesa Aurora" }),
    ).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Vaso Aurora" })).toBeInTheDocument();
  });

  it("permite tentar novamente quando as categorias falham", async () => {
    mocks.listarCategoriasPublicasDaLoja
      .mockRejectedValueOnce(new Error("Falha temporária"))
      .mockResolvedValueOnce([
        { id: "categoria-1", nome: "Vasos", slug: "vasos" },
      ]);

    renderBusca();

    expect(
      await screen.findByText(/não foi possível carregar as categorias/i),
    ).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "Tentar novamente" }));

    await waitFor(() => {
      expect(screen.getByRole("option", { name: "Vasos" })).toBeInTheDocument();
    });
  });

  it("mantém tags independentes ao trocar a modalidade", async () => {
    mocks.listarCategoriasPublicasDaLoja.mockResolvedValue([
      { id: "categoria-aluguel", nome: "Cortinas", slug: "cortinas" },
    ]);

    render(
      <MemoryRouter
        initialEntries={["/minha-loja/buscar?categoria=Cortinas"]}
      >
        <Routes>
          <Route path="/:slug/buscar" element={<Buscar />} />
        </Routes>
      </MemoryRouter>,
    );

    expect(await screen.findByRole("option", { name: "Cortinas" })).toBeInTheDocument();
    expect(mocks.listarCategoriasPublicasDaLoja).toHaveBeenCalledWith("loja-1");

    fireEvent.click(screen.getByRole("button", { name: "Venda" }));

    await waitFor(() => {
      expect(mocks.listarItensCatalogoDaLoja).toHaveBeenLastCalledWith(
        expect.objectContaining({
          modalidade: "venda",
          categoria: "Cortinas",
        }),
      );
    });
    expect(screen.getByRole("option", { name: "Cortinas" })).toBeInTheDocument();
  });

  it("permite tentar novamente quando a loja falha ao carregar", async () => {
    mocks.buscarLojaPorSlug
      .mockRejectedValueOnce(new Error("Falha temporária"))
      .mockResolvedValueOnce(loja);

    renderBusca();

    expect(
      await screen.findByRole("heading", {
        name: "Não foi possível carregar a loja",
      }),
    ).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "Tentar novamente" }));

    expect(
      await screen.findByRole("heading", { name: "Vaso Aurora" }),
    ).toBeInTheDocument();
  });
});
