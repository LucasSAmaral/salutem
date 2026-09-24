/** Formata uma data de nascimento (armazenada como meia-noite UTC) para DD/MM/AAAA,
 *  usando o fuso UTC pra não deslocar o dia dependendo do fuso do navegador. */
export function formatDateBR(date: Date): string {
  return new Intl.DateTimeFormat("pt-BR", { timeZone: "UTC" }).format(date);
}

/** Converte uma data armazenada pro valor esperado por <input type="date"> (AAAA-MM-DD). */
export function toDateInputValue(date: Date): string {
  return date.toISOString().slice(0, 10);
}

/** Idade em anos completos a partir da data de nascimento (UTC, mesma
 *  convenção de birthDate — comparada contra o "hoje" UTC do servidor). */
export function calculateAge(birthDate: Date, now: Date = new Date()): number {
  const years = now.getUTCFullYear() - birthDate.getUTCFullYear();
  const hadBirthdayThisYear =
    now.getUTCMonth() > birthDate.getUTCMonth() ||
    (now.getUTCMonth() === birthDate.getUTCMonth() && now.getUTCDate() >= birthDate.getUTCDate());
  return hadBirthdayThisYear ? years : years - 1;
}

/** "11 mar 2026" — usado no histórico de consultas do Prontuário. UTC pela
 *  mesma razão de formatDateBR: Appointment.date guarda hora de parede como UTC. */
export function formatDateShortBR(date: Date): string {
  const parts = new Intl.DateTimeFormat("pt-BR", {
    timeZone: "UTC",
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).formatToParts(date);
  const get = (type: string) => parts.find((p) => p.type === type)?.value ?? "";
  return `${get("day")} ${get("month").replace(".", "")} ${get("year")}`;
}
