import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { formatCPF } from "@/lib/cpf";
import { validatePatientInput } from "@/lib/patientValidation";

// Cadastro de paciente (dados demográficos) é diferente de prontuário (histórico
// clínico) — ADMIN e ATTENDANT também cadastram/agendam pacientes, só não acessam
// o histórico clínico em si.
const ALLOWED_ROLES = ["ADMIN", "DOCTOR", "ATTENDANT"];

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
  if (!ALLOWED_ROLES.includes(session.user.role)) {
    return NextResponse.json({ error: "Sem permissão" }, { status: 403 });
  }

  const patients = await prisma.patient.findMany({
    where: { clinicId: session.user.clinicId },
    orderBy: { name: "asc" },
  });

  return NextResponse.json(patients);
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
  if (!ALLOWED_ROLES.includes(session.user.role)) {
    return NextResponse.json({ error: "Sem permissão" }, { status: 403 });
  }

  const body = await req.json();
  const input = {
    name: body.name,
    cpf: body.cpf,
    birthDate: body.birthDate,
    phone: body.phone,
    email: body.email,
    consent: body.consent,
  };

  const validationError = validatePatientInput(input);
  if (validationError) {
    return NextResponse.json({ error: validationError }, { status: 400 });
  }

  try {
    const patient = await prisma.patient.create({
      data: {
        clinicId: session.user.clinicId,
        name: input.name.trim(),
        cpf: formatCPF(input.cpf),
        birthDate: new Date(input.birthDate),
        phone: input.phone || null,
        email: input.email || null,
        consent: !!input.consent,
      },
    });
    return NextResponse.json(patient, { status: 201 });
  } catch (err: unknown) {
    if (typeof err === "object" && err !== null && "code" in err && err.code === "P2002") {
      return NextResponse.json(
        { error: "Já existe um paciente com esse CPF nesta clínica" },
        { status: 409 }
      );
    }
    throw err;
  }
}
