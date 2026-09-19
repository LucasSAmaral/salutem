import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getCurrentDoctor } from "@/lib/currentDoctor";
import { dayRange, todayInClinic } from "@/lib/clinicTime";
import { getQueue } from "@/lib/queue";
import { notifyQueueChanged } from "@/lib/queueRealtime";

const VIEW_ROLES = ["DOCTOR", "ATTENDANT"];
const ARRIVAL_ROLES = ["ADMIN", "ATTENDANT"];

/** Fila de hoje. DOCTOR só vê a própria; ATTENDANT vê a da clínica toda,
 *  opcionalmente filtrada por `?doctorId=`. */
export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
  if (!VIEW_ROLES.includes(session.user.role)) {
    return NextResponse.json({ error: "Sem permissão" }, { status: 403 });
  }

  const isDoctor = session.user.role === "DOCTOR";
  const doctor = isDoctor ? await getCurrentDoctor(session) : null;
  if (isDoctor && !doctor) {
    return NextResponse.json({ error: "Médico não encontrado" }, { status: 404 });
  }
  const requestedDoctorId = Number(req.nextUrl.searchParams.get("doctorId")) || undefined;
  const doctorId = doctor?.id ?? requestedDoctorId;

  const date = todayInClinic();
  const asOf = new Date().toISOString();
  const entries = await getQueue(session.user.clinicId, date, doctorId);
  return NextResponse.json({ date, asOf, entries });
}

/** Confirma a chegada do paciente: consulta SCHEDULED → CONFIRMED e entra no
 *  fim da fila do médico. */
export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
  if (!ARRIVAL_ROLES.includes(session.user.role)) {
    return NextResponse.json({ error: "Sem permissão" }, { status: 403 });
  }

  const body = await req.json();
  const appointmentId = Number(body.appointmentId);
  if (!Number.isInteger(appointmentId) || appointmentId <= 0) {
    return NextResponse.json({ error: "Consulta inválida" }, { status: 400 });
  }

  const clinicId = session.user.clinicId;
  const appointment = await prisma.appointment.findFirst({ where: { id: appointmentId, clinicId } });
  if (!appointment) return NextResponse.json({ error: "Consulta não encontrada" }, { status: 404 });

  const today = todayInClinic();
  if (appointment.date.toISOString().slice(0, 10) !== today) {
    return NextResponse.json(
      { error: "Só é possível confirmar a chegada no dia da consulta" },
      { status: 409 }
    );
  }

  const { start, end } = dayRange(today);
  const item = await prisma.$transaction(async (tx) => {
    // updateMany condicionado ao status garante que dois cliques/atendentes
    // simultâneos não criem duas entradas pra mesma consulta.
    const claimed = await tx.appointment.updateMany({
      where: { id: appointmentId, clinicId, status: "SCHEDULED" },
      data: { status: "CONFIRMED" },
    });
    if (claimed.count === 0) return null;

    const last = await tx.queueItem.aggregate({
      where: {
        clinicId,
        appointment: { doctorId: appointment.doctorId, date: { gte: start, lte: end } },
      },
      _max: { position: true },
    });
    return tx.queueItem.create({
      data: { clinicId, appointmentId, position: (last._max.position ?? 0) + 1 },
    });
  });

  if (!item) {
    return NextResponse.json(
      { error: "Essa consulta não está mais aguardando chegada" },
      { status: 409 }
    );
  }

  await notifyQueueChanged(clinicId);
  return NextResponse.json({ id: item.id, position: item.position }, { status: 201 });
}
