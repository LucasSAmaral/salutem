import type { AppointmentStatus } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { extractTime } from "@/lib/availability";
import { dayRange } from "@/lib/clinicTime";

export type QueueStatus = "AGUARDANDO" | "EM_ATENDIMENTO" | "ATENDIDO";

/** Linha da fila como o client recebe. Só datas já serializadas (string/HH:MM)
 *  e só o mínimo do paciente (nome) — a fila não expõe dado clínico. */
export type QueueEntry = {
  id: number;
  position: number;
  status: QueueStatus;
  arrivedAt: string;
  appointmentId: number;
  scheduledTime: string;
  isWalkIn: boolean;
  patient: { id: number; name: string };
  doctor: { id: number; name: string };
  /** Última consulta marcada do dia desse médico (pode nem ter chegado ainda). */
  isLastScheduled: boolean;
  /** Último paciente presente que ainda falta atender. Pode ser diferente do
   *  último agendado quando este não apareceu. */
  isLastPresent: boolean;
};

/** Consulta de hoje que ainda não teve a chegada confirmada (status SCHEDULED). */
export type ExpectedArrival = {
  appointmentId: number;
  scheduledTime: string;
  isWalkIn: boolean;
  patient: { id: number; name: string };
  doctor: { id: number; name: string };
};

/** A fila num instante. `asOf` deixa o client descartar uma resposta velha que
 *  chega depois de uma mais nova, sem precisar de estado mutável. */
export type QueueSnapshot = {
  asOf: string;
  entries: QueueEntry[];
  /** Só vem preenchido pra quem confirma chegada (atendente). */
  expected: ExpectedArrival[];
};

const STATUS_MAP: Partial<Record<AppointmentStatus, QueueStatus>> = {
  CONFIRMED: "AGUARDANDO",
  IN_PROGRESS: "EM_ATENDIMENTO",
  DONE: "ATENDIDO",
};

/** Fila do dia de uma clínica, agrupável por médico (`position` é por médico).
 *  Sempre escopada por `clinicId`. */
export async function getQueue(
  clinicId: number,
  dateStr: string,
  doctorId?: number
): Promise<QueueEntry[]> {
  const { start, end } = dayRange(dateStr);
  const doctorFilter = doctorId ? { doctorId } : {};

  const [items, lastScheduled] = await Promise.all([
    prisma.queueItem.findMany({
      where: {
        clinicId,
        appointment: { clinicId, date: { gte: start, lte: end }, ...doctorFilter },
      },
      include: {
        appointment: {
          include: {
            patient: { select: { id: true, name: true } },
            doctor: { include: { user: { select: { name: true } } } },
          },
        },
      },
      orderBy: [{ appointment: { doctorId: "asc" } }, { position: "asc" }, { id: "asc" }],
    }),
    prisma.appointment.groupBy({
      by: ["doctorId"],
      where: { clinicId, date: { gte: start, lte: end }, status: { not: "CANCELLED" }, ...doctorFilter },
      _max: { date: true },
    }),
  ]);

  const lastScheduledByDoctor = new Map(lastScheduled.map((g) => [g.doctorId, g._max.date?.getTime()]));

  const statusOf = (item: (typeof items)[number]): QueueStatus | undefined =>
    STATUS_MAP[item.appointment.status];
  const isPending = (item: (typeof items)[number]): boolean =>
    statusOf(item) === "AGUARDANDO" || statusOf(item) === "EM_ATENDIMENTO";
  // `items` já vem ordenado por médico e posição: o último pendente é o último presente.
  const lastPendingId = (id: number): number | undefined =>
    items.filter((item) => item.appointment.doctorId === id && isPending(item)).at(-1)?.id;

  return items.flatMap((item): QueueEntry[] => {
    const { appointment } = item;
    const status = statusOf(item);
    if (!status) return []; // ex.: consulta cancelada depois de entrar na fila

    return [
      {
        id: item.id,
        position: item.position,
        status,
        arrivedAt: item.arrivedAt.toISOString(),
        appointmentId: appointment.id,
        scheduledTime: extractTime(appointment.date),
        isWalkIn: appointment.isWalkIn,
        patient: appointment.patient,
        doctor: { id: appointment.doctorId, name: appointment.doctor.user.name },
        isLastScheduled: lastScheduledByDoctor.get(appointment.doctorId) === appointment.date.getTime(),
        isLastPresent: lastPendingId(appointment.doctorId) === item.id,
      },
    ];
  });
}

/** Consultas do dia ainda aguardando a chegada do paciente, por horário.
 *  Sempre escopada por `clinicId`. */
export async function getExpectedArrivals(
  clinicId: number,
  dateStr: string,
  doctorId?: number
): Promise<ExpectedArrival[]> {
  const { start, end } = dayRange(dateStr);

  const appointments = await prisma.appointment.findMany({
    where: {
      clinicId,
      status: "SCHEDULED",
      date: { gte: start, lte: end },
      ...(doctorId ? { doctorId } : {}),
    },
    include: {
      patient: { select: { id: true, name: true } },
      doctor: { include: { user: { select: { name: true } } } },
    },
    orderBy: [{ date: "asc" }, { id: "asc" }],
  });

  return appointments.map((appointment) => ({
    appointmentId: appointment.id,
    scheduledTime: extractTime(appointment.date),
    isWalkIn: appointment.isWalkIn,
    patient: appointment.patient,
    doctor: { id: appointment.doctorId, name: appointment.doctor.user.name },
  }));
}

/** Fila + chegadas esperadas de uma vez, com o instante da leitura. O `asOf` é
 *  tirado antes das consultas: no pior caso o snapshot parece um pouco mais
 *  velho do que é, nunca mais novo. */
export async function getQueueSnapshot(
  clinicId: number,
  dateStr: string,
  options: { doctorId?: number; withExpected: boolean }
): Promise<QueueSnapshot> {
  const asOf = new Date().toISOString();
  const [entries, expected] = await Promise.all([
    getQueue(clinicId, dateStr, options.doctorId),
    options.withExpected ? getExpectedArrivals(clinicId, dateStr, options.doctorId) : [],
  ]);
  return { asOf, entries, expected };
}
