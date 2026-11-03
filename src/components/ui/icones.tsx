import type { ReactNode } from "react";

interface IconeProps {
  className?: string;
}

function IconeBase({
  className = "size-4",
  children,
}: IconeProps & { children: ReactNode }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.75}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      className={className}
    >
      {children}
    </svg>
  );
}

export const IconeUpload = ({ className }: IconeProps) => (
  <IconeBase className={className}>
    <path d="M12 16V4m0 0L7.5 8.5M12 4l4.5 4.5" />
    <path d="M4 15v3a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-3" />
  </IconeBase>
);

export const IconeTag = ({ className }: IconeProps) => (
  <IconeBase className={className}>
    <path d="M3 12V4a1 1 0 0 1 1-1h8l9 9-9 9-9-9Z" />
    <circle cx="7.5" cy="7.5" r="1" fill="currentColor" stroke="none" />
  </IconeBase>
);

export const IconeMais = ({ className }: IconeProps) => (
  <IconeBase className={className}>
    <path d="M12 5v14M5 12h14" />
  </IconeBase>
);

export const IconeCheck = ({ className }: IconeProps) => (
  <IconeBase className={className}>
    <path d="m5 12.5 4.5 4.5L19 7.5" />
  </IconeBase>
);

export const IconeLixeira = ({ className }: IconeProps) => (
  <IconeBase className={className}>
    <path d="M4 7h16M10 11v6M14 11v6" />
    <path d="M6 7l1 12a2 2 0 0 0 2 2h6a2 2 0 0 0 2-2l1-12M9 7V4h6v3" />
  </IconeBase>
);
