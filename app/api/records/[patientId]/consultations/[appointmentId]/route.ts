import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getCurrentDoctor } from "@/lib/currentDoctor";

/** Edita a anotação clínica de uma consulta já finalizada. Só o médico dono do
 *  atendimento edita — mesmo com o prontuário visível a qualquer DOCTOR da
 *  clínica (colegas podem ler o histórico, não reescrever a anotação alheia). */
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ patientId: string; appointmentId: string }> }
) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
  if (session.user.role !== "DOCTOR") {
    return NextResponse.json({ error: "Sem permissão" }, { status: 403 });
  }

  const doctor = await getCurrentDoctor(session);
  const { patientId: patientIdParam, appointmentId: appointmentIdParam } = await params;
  const patientId = Number(patientIdParam);
  const appointmentId = Number(appointmentIdParam);
  if (!doctor || !Number.isInteger(patientId) || !Number.isInteger(appointmentId)) {
    return NextResponse.json({ error: "Consulta não encontrada" }, { status: 404 });
  }

  const { notes } = await req.json();
  if (typeof notes !== "string") {
    return NextResponse.json({ error: "Anotação inválida" }, { status: 400 });
  }

  // 404 também pra "não é sua consulta": não confirma se existe.
  const updated = await prisma.appointment.updateMany({
    where: {
      id: appointmentId,
      patientId,
      doctorId: doctor.id,
      clinicId: session.user.clinicId,
      status: "DONE",
    },
    data: { notes: notes.trim() || null },
  });
  if (updated.count === 0) {
    return NextResponse.json({ error: "Consulta não encontrada" }, { status: 404 });
  }

  return NextResponse.json({ appointmentId, notes: notes.trim() || null });
}
