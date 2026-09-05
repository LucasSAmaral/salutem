import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getAvailableSlots } from "@/lib/availability";

const ALLOWED_ROLES = ["ADMIN", "ATTENDANT"];

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
  if (!ALLOWED_ROLES.includes(session.user.role)) {
    return NextResponse.json({ error: "Sem permissão" }, { status: 403 });
  }

  const doctorId = Number(req.nextUrl.searchParams.get("doctorId"));
  const date = req.nextUrl.searchParams.get("date") ?? "";

  if (!doctorId) {
    return NextResponse.json({ error: "doctorId é obrigatório" }, { status: 400 });
  }

  const doctor = await prisma.doctor.findFirst({
    where: { id: doctorId, clinicId: session.user.clinicId },
  });
  if (!doctor) {
    return NextResponse.json({ error: "Médico não encontrado" }, { status: 404 });
  }

  const slots = await getAvailableSlots(doctorId, date);
  return NextResponse.json({ slots });
}
