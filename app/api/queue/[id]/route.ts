import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getCurrentDoctor } from "@/lib/currentDoctor";
import { dayRange } from "@/lib/clinicTime";
import { notifyQueueChanged } from "@/lib/queueRealtime";

const ALLOWED_ROLES = ["DOCTOR", "ATTENDANT"];

/** Chamar (AGUARDANDO → EM_ATENDIMENTO) e finalizar (→ ATENDIDO) um item da fila.
 *  DOCTOR só mexe nos próprios pacientes; ATTENDANT em qualquer um da clínica. */
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
  if (!ALLOWED_ROLES.includes(session.user.role)) {
    return NextResponse.json({ error: "Sem permissão" }, { status: 403 });
  }

  const { action } = await req.json();
  if (action !== "call" && action !== "finish") {
    return NextResponse.json({ error: "Ação inválida" }, { status: 400 });
  }

  const { id: idParam } = await params;
  const id = Number(idParam);
  const clinicId = session.user.clinicId;
  const item = Number.isInteger(id)
    ? await prisma.queueItem.findFirst({ where: { id, clinicId }, include: { appointment: true } })
    : null;

  let allowed = !!item;
  if (item && session.user.role === "DOCTOR") {
    const doctor = await getCurrentDoctor(session);
    allowed = !!doctor && item.appointment.doctorId === doctor.id;
  }
  // 404 também pra "não é seu paciente": não confirma que o item existe.
  if (!item || !allowed) {
    return NextResponse.json({ error: "Item da fila não encontrado" }, { status: 404 });
  }

  const { doctorId, date } = item.appointment;

  if (action === "call") {
    const day = dayRange(date.toISOString().slice(0, 10));
    const inProgress = await prisma.appointment.findFirst({
      where: { clinicId, doctorId, status: "IN_PROGRESS", date: { gte: day.start, lte: day.end } },
    });
    if (inProgress) {
      return NextResponse.json(
        { error: "Finalize o atendimento em andamento antes de chamar o próximo" },
        { status: 409 }
      );
    }
  }

  const [from, to] = action === "call" ? (["CONFIRMED", "IN_PROGRESS"] as const) : (["IN_PROGRESS", "DONE"] as const);
  // Condicionado ao status atual: dois cliques/telas simultâneas não pulam etapa.
  const updated = await prisma.appointment.updateMany({
    where: { id: item.appointmentId, clinicId, status: from },
    data: { status: to },
  });
  if (updated.count === 0) {
    return NextResponse.json(
      { error: "O status desse paciente mudou — a fila foi atualizada" },
      { status: 409 }
    );
  }

  await notifyQueueChanged(clinicId);
  return NextResponse.json({ id: item.id, status: to });
}
