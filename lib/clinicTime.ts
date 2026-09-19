/** Fuso das clínicas. O schema ainda não tem fuso por clínica (Clinic não guarda
 *  timezone) — todas as clínicas atendidas hoje ficam no Brasil (Brasília). */
const CLINIC_TIMEZONE = "America/Sao_Paulo";

/** Data de "hoje" na clínica, formato "YYYY-MM-DD". O servidor roda em UTC
 *  (Vercel), então `new Date()` sozinho viraria o dia seguinte depois das 21h. */
export function todayInClinic(now: Date = new Date()): string {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: CLINIC_TIMEZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(now);
}

/** "hoje, 19 de setembro" — pra cabeçalhos. Calculado no servidor: o fuso do
 *  navegador pode diferir do da clínica e causar divergência de hidratação. */
export function todayLabelInClinic(now: Date = new Date()): string {
  const label = new Intl.DateTimeFormat("pt-BR", {
    timeZone: CLINIC_TIMEZONE,
    day: "numeric",
    month: "long",
  }).format(now);
  return `hoje, ${label}`;
}

/** Intervalo [início, fim] do dia na convenção "hora de parede tratada como UTC"
 *  usada em `Appointment.date` (ver `combineDateAndTime` em lib/availability.ts). */
export function dayRange(dateStr: string): { start: Date; end: Date } {
  return {
    start: new Date(`${dateStr}T00:00:00.000Z`),
    end: new Date(`${dateStr}T23:59:59.999Z`),
  };
}
