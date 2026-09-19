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

  // Itens já ordenados por médico e posição: o último "pendente" de cada médico vence.
  const lastPresentIdByDoctor = new Map<number, number>();
  for (const item of items) {
    const status = STATUS_MAP[item.appointment.status];
    if (status === "AGUARDANDO" || status === "EM_ATENDIMENTO") {
      lastPresentIdByDoctor.set(item.appointment.doctorId, item.id);
    }
  }

  return items.flatMap((item): QueueEntry[] => {
    const { appointment } = item;
    const status = STATUS_MAP[appointment.status];
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
        isLastPresent: lastPresentIdByDoctor.get(appointment.doctorId) === item.id,
      },
    ];
  });
}
