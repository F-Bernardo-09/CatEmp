import { IconeLixeira } from "../../../ui/icones";
import { MiniaturaImagem } from "../MiniaturaImagem";
import type { ImagemItem } from "../types";
import SeletorTema from "./SeletorTema";

interface CartaoImagemProps {
  imagem: ImagemItem;
  temasDisponiveis: string[];
  editandoTema: boolean;
  onAbrirEditor: () => void;
  onFecharEditor: () => void;
  onSelecionarTema: (tema: string) => void;
  /** Retorna `true` quando o tema foi criado e aplicado à imagem. */
  onCriarTema: (nome: string) => boolean;
  onRemover: () => void;
}

function CartaoImagem({
  imagem,
  temasDisponiveis,
  editandoTema,
  onAbrirEditor,
  onFecharEditor,
  onSelecionarTema,
  onCriarTema,
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
          <p className="truncate text-sm font-medium text-text">
            {imagem.arquivo.name}
          </p>
          <button
            type="button"
            aria-label={`Remover ${imagem.arquivo.name}`}
            onClick={onRemover}
            className="-m-1.5 shrink-0 rounded-full p-1.5 text-text-secondary transition-colors hover:bg-surface hover:text-text"
          >
            <IconeLixeira className="size-5" />
          </button>
        </div>

        <SeletorTema
          imagem={imagem}
          temasDisponiveis={temasDisponiveis}
          aberto={editandoTema}
          onAbrir={onAbrirEditor}
          onFechar={onFecharEditor}
          onSelecionar={onSelecionarTema}
          onCriar={onCriarTema}
        />
      </div>
    </li>
  );
}

export default CartaoImagem;
