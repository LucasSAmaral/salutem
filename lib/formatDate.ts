/** Formata uma data de nascimento (armazenada como meia-noite UTC) para DD/MM/AAAA,
 *  usando o fuso UTC pra não deslocar o dia dependendo do fuso do navegador. */
export function formatDateBR(date: Date): string {
  return new Intl.DateTimeFormat("pt-BR", { timeZone: "UTC" }).format(date);
}

/** Converte uma data armazenada pro valor esperado por <input type="date"> (AAAA-MM-DD). */
export function toDateInputValue(date: Date): string {
  return date.toISOString().slice(0, 10);
}
