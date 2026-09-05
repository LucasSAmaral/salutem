import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { combineDateAndTime, getAvailableSlots, isSlotTaken } from "@/lib/availability";

const ALLOWED_ROLES = ["ADMIN", "ATTENDANT"];
const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;
const TIME_RE = /^([01]\d|2[0-3]):[0-5]\d$/;

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
  if (!ALLOWED_ROLES.includes(session.user.role)) {
    return NextResponse.json({ error: "Sem permissão" }, { status: 403 });
  }

  const body = await req.json();
  const patientId = Number(body.patientId);
  const doctorId = Number(body.doctorId);
  const date = body.date;
  const time = body.time;
  const isWalkIn = !!body.isWalkIn;

  if (!patientId || !doctorId || !DATE_RE.test(date) || !TIME_RE.test(time)) {
    return NextResponse.json({ error: "Dados de agendamento inválidos" }, { status: 400 });
  }

  const [patient, doctor] = await Promise.all([
    prisma.patient.findFirst({ where: { id: patientId, clinicId: session.user.clinicId } }),
    prisma.doctor.findFirst({ where: { id: doctorId, clinicId: session.user.clinicId } }),
  ]);
  if (!patient) return NextResponse.json({ error: "Paciente não encontrado" }, { status: 404 });
  if (!doctor) return NextResponse.json({ error: "Médico não encontrado" }, { status: 404 });

  if (isWalkIn) {
    if (await isSlotTaken(doctorId, date, time)) {
      return NextResponse.json(
        { error: "Já existe uma consulta marcada pra esse médico nesse horário" },
        { status: 409 }
      );
    }
  } else {
    const slots = await getAvailableSlots(doctorId, date);
    if (!slots.includes(time)) {
      return NextResponse.json({ error: "Esse horário não está mais disponível" }, { status: 409 });
    }
  }

  const appointment = await prisma.appointment.create({
    data: {
      clinicId: session.user.clinicId,
      doctorId,
      patientId,
      date: combineDateAndTime(date, time),
      isWalkIn,
    },
    include: { patient: true, doctor: { include: { user: true } } },
  });

  return NextResponse.json(appointment, { status: 201 });
}
