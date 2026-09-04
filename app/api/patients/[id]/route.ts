import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { formatCPF } from "@/lib/cpf";
import { validatePatientInput } from "@/lib/patientValidation";

const ALLOWED_ROLES = ["ADMIN", "DOCTOR", "ATTENDANT"];

async function loadAuthorizedPatient(clinicId: number, idParam: string) {
  const id = Number(idParam);
  if (!Number.isInteger(id)) return null;
  return prisma.patient.findFirst({ where: { id, clinicId } });
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
  if (!ALLOWED_ROLES.includes(session.user.role)) {
    return NextResponse.json({ error: "Sem permissão" }, { status: 403 });
  }

  const { id: idParam } = await params;
  const existing = await loadAuthorizedPatient(session.user.clinicId, idParam);
  if (!existing) {
    return NextResponse.json({ error: "Paciente não encontrado" }, { status: 404 });
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
    const updated = await prisma.patient.update({
      where: { id: existing.id },
      data: {
        name: input.name.trim(),
        cpf: formatCPF(input.cpf),
        birthDate: new Date(input.birthDate),
        phone: input.phone || null,
        email: input.email || null,
        consent: !!input.consent,
      },
    });
    return NextResponse.json(updated);
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

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
  if (!ALLOWED_ROLES.includes(session.user.role)) {
    return NextResponse.json({ error: "Sem permissão" }, { status: 403 });
  }

  const { id: idParam } = await params;
  const existing = await loadAuthorizedPatient(session.user.clinicId, idParam);
  if (!existing) {
    return NextResponse.json({ error: "Paciente não encontrado" }, { status: 404 });
  }

  try {
    await prisma.patient.delete({ where: { id: existing.id } });
    return new NextResponse(null, { status: 204 });
  } catch (err: unknown) {
    if (typeof err === "object" && err !== null && "code" in err && err.code === "P2003") {
      return NextResponse.json(
        { error: "Não é possível excluir: este paciente tem consultas ou exames vinculados" },
        { status: 409 }
      );
    }
    throw err;
  }
}
