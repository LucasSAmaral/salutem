export function onlyDigits(value: string): string {
  return value.replace(/\D/g, "");
}

/** Formata um CPF (completo ou parcial) para o padrão XXX.XXX.XXX-XX,
 *  usado tanto pra máscara de digitação quanto pra normalizar antes de salvar. */
export function formatCPF(value: string): string {
  return onlyDigits(value)
    .slice(0, 11)
    .replace(/(\d{3})(\d)/, "$1.$2")
    .replace(/(\d{3})(\d)/, "$1.$2")
    .replace(/(\d{3})(\d{1,2})$/, "$1-$2");
}

/** Valida formato (11 dígitos) e dígitos verificadores de um CPF. */
export function isValidCPF(value: string): boolean {
  const d = onlyDigits(value);
  if (d.length !== 11) return false;
  if (/^(\d)\1{10}$/.test(d)) return false; // ex: 111.111.111-11

  const checkDigit = (len: number) => {
    let sum = 0;
    for (let i = 0; i < len; i++) sum += Number(d[i]) * (len + 1 - i);
    const remainder = (sum * 10) % 11;
    return remainder === 10 ? 0 : remainder;
  };

  return checkDigit(9) === Number(d[9]) && checkDigit(10) === Number(d[10]);
}
