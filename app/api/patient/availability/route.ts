import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAvailableSlots } from "@/lib/availability";
import { getPatientSession } from "@/lib/patientAuth";

export async function GET(req: NextRequest) {
  const session = await getPatientSession();
  if (!session) return NextResponse.json({ error: "Não identificado" }, { status: 401 });

  const doctorId = Number(req.nextUrl.searchParams.get("doctorId"));
  const date = req.nextUrl.searchParams.get("date") ?? "";

  if (!doctorId) {
    return NextResponse.json({ error: "doctorId é obrigatório" }, { status: 400 });
  }

  const doctor = await prisma.doctor.findFirst({
    where: { id: doctorId, clinicId: session.clinicId },
  });
  if (!doctor) {
    return NextResponse.json({ error: "Médico não encontrado" }, { status: 404 });
  }

  const slots = await getAvailableSlots(doctorId, date);
  return NextResponse.json({ slots });
}
