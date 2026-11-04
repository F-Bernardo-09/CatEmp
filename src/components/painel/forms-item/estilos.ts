type CampoValidavel =
  | HTMLInputElement
  | HTMLSelectElement
  | HTMLTextAreaElement;

export function obterMensagemValidacao(
  campo: CampoValidavel,
  nomeCampo: string,
): string {
  const { validity } = campo;

  if (validity.customError) {
    return campo.validationMessage;
  }

  if (validity.valueMissing) {
    return `Informe ${nomeCampo}.`;
  }

  if (validity.tooLong && "maxLength" in campo) {
    return `${nomeCampo} deve ter no máximo ${campo.maxLength} caracteres.`;
  }

  if (validity.patternMismatch) {
    return campo.title || `Verifique o formato de ${nomeCampo}.`;
  }

  if (validity.rangeUnderflow) {
    return `${nomeCampo} não pode ser negativo.`;
  }

  if (validity.stepMismatch) {
    return `${nomeCampo} deve ter no máximo duas casas decimais.`;
  }

  return `Verifique ${nomeCampo}.`;
}
