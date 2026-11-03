const TIPOS_IMAGEM_ACEITOS: ReadonlySet<string> = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
]);

export const ACCEPT_IMAGENS =
  ".jpg,.jpeg,.png,.webp,image/jpeg,image/png,image/webp";

export function separarImagensPorTipo(arquivos: File[]) {
  const validas: File[] = [];
  const invalidas: string[] = [];

  for (const arquivo of arquivos) {
    if (TIPOS_IMAGEM_ACEITOS.has(arquivo.type)) {
      validas.push(arquivo);
    } else {
      invalidas.push(arquivo.name);
    }
  }

  return { validas, invalidas };
}

export function mensagemFormatoInvalido(nomes: string[]) {
  if (nomes.length === 0) return "";
  return `Formato não aceito: ${nomes.join(", ")}. Use JPEG, PNG ou WebP.`;
}
