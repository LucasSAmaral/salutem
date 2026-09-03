import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getCurrentDoctor } from "@/lib/currentDoctor";
import { validateScheduleInput, hasOverlap } from "@/lib/scheduleValidation";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Não autenticado" }, { status: 401 });

  const doctor = await getCurrentDoctor(session);
  if (!doctor) return NextResponse.json({ error: "Usuário não é médico" }, { status: 403 });

  const schedules = await prisma.doctorSchedule.findMany({
    where: { doctorId: doctor.id },
    orderBy: [{ dayOfWeek: "asc" }, { startTime: "asc" }],
  });

  return NextResponse.json(schedules);
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Não autenticado" }, { status: 401 });

  const doctor = await getCurrentDoctor(session);
  if (!doctor) return NextResponse.json({ error: "Usuário não é médico" }, { status: 403 });

  const body = await req.json();
  const input = {
    dayOfWeek: body.dayOfWeek,
    startTime: body.startTime,
    endTime: body.endTime,
    breakStart: body.breakStart,
    breakEnd: body.breakEnd,
  };

  const validationError = validateScheduleInput(input);
  if (validationError) {
    return NextResponse.json({ error: validationError }, { status: 400 });
  }

  if (await hasOverlap(doctor.id, input)) {
    return NextResponse.json(
      { error: "Este horário sobrepõe outro turno já cadastrado nesse dia" },
      { status: 409 }
    );
  }

  const schedule = await prisma.doctorSchedule.create({
    data: {
      doctorId: doctor.id,
      dayOfWeek: input.dayOfWeek,
      startTime: input.startTime,
      endTime: input.endTime,
      breakStart: input.breakStart || null,
      breakEnd: input.breakEnd || null,
    },
  });

  return NextResponse.json(schedule, { status: 201 });
}
