import { useEffect, useState } from "react";

interface MiniaturaImagemProps {
  arquivo: File;
  alt: string;
}

export function MiniaturaImagem({ arquivo, alt }: MiniaturaImagemProps) {
  const [url, setUrl] = useState("");

  useEffect(() => {
    const urlTemporaria = URL.createObjectURL(arquivo);
    setUrl(urlTemporaria);

    return () => URL.revokeObjectURL(urlTemporaria);
  }, [arquivo]);

  if (!url) return null;

  return (
    <img
      src={url}
      alt={alt}
      className="size-24 shrink-0 rounded-card border border-border object-cover"
    />
  );
}
