import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getCurrentDoctor } from "@/lib/currentDoctor";
import { dayRange } from "@/lib/clinicTime";
import { notifyQueueChanged } from "@/lib/queueRealtime";

/** Chamar (AGUARDANDO → EM_ATENDIMENTO) e finalizar (→ ATENDIDO) um item da fila.
 *  Só o DOCTOR faz isso, e só nos próprios pacientes: é ele quem sabe quando a
 *  consulta começa e termina. Finalizar já chama o próximo da fila; "chamar"
 *  fica pro primeiro do dia ou pra quando a fila estava vazia. "Pular" vale pro
 *  paciente chamado que não estava lá: ele volta a aguardar logo atrás do
 *  próximo, que já é chamado no lugar dele. */
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
  if (session.user.role !== "DOCTOR") {
    return NextResponse.json({ error: "Sem permissão" }, { status: 403 });
  }

  const { action } = await req.json();
  if (action !== "call" && action !== "finish" && action !== "skip") {
    return NextResponse.json({ error: "Ação inválida" }, { status: 400 });
  }

  const doctor = await getCurrentDoctor(session);
  const { id: idParam } = await params;
  const id = Number(idParam);
  const clinicId = session.user.clinicId;
  const item =
    doctor && Number.isInteger(id)
      ? await prisma.queueItem.findFirst({
          where: { id, clinicId, appointment: { doctorId: doctor.id } },
          include: { appointment: true },
        })
      : null;
  // 404 também pra "não é seu paciente": não confirma que o item existe.
  if (!item) return NextResponse.json({ error: "Item da fila não encontrado" }, { status: 404 });

  const dateStr = item.appointment.date.toISOString().slice(0, 10);
  const { start, end } = dayRange(dateStr);

  if (action === "call") {
    const inProgress = await prisma.appointment.findFirst({
      where: { clinicId, doctorId: doctor!.id, status: "IN_PROGRESS", date: { gte: start, lte: end } },
    });
    if (inProgress) {
      return NextResponse.json(
        { error: "Finalize o atendimento em andamento antes de chamar o próximo" },
        { status: 409 }
      );
    }

    // Condicionado ao status atual: dois cliques/telas simultâneas não pulam etapa.
    const called = await prisma.appointment.updateMany({
      where: { id: item.appointmentId, clinicId, status: "CONFIRMED" },
      data: { status: "IN_PROGRESS" },
    });
    if (called.count === 0) {
      return NextResponse.json(
        { error: "O status desse paciente mudou — a fila foi atualizada" },
        { status: 409 }
      );
    }

    await notifyQueueChanged(clinicId);
    return NextResponse.json({ id: item.id, status: "IN_PROGRESS" });
  }

  const result = await prisma.$transaction(async (tx) => {
    const leaving = await tx.appointment.updateMany({
      where: { id: item.appointmentId, clinicId, status: "IN_PROGRESS" },
      // Finalizar → DONE. Pular → volta a aguardar (chamado, mas não estava na sala).
      data: { status: action === "finish" ? "DONE" : "CONFIRMED" },
    });
    if (leaving.count === 0) return null;

    // Próximo = quem chegou primeiro entre os que aguardam, só desse médico e desse dia.
    const next = await tx.queueItem.findFirst({
      where: {
        clinicId,
        appointment: { doctorId: doctor!.id, date: { gte: start, lte: end }, status: "CONFIRMED" },
        id: { not: item.id },
      },
      orderBy: [{ position: "asc" }, { id: "asc" }],
      include: { appointment: { include: { patient: { select: { name: true } } } } },
    });

    if (action === "skip" && next) {
      // Perde a vez uma única vez: entra logo atrás de quem vai passar na frente,
      // em vez de ir pro fim da fila (quem só se atrasou não deve ser punido).
      await tx.queueItem.updateMany({
        where: {
          clinicId,
          id: { not: item.id },
          position: { gt: next.position },
          appointment: { doctorId: doctor!.id, date: { gte: start, lte: end } },
        },
        data: { position: { increment: 1 } },
      });
      await tx.queueItem.update({ where: { id: item.id }, data: { position: next.position + 1 } });
    }

    if (next) {
      await tx.appointment.updateMany({
        where: { id: next.appointmentId, clinicId, status: "CONFIRMED" },
        data: { status: "IN_PROGRESS" },
      });
    }
    return { next };
  });

  if (!result) {
    return NextResponse.json(
      { error: "O status desse paciente mudou — a fila foi atualizada" },
      { status: 409 }
    );
  }

  await notifyQueueChanged(clinicId);
  return NextResponse.json({
    id: item.id,
    status: action === "finish" ? "DONE" : "CONFIRMED",
    next: result.next ? { id: result.next.id, patientName: result.next.appointment.patient.name } : null,
  });
}
