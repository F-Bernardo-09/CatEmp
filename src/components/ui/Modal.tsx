import type { ReactNode } from "react";

interface ModalProps {
  aberto: boolean;
  titulo: string;
  children: ReactNode;
  onFechar: () => void;
}

function Modal({ aberto, titulo, children, onFechar }: ModalProps) {
  if (!aberto) return null;

  return (
    <dialog open aria-labelledby="modal-titulo">
      <h2 id="modal-titulo">{titulo}</h2>

      <div>{children}</div>

      <button type="button" onClick={onFechar}>
        Fechar
      </button>
    </dialog>
  );
}

export default Modal;
