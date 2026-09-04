import { onlyDigits } from "@/lib/cpf";

/** Formata um telefone (completo ou parcial) como (XX) XXXXX-XXXX,
 *  ou (XX) XXXX-XXXX enquanto o nono dígito não foi digitado ainda. */
export function formatPhone(value: string): string {
  const d = onlyDigits(value).slice(0, 11);
  if (d.length <= 10) {
    return d.replace(/(\d{2})(\d)/, "($1) $2").replace(/(\d{4})(\d)/, "$1-$2");
  }
  return d.replace(/(\d{2})(\d)/, "($1) $2").replace(/(\d{5})(\d)/, "$1-$2");
}
