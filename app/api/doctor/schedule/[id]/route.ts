import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getCurrentDoctor } from "@/lib/currentDoctor";
import { validateScheduleInput, hasOverlap } from "@/lib/scheduleValidation";

async function loadOwnedSchedule(doctorId: number, idParam: string) {
  const id = Number(idParam);
  if (!Number.isInteger(id)) return null;

  const schedule = await prisma.doctorSchedule.findUnique({ where: { id } });
  if (!schedule || schedule.doctorId !== doctorId) return null;

  return schedule;
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Não autenticado" }, { status: 401 });

  const doctor = await getCurrentDoctor(session);
  if (!doctor) return NextResponse.json({ error: "Usuário não é médico" }, { status: 403 });

  const { id } = await params;
  const existing = await loadOwnedSchedule(doctor.id, id);
  if (!existing) return NextResponse.json({ error: "Turno não encontrado" }, { status: 404 });

  const body = await req.json();
  const input = {
    dayOfWeek: body.dayOfWeek ?? existing.dayOfWeek,
    startTime: body.startTime ?? existing.startTime,
    endTime: body.endTime ?? existing.endTime,
    breakStart: body.breakStart !== undefined ? body.breakStart : existing.breakStart,
    breakEnd: body.breakEnd !== undefined ? body.breakEnd : existing.breakEnd,
  };

  const validationError = validateScheduleInput(input);
  if (validationError) {
    return NextResponse.json({ error: validationError }, { status: 400 });
  }

  if (await hasOverlap(doctor.id, input, existing.id)) {
    return NextResponse.json(
      { error: "Este horário sobrepõe outro turno já cadastrado nesse dia" },
      { status: 409 }
    );
  }

  const updated = await prisma.doctorSchedule.update({
    where: { id: existing.id },
    data: {
      dayOfWeek: input.dayOfWeek,
      startTime: input.startTime,
      endTime: input.endTime,
      breakStart: input.breakStart || null,
      breakEnd: input.breakEnd || null,
    },
  });

  return NextResponse.json(updated);
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Não autenticado" }, { status: 401 });

  const doctor = await getCurrentDoctor(session);
  if (!doctor) return NextResponse.json({ error: "Usuário não é médico" }, { status: 403 });

  const { id } = await params;
  const existing = await loadOwnedSchedule(doctor.id, id);
  if (!existing) return NextResponse.json({ error: "Turno não encontrado" }, { status: 404 });

  await prisma.doctorSchedule.delete({ where: { id: existing.id } });

  return new NextResponse(null, { status: 204 });
}
