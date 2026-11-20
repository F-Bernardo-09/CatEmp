import { useEffect, useState } from "react";
import { Link, useParams } from "react-router";

import CabecalhoLoja from "../../components/layout/CabecalhoLoja";
import Rodape from "../../components/layout/Rodape";
import type { ItemPublico } from "../../schemas/item";
import type { Loja } from "../../schemas/loja";
import { buscarLojaPorSlug } from "../../services/lojas";
import { buscarItemPublicoPorCodigoOuId } from "../../services/catalogo";

function formatarPreco(valor: number): string {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(valor);
}

function DetalheItem() {
  const { slug, codigo } = useParams<{ slug: string; codigo: string }>();
  const [loja, setLoja] = useState<Loja | null>(null);
  const [item, setItem] = useState<ItemPublico | null>(null);
  const [fotoAtiva, setFotoAtiva] = useState(0);
  const [carregando, setCarregando] = useState(true);
  const [naoEncontrado, setNaoEncontrado] = useState(false);
  const [erro, setErro] = useState("");

  useEffect(() => {
    if (!slug || !codigo) return;

    setCarregando(true);
    setNaoEncontrado(false);
    setErro("");
    setFotoAtiva(0);

    async function carregar() {
      try {
        const lojaEncontrada = await buscarLojaPorSlug(slug!);
        if (!lojaEncontrada || lojaEncontrada.situacao !== "ativa") {
          setNaoEncontrado(true);
          return;
        }
        setLoja(lojaEncontrada);

        const itemEncontrado = await buscarItemPublicoPorCodigoOuId(codigo!, lojaEncontrada.id);

        if (!itemEncontrado) {
          setNaoEncontrado(true);
          return;
        }

        setItem(itemEncontrado);
      } catch (erroCarregamento) {
        console.error("Erro ao carregar item:", erroCarregamento);
        setErro(
          erroCarregamento instanceof Error
            ? erroCarregamento.message
            : "Não foi possível carregar o item.",
        );
      } finally {
        setCarregando(false);
      }
    }

    void carregar();
  }, [slug, codigo]);

  if (carregando) {
    return (
      <div className="flex min-h-screen flex-col bg-page text-text">
        <main className="mx-auto flex w-full max-w-6xl flex-1 items-center justify-center px-4 py-8">
          <p className="text-sm text-text-secondary">Carregando item...</p>
        </main>
        <Rodape />
      </div>
    );
  }

  if (naoEncontrado || !loja) {
    return (
      <div className="flex min-h-screen flex-col bg-page text-text">
        <main className="mx-auto flex w-full max-w-6xl flex-1 flex-col items-center justify-center px-4 py-16 text-center">
          <h1 className="text-2xl font-bold text-text">Item não encontrado</h1>
          <p className="mt-2 text-text-secondary">
            O item que você busca não está disponível nesta loja.
          </p>
          <Link
            to={`/${slug}`}
            className="mt-6 rounded-button bg-primary px-5 py-3 text-sm font-semibold text-text-inverse transition-colors hover:bg-primary-hover"
          >
            Voltar à loja
          </Link>
        </main>
        <Rodape />
      </div>
    );
  }

  if (erro) {
    return (
      <div className="flex min-h-screen flex-col bg-page text-text">
        <main className="mx-auto flex w-full max-w-6xl flex-1 px-4 py-8">
          <p role="alert" className="rounded border border-red-200 bg-red-50 p-3 text-sm text-red-700">
            {erro}
          </p>
        </main>
        <Rodape />
      </div>
    );
  }

  const fotoExibida = item?.fotos[fotoAtiva];

  return (
    <div className="flex min-h-screen flex-col bg-page text-text">
      <CabecalhoLoja loja={loja} />

      <main className="mx-auto flex w-full max-w-6xl flex-1 flex-col gap-8 px-4 py-8">
        {/* Breadcrumb contextualizado estritamente dentro da loja */}
        <nav aria-label="Caminho" className="flex items-center gap-2 text-sm text-text-secondary">
          <Link to={`/${loja.slug}`} className="hover:text-primary">
            {loja.nome_comercial}
          </Link>
          <span aria-hidden="true">/</span>
          <Link to={`/${loja.slug}/buscar`} className="hover:text-primary">
            Catálogo
          </Link>
          <span aria-hidden="true">/</span>
          <span className="text-text font-medium">{item?.titulo}</span>
        </nav>

        <div className="grid gap-8 lg:grid-cols-[1fr_1.1fr]">
          {/* Galeria de fotos */}
          <section aria-label="Fotos do item">
            <div className="overflow-hidden rounded-card border border-border bg-surface">
              {fotoExibida ? (
                <img
                  src={fotoExibida.url}
                  alt={fotoExibida.texto_alternativo || item?.titulo}
                  className="h-full max-h-96 w-full object-cover"
                />
              ) : (
                <div className="flex h-64 items-center justify-center text-sm text-text-secondary">
                  Sem imagem
                </div>
              )}
            </div>

            {item && item.fotos.length > 1 && (
              <div className="mt-3 flex gap-2 overflow-x-auto pb-1">
                {item.fotos.map((foto, index) => (
                  <button
                    key={index}
                    type="button"
                    onClick={() => setFotoAtiva(index)}
                    className={[
                      "size-16 shrink-0 overflow-hidden rounded border-2 transition-colors",
                      fotoAtiva === index ? "border-primary" : "border-border hover:border-text-secondary",
                    ].join(" ")}
                    aria-label={`Ver foto ${index + 1}`}
                    aria-pressed={fotoAtiva === index}
                  >
                    <img
                      src={foto.url}
                      alt={foto.texto_alternativo}
                      className="h-full w-full object-cover"
                    />
                  </button>
                ))}
              </div>
            )}
          </section>

          {/* Informações do item */}
          <section className="flex flex-col gap-6">
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <span className="rounded-full border border-border bg-card px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wider text-primary">
                  {item?.modalidade}
                </span>
                {item?.tipo && (
                  <span className="rounded-full border border-border bg-card px-2.5 py-1 text-[11px] font-medium uppercase tracking-wider text-text-secondary">
                    {item.tipo}
                  </span>
                )}
              </div>
              <h1 className="mt-2 text-3xl font-bold text-text">{item?.titulo}</h1>
              {item && (
                <p className="mt-1 text-2xl font-bold text-primary">
                  <span className="block text-sm font-medium">
                    {item.tipo === "servico" ? "Preço mínimo" : "Preço fixo"}
                  </span>
                  {item.tipo === "servico" && "A partir de "}
                  {formatarPreco(item.preco_base)}
                </p>
              )}
            </div>

            {item?.descricao && (
              <p className="text-sm leading-relaxed text-text-secondary whitespace-pre-line">
                {item.descricao}
              </p>
            )}

            {/* Categorias */}
            {item && item.categorias.length > 0 && (
              <div>
                <h2 className="mb-2 text-sm font-semibold text-text">Tags</h2>
                <div className="flex flex-wrap gap-2">
                  {item.categorias.map((cat) => (
                    <span
                      key={cat}
                      className="rounded-full border border-border bg-card px-3 py-1 text-xs text-text-secondary"
                    >
                      {cat}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Contato via WhatsApp direto da loja */}
            {loja.whatsapp && (
              <div className="mt-2 flex flex-col gap-2">
                <a
                  href={`https://wa.me/${loja.whatsapp}?text=${encodeURIComponent(`Olá! Vim pela loja ${loja.nome_comercial} no CATEMP e gostaria de informações sobre o item *${item?.titulo}* (cód. ${item?.codigo_publico}).`)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="rounded-button bg-primary px-6 py-3.5 text-center text-sm font-semibold text-text-inverse transition-colors hover:bg-primary-hover shadow-sm"
                >
                  Solicitar informações via WhatsApp
                </a>
                <p className="text-center text-xs text-text-secondary">
                  A negociação, disponibilidade e confirmação são tratadas diretamente com {loja.nome_comercial}.
                </p>
              </div>
            )}
          </section>
        </div>
      </main>

      <Rodape />
    </div>
  );
}

export default DetalheItem;
