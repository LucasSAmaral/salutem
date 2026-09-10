import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { formatCPF, onlyDigits } from "@/lib/cpf";
import { checkRateLimit } from "@/lib/rateLimit";
import { createPatientSession, clearPatientSession } from "@/lib/patientAuth";

const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;
const GENERIC_ERROR = "Dados não encontrados. Verifique CPF e data de nascimento.";

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);
  const clinicSlug = typeof body?.clinicSlug === "string" ? body.clinicSlug : "";
  const cpfInput = typeof body?.cpf === "string" ? body.cpf : "";
  const birthDateInput = typeof body?.birthDate === "string" ? body.birthDate : "";

  if (!clinicSlug || !cpfInput || !DATE_RE.test(birthDateInput)) {
    return NextResponse.json({ error: GENERIC_ERROR }, { status: 400 });
  }

  // Trava por CPF+clínica, não por IP: o risco aqui é alguém testando
  // combinações de data de nascimento pra um CPF específico que já conhece.
  const rateLimitKey = `${clinicSlug}:${onlyDigits(cpfInput)}`;
  if (!checkRateLimit(rateLimitKey, 5, 15 * 60 * 1000)) {
    return NextResponse.json(
      { error: "Muitas tentativas. Aguarde alguns minutos e tente novamente." },
      { status: 429 }
    );
  }

  const clinic = await prisma.clinic.findUnique({ where: { slug: clinicSlug } });
  if (!clinic) {
    return NextResponse.json({ error: "Clínica não encontrada" }, { status: 404 });
  }

  const patient = await prisma.patient.findFirst({
    where: {
      clinicId: clinic.id,
      cpf: formatCPF(cpfInput),
      birthDate: new Date(`${birthDateInput}T00:00:00.000Z`),
    },
  });

  // Mensagem genérica de propósito, tanto pra CPF inexistente quanto pra
  // nascimento errado — não confirma se um CPF é ou não paciente da clínica.
  if (!patient) {
    return NextResponse.json({ error: GENERIC_ERROR }, { status: 401 });
  }

  await createPatientSession({ patientId: patient.id, clinicId: clinic.id, clinicSlug: clinic.slug });

  return NextResponse.json({ ok: true, patientName: patient.name });
}

export async function DELETE() {
  await clearPatientSession();
  return NextResponse.json({ ok: true });
}
