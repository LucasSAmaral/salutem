import { prisma } from "@/lib/prisma";

const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;

function timeToMinutes(t: string): number {
  const [h, m] = t.split(":").map(Number);
  return h * 60 + m;
}

function minutesToTime(min: number): string {
  const h = Math.floor(min / 60)
    .toString()
    .padStart(2, "0");
  const m = (min % 60).toString().padStart(2, "0");
  return `${h}:${m}`;
}

/** Combina data + hora "de parede" num Date, tratando o horário local da clínica
 *  como se fosse UTC — mesma convenção usada pro Patient.birthDate, pra não
 *  deslocar o dia/hora dependendo do fuso de quem roda o código. */
export function combineDateAndTime(dateStr: string, time: string): Date {
  return new Date(`${dateStr}T${time}:00.000Z`);
}

/** Extrai "HH:MM" de um Date salvo com a convenção acima. */
export function extractTime(date: Date): string {
  return `${String(date.getUTCHours()).padStart(2, "0")}:${String(date.getUTCMinutes()).padStart(2, "0")}`;
}

/** Calcula os horários livres de um médico num dia, a partir dos turnos
 *  (DoctorSchedule), duração de consulta, ausências e consultas já marcadas.
 *  Não inclui encaixe — isso é uma escolha explícita de quem agenda, fora
 *  da grade normal (ver `isSlotTaken`). */
export async function getAvailableSlots(doctorId: number, dateStr: string): Promise<string[]> {
  if (!DATE_RE.test(dateStr)) return [];

  const doctor = await prisma.doctor.findUnique({ where: { id: doctorId } });
  if (!doctor) return [];

  const dayStart = new Date(`${dateStr}T00:00:00.000Z`);
  const dayEnd = new Date(`${dateStr}T23:59:59.999Z`);
  const dayOfWeek = dayStart.getUTCDay();

  const absence = await prisma.doctorAbsence.findFirst({
    where: { doctorId, startDate: { lte: dayEnd }, endDate: { gte: dayStart } },
  });
  if (absence) return [];

  const schedules = await prisma.doctorSchedule.findMany({ where: { doctorId, dayOfWeek } });
  if (schedules.length === 0) return [];

  const existing = await prisma.appointment.findMany({
    where: { doctorId, date: { gte: dayStart, lte: dayEnd }, status: { not: "CANCELLED" } },
    select: { date: true },
  });
  const bookedTimes = new Set(existing.map((a) => extractTime(a.date)));

  const duration = doctor.consultDuration;
  const slots: string[] = [];

  for (const block of schedules) {
    const start = timeToMinutes(block.startTime);
    const end = timeToMinutes(block.endTime);
    const breakStart = block.breakStart ? timeToMinutes(block.breakStart) : null;
    const breakEnd = block.breakEnd ? timeToMinutes(block.breakEnd) : null;

    for (let t = start; t + duration <= end; t += duration) {
      if (breakStart != null && breakEnd != null && t < breakEnd && t + duration > breakStart) {
        continue;
      }
      const time = minutesToTime(t);
      if (!bookedTimes.has(time)) slots.push(time);
    }
  }

  return slots.sort();
}

/** Verifica se já existe consulta marcada pro médico nesse dia+hora exatos.
 *  Usado pro encaixe, que não passa pela grade de `getAvailableSlots`. */
export async function isSlotTaken(doctorId: number, dateStr: string, time: string): Promise<boolean> {
  const date = combineDateAndTime(dateStr, time);
  const existing = await prisma.appointment.findFirst({
    where: { doctorId, date, status: { not: "CANCELLED" } },
  });
  return !!existing;
}
