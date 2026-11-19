import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router";
import { describe, expect, it } from "vitest";
import CardItem from "./CardItem";

const item = {
  id: "vaso-aurora",
  titulo: "Vaso Aurora",
  imagemUrl: "https://example.com/vaso.jpg",
  link: "/minha-loja/item/ABC12",
};

describe("CardItem", () => {
  it("renderiza titulo e link do item", () => {
    render(
      <MemoryRouter>
        <CardItem item={item} />
      </MemoryRouter>,
    );

    expect(screen.getByRole("link", { name: /vaso aurora/i })).toHaveAttribute(
      "href",
      "/minha-loja/item/ABC12",
    );
    expect(screen.getByRole("heading", { name: /vaso aurora/i })).toBeInTheDocument();
  });

  it("usa a imagem do item como background da card", () => {
    render(
      <MemoryRouter>
        <CardItem item={item} />
      </MemoryRouter>,
    );

    const image = document.querySelector("img");
    expect(image).toHaveAttribute("src", item.imagemUrl);
    expect(image).toHaveAttribute("alt", "");
  });
});
