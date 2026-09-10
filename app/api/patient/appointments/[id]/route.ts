import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getPatientSession } from "@/lib/patientAuth";

/** Paciente só pode cancelar a própria consulta, e só enquanto ela ainda
 *  está SCHEDULED — depois que a recepção confirma a chegada ou o
 *  atendimento começa, precisa ligar pra clínica. */
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getPatientSession();
  if (!session) return NextResponse.json({ error: "Não identificado" }, { status: 401 });

  const { id: idParam } = await params;
  const id = Number(idParam);
  if (!Number.isInteger(id)) {
    return NextResponse.json({ error: "Consulta inválida" }, { status: 400 });
  }

  const body = await req.json().catch(() => null);
  if (body?.action !== "cancel") {
    return NextResponse.json({ error: "Ação inválida" }, { status: 400 });
  }

  const appointment = await prisma.appointment.findFirst({
    where: { id, patientId: session.patientId, clinicId: session.clinicId },
  });
  if (!appointment) {
    return NextResponse.json({ error: "Consulta não encontrada" }, { status: 404 });
  }

  if (appointment.status !== "SCHEDULED") {
    return NextResponse.json(
      { error: "Essa consulta não pode mais ser cancelada por aqui. Ligue pra clínica." },
      { status: 409 }
    );
  }

  const updated = await prisma.appointment.update({
    where: { id },
    data: { status: "CANCELLED" },
  });

  return NextResponse.json(updated);
}
