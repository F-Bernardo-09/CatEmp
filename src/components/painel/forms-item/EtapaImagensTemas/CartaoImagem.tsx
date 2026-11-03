import { IconeLixeira } from "../../../ui/icones";
import { MiniaturaImagem } from "../MiniaturaImagem";
import type { ImagemItem } from "../types";
import SeletorTema from "./SeletorTema";

interface CartaoImagemProps {
  imagem: ImagemItem;
  indice: number;
  total: number;
  temasDisponiveis: string[];
  editandoTema: boolean;
  onAbrirEditor: () => void;
  onFecharEditor: () => void;
  onSelecionarTema: (tema: string) => void;
  onAtualizarTextoAlternativo: (texto: string) => void;
  onDefinirPrincipal: () => void;
  onMover: (deslocamento: -1 | 1) => void;
  /** Retorna `true` quando o tema foi criado e aplicado à imagem. */
  onCriarTema: (nome: string) => boolean;
  onRemover: () => void;
}

function CartaoImagem({
  imagem,
  indice,
  total,
  temasDisponiveis,
  editandoTema,
  onAbrirEditor,
  onFecharEditor,
  onSelecionarTema,
  onCriarTema,
  onAtualizarTextoAlternativo,
  onDefinirPrincipal,
  onMover,
  onRemover,
}: CartaoImagemProps) {
  return (
    <li className="flex flex-col gap-4 rounded-card border border-border bg-card p-4 sm:flex-row">
      <MiniaturaImagem
        arquivo={imagem.arquivo}
        alt={`Pré-visualização de ${imagem.arquivo.name}`}
      />

      <div className="flex min-w-0 flex-1 flex-col gap-3">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="truncate text-sm font-medium text-text">
              {imagem.arquivo.name}
            </p>
            {imagem.principal && (
              <span className="text-xs font-semibold text-primary">
                Foto principal
              </span>
            )}
          </div>
          <button
            type="button"
            aria-label={`Remover ${imagem.arquivo.name}`}
            onClick={onRemover}
            className="-m-1.5 shrink-0 rounded-full p-1.5 text-text-secondary transition-colors hover:bg-surface hover:text-text"
          >
            <IconeLixeira className="size-5" />
          </button>
        </div>

        <label className="form-field">
          <span className="form-label">Texto alternativo</span>
          <input
            type="text"
            className="form-control"
            value={imagem.textoAlternativo}
            onChange={(event) => onAtualizarTextoAlternativo(event.target.value)}
            maxLength={255}
            pattern={String.raw`.*\S.*`}
            placeholder="Descreva a imagem"
            title="Informe um texto alternativo que não contenha apenas espaços."
            required
          />
        </label>

        <SeletorTema
          imagem={imagem}
          temasDisponiveis={temasDisponiveis}
          aberto={editandoTema}
          onAbrir={onAbrirEditor}
          onFechar={onFecharEditor}
          onSelecionar={onSelecionarTema}
          onCriar={onCriarTema}
        />

        <div className="flex flex-wrap gap-3">
          <button
            type="button"
            disabled={indice === 0}
            onClick={() => onMover(-1)}
            className="text-sm font-medium text-text underline disabled:cursor-not-allowed disabled:opacity-50"
          >
            Mover para cima
          </button>
          <button
            type="button"
            disabled={indice === total - 1}
            onClick={() => onMover(1)}
            className="text-sm font-medium text-text underline disabled:cursor-not-allowed disabled:opacity-50"
          >
            Mover para baixo
          </button>
          {!imagem.principal && (
            <button
              type="button"
              onClick={onDefinirPrincipal}
              className="text-sm font-medium text-text underline"
            >
              Definir como principal
            </button>
          )}
        </div>
      </div>
    </li>
  );
}

export default CartaoImagem;
