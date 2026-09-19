import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { combineDateAndTime, getAvailableSlots } from "@/lib/availability";
import { getPatientSession } from "@/lib/patientAuth";
import { notifyQueueChanged } from "@/lib/queueRealtime";

const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;
const TIME_RE = /^([01]\d|2[0-3]):[0-5]\d$/;

export async function GET() {
  const session = await getPatientSession();
  if (!session) return NextResponse.json({ error: "Não identificado" }, { status: 401 });

  const appointments = await prisma.appointment.findMany({
    where: { patientId: session.patientId, clinicId: session.clinicId },
    include: { doctor: { include: { user: true } } },
    orderBy: { date: "asc" },
  });

  return NextResponse.json(appointments);
}

export async function POST(req: NextRequest) {
  const session = await getPatientSession();
  if (!session) return NextResponse.json({ error: "Não identificado" }, { status: 401 });

  const body = await req.json().catch(() => null);
  const doctorId = Number(body?.doctorId);
  const date = body?.date;
  const time = body?.time;

  if (!doctorId || !DATE_RE.test(date) || !TIME_RE.test(time)) {
    return NextResponse.json({ error: "Dados de agendamento inválidos" }, { status: 400 });
  }

  const doctor = await prisma.doctor.findFirst({
    where: { id: doctorId, clinicId: session.clinicId },
  });
  if (!doctor) return NextResponse.json({ error: "Médico não encontrado" }, { status: 404 });

  // Recalcula no servidor antes de gravar — evita duas pessoas marcando
  // o mesmo horário (mesma convenção do endpoint de agendamento do staff).
  const slots = await getAvailableSlots(doctorId, date);
  if (!slots.includes(time)) {
    return NextResponse.json({ error: "Esse horário não está mais disponível" }, { status: 409 });
  }

  const appointment = await prisma.appointment.create({
    data: {
      clinicId: session.clinicId,
      doctorId,
      patientId: session.patientId,
      date: combineDateAndTime(date, time),
    },
    include: { doctor: { include: { user: true } } },
  });

  await notifyQueueChanged(session.clinicId);
  return NextResponse.json(appointment, { status: 201 });
}
