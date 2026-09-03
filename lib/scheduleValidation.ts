import { prisma } from "@/lib/prisma";

const TIME_RE = /^([01]\d|2[0-3]):[0-5]\d$/;

export type ScheduleInput = {
  dayOfWeek: number;
  startTime: string;
  endTime: string;
  breakStart?: string | null;
  breakEnd?: string | null;
};

/** Valida formato e coerência dos campos. Retorna mensagem de erro ou null se ok. */
export function validateScheduleInput(input: ScheduleInput): string | null {
  if (
    typeof input.dayOfWeek !== "number" ||
    !Number.isInteger(input.dayOfWeek) ||
    input.dayOfWeek < 0 ||
    input.dayOfWeek > 6
  ) {
    return "dayOfWeek deve ser um inteiro entre 0 (domingo) e 6 (sábado)";
  }

  if (!TIME_RE.test(input.startTime) || !TIME_RE.test(input.endTime)) {
    return "startTime e endTime devem estar no formato HH:MM";
  }
  if (input.startTime >= input.endTime) {
    return "startTime deve ser anterior a endTime";
  }

  const hasBreakStart = input.breakStart != null && input.breakStart !== "";
  const hasBreakEnd = input.breakEnd != null && input.breakEnd !== "";
  if (hasBreakStart !== hasBreakEnd) {
    return "breakStart e breakEnd devem ser informados juntos";
  }
  if (hasBreakStart && hasBreakEnd) {
    if (!TIME_RE.test(input.breakStart!) || !TIME_RE.test(input.breakEnd!)) {
      return "breakStart e breakEnd devem estar no formato HH:MM";
    }
    if (input.breakStart! >= input.breakEnd!) {
      return "breakStart deve ser anterior a breakEnd";
    }
    if (input.breakStart! < input.startTime || input.breakEnd! > input.endTime) {
      return "o intervalo de pausa deve estar dentro do turno (startTime–endTime)";
    }
  }

  return null;
}

/** Verifica se o novo bloco sobrepõe algum bloco já existente do mesmo médico no mesmo dia.
 *  `excludeId` permite ignorar o próprio registro em edições. */
export async function hasOverlap(
  doctorId: number,
  input: ScheduleInput,
  excludeId?: number
): Promise<boolean> {
  const sameDay = await prisma.doctorSchedule.findMany({
    where: {
      doctorId,
      dayOfWeek: input.dayOfWeek,
      ...(excludeId ? { id: { not: excludeId } } : {}),
    },
  });

  return sameDay.some(
    (block) => input.startTime < block.endTime && block.startTime < input.endTime
  );
}
