import { useEffect, useState } from "react";
import { Link, useParams } from "react-router";

import CabecalhoPublico from "../../components/layout/CabecalhoPublico";
import Rodape from "../../components/layout/Rodape";
import type { ItemPublico } from "../../schemas/item";
import { buscarItemPublico } from "../../services/catalogo";

function formatarPreco(valor: number): string {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(valor);
}

function DetalheItem() {
  const { id } = useParams<{ id: string }>();
  const [item, setItem] = useState<ItemPublico | null>(null);
  const [fotoAtiva, setFotoAtiva] = useState(0);
  const [carregando, setCarregando] = useState(true);
  const [naoEncontrado, setNaoEncontrado] = useState(false);
  const [erro, setErro] = useState("");

  useEffect(() => {
    if (!id) return;

    setCarregando(true);
    setNaoEncontrado(false);
    setErro("");
    setFotoAtiva(0);

    async function carregar() {
      try {
        const itemEncontrado = await buscarItemPublico(id!);

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
  }, [id]);

  if (carregando) {
    return (
      <div className="flex min-h-screen flex-col bg-page text-text">
        <CabecalhoPublico />
        <main className="mx-auto flex w-full max-w-6xl flex-1 px-4 py-8">
          <p className="text-sm text-text-secondary">Carregando item...</p>
        </main>
        <Rodape />
      </div>
    );
  }

  if (naoEncontrado) {
    return (
      <div className="flex min-h-screen flex-col bg-page text-text">
        <CabecalhoPublico />
        <main className="mx-auto flex w-full max-w-6xl flex-1 flex-col items-center justify-center px-4 py-16 text-center">
          <p className="text-text-secondary">Item não encontrado.</p>
          <Link
            to="/buscar"
            className="mt-4 rounded-button bg-primary px-5 py-3 text-sm font-semibold text-text-inverse transition-colors hover:bg-primary-hover"
          >
            Voltar ao catálogo
          </Link>
        </main>
        <Rodape />
      </div>
    );
  }

  if (erro) {
    return (
      <div className="flex min-h-screen flex-col bg-page text-text">
        <CabecalhoPublico />
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
      <CabecalhoPublico />

      <main className="mx-auto flex w-full max-w-6xl flex-1 flex-col gap-8 px-4 py-8">
        {/* Breadcrumb */}
        <nav aria-label="Caminho" className="flex items-center gap-2 text-sm text-text-secondary">
          <Link to="/buscar" className="hover:text-text">
            Catálogo
          </Link>
          <span aria-hidden="true">/</span>
          <Link to={`/loja/${item?.loja_slug}`} className="hover:text-text">
            {item?.loja_nome}
          </Link>
          <span aria-hidden="true">/</span>
          <span className="text-text">{item?.titulo}</span>
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
                <span className="rounded-full border border-border bg-card px-2 py-1 text-[10px] uppercase tracking-[0.08em] text-text-secondary">
                  {item?.modalidade}
                </span>
                {item?.tipo && (
                  <span className="rounded-full border border-border bg-card px-2 py-1 text-[10px] uppercase tracking-[0.08em] text-text-secondary">
                    {item.tipo}
                  </span>
                )}
              </div>
              <h1 className="mt-2 text-3xl font-bold text-text">{item?.titulo}</h1>
              <p className="mt-1 text-2xl font-semibold text-primary">
                {item ? formatarPreco(item.preco_base) : ""}
              </p>
            </div>

            {item?.descricao && (
              <p className="text-sm leading-relaxed text-text-secondary">{item.descricao}</p>
            )}

            {/* Dimensões */}
            <div className="rounded-card border border-border bg-card p-4">
              <h2 className="mb-3 text-sm font-semibold text-text">Dimensões</h2>
              <dl className="grid grid-cols-3 gap-3 text-center text-sm">
                <div>
                  <dt className="text-text-secondary">Altura</dt>
                  <dd className="mt-1 font-medium text-text">{item?.altura} cm</dd>
                </div>
                <div>
                  <dt className="text-text-secondary">Largura</dt>
                  <dd className="mt-1 font-medium text-text">{item?.largura} cm</dd>
                </div>
                <div>
                  <dt className="text-text-secondary">Profund.</dt>
                  <dd className="mt-1 font-medium text-text">{item?.profundidade} cm</dd>
                </div>
              </dl>
            </div>

            {/* Categorias */}
            {item && item.categorias.length > 0 && (
              <div>
                <h2 className="mb-2 text-sm font-semibold text-text">Categorias</h2>
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

            {/* Loja */}
            <div className="rounded-card border border-border bg-card p-4">
              <p className="text-xs text-text-secondary">Oferecido por</p>
              <Link
                to={`/loja/${item?.loja_slug}`}
                className="mt-1 block text-base font-semibold text-text hover:text-primary"
              >
                {item?.loja_nome}
              </Link>
            </div>

            {/* Contato via WhatsApp */}
            {item?.loja_whatsapp && (
              <a
                href={`https://wa.me/${item.loja_whatsapp}?text=${encodeURIComponent(`Olá! Tenho interesse no item *${item.titulo}* (cód. ${item.codigo_publico}). Poderia me dar mais informações?`)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="rounded-button bg-primary px-6 py-3 text-center text-sm font-semibold text-text-inverse transition-colors hover:bg-primary-hover"
              >
                Entrar em contato via WhatsApp
              </a>
            )}
          </section>
        </div>
      </main>

      <Rodape />
    </div>
  );
}

export default DetalheItem;
