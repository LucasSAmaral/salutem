import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getPatientSession } from "@/lib/patientAuth";

export async function PATCH() {
  const session = await getPatientSession();
  if (!session) return NextResponse.json({ error: "Não identificado" }, { status: 401 });

  const patient = await prisma.patient.findFirst({
    where: { id: session.patientId, clinicId: session.clinicId },
  });
  if (!patient) return NextResponse.json({ error: "Paciente não encontrado" }, { status: 404 });

  await prisma.patient.update({
    where: { id: patient.id },
    data: { consent: true },
  });

  return NextResponse.json({ ok: true });
}
