import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import useFormItem from "./useFormItem";

const mocks = vi.hoisted(() => ({
  navigate: vi.fn(),
  getUser: vi.fn(),
  createItem: vi.fn(),
  updateItem: vi.fn(),
  obterEstadoFotos: vi.fn(),
  enviarFotosItem: vi.fn(),
  vincularCategorias: vi.fn(),
}));

vi.mock("react-router", () => ({
  useNavigate: () => mocks.navigate,
}));

vi.mock("../../../lib/supabase", () => ({
  supabase: {
    auth: {
      getUser: mocks.getUser,
    },
  },
}));

vi.mock("../../../services/itens", () => ({
  criarItem: mocks.createItem,
  atualizarItem: mocks.updateItem,
  obterItem: vi.fn(),
}));

vi.mock("../../../services/fotos", () => ({
  obterEstadoFotos: mocks.obterEstadoFotos,
  enviarFotosItem: mocks.enviarFotosItem,
}));

vi.mock("../../../services/categorias", () => ({
  vincularCategorias: mocks.vincularCategorias,
}));

vi.mock("../../../services/extras", () => ({
  listarExtrasServico: vi.fn(),
  criarExtrasServico: vi.fn(),
}));

vi.mock("../../../services/temas", () => ({
  listarTemas: vi.fn(),
}));

function FormularioTeste() {
  const formulario = useFormItem();

  function preencher() {
    formulario.atualizarCampo("tipo", "produto");
    formulario.atualizarCampo("modalidade", "aluguel");
    formulario.atualizarCampo("titulo", "Mesa de teste");
    formulario.atualizarCampo("descricao", "Mesa para eventos.");
    formulario.atualizarCampo("preco", "50");
    formulario.atualizarCampo("precoReposicao", "200");
    formulario.atualizarCampo("altura", "80");
    formulario.atualizarCampo("largura", "120");
    formulario.atualizarCampo("profundidade", "60");
    formulario.adicionarCategoria("Mesas");
    formulario.adicionarImagens([
      new File(["foto"], "mesa.webp", { type: "image/webp" }),
    ]);
  }

  const imagem = formulario.dados.imagens[0];

  return (
    <>
      <button type="button" onClick={preencher}>
        Preencher dados
      </button>
      <button
        type="button"
        disabled={!imagem}
        onClick={() =>
          imagem &&
          formulario.atualizarTextoAlternativo(
            imagem.id,
            "Mesa decorada para evento",
          )
        }
      >
        Preencher texto alternativo
      </button>
      <form aria-label="Salvar item" onSubmit={formulario.finalizarFormulario}>
        <button type="submit" disabled={formulario.salvando}>
          Concluir
        </button>
      </form>
      {formulario.erroSalvar && (
        <p role="alert">{formulario.erroSalvar}</p>
      )}
    </>
  );
}

describe("useFormItem - integração do salvamento", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.getUser.mockResolvedValue({
      data: { user: null },
      error: null,
    });
    mocks.createItem.mockResolvedValue({
      id: "item-teste",
      loja_id: "loja-teste",
    });
    mocks.updateItem.mockResolvedValue({
      id: "item-teste",
      loja_id: "loja-teste",
    });
    mocks.obterEstadoFotos.mockResolvedValue({
      total: 0,
      proximaPosicao: 0,
      temPrincipal: false,
    });
    mocks.enviarFotosItem.mockResolvedValue([]);
    mocks.vincularCategorias
      .mockRejectedValueOnce(new Error("Falha temporária"))
      .mockResolvedValue(undefined);
  });

  it("retoma após falha sem criar novamente o item nem reenviar as fotos", async () => {
    render(<FormularioTeste />);

    fireEvent.click(screen.getByRole("button", { name: "Preencher dados" }));
    fireEvent.click(
      screen.getByRole("button", { name: "Preencher texto alternativo" }),
    );
    fireEvent.click(screen.getByRole("button", { name: "Concluir" }));

    expect(await screen.findByRole("alert")).toHaveTextContent(
      "Falha temporária",
    );
    expect(mocks.createItem).toHaveBeenCalledTimes(1);
    expect(mocks.enviarFotosItem).toHaveBeenCalledTimes(1);

    fireEvent.click(screen.getByRole("button", { name: "Concluir" }));

    await waitFor(() => {
      expect(mocks.navigate).toHaveBeenCalledWith("/painel/itens");
    });

    expect(mocks.createItem).toHaveBeenCalledTimes(1);
    expect(mocks.updateItem).toHaveBeenCalledTimes(1);
    expect(mocks.enviarFotosItem).toHaveBeenCalledTimes(1);
    expect(mocks.vincularCategorias).toHaveBeenCalledTimes(2);
  });
});
