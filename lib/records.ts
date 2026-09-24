import { prisma } from "@/lib/prisma";
import { extractTime } from "@/lib/availability";

export type ConsultationEntry = {
  appointmentId: number;
  date: string;
  time: string;
  isWalkIn: boolean;
  notes: string | null;
  doctor: { id: number; name: string };
  /** Só o médico dono do atendimento edita as próprias anotações. */
  canEdit: boolean;
};

export type ExamEntry = {
  id: number;
  name: string;
  fileType: string;
  uploadedAt: string;
  uploadedBy: { id: number; name: string };
};

export type PatientRecord = {
  patient: {
    id: number;
    name: string;
    cpf: string;
    birthDate: string;
    phone: string | null;
  };
  consultations: ConsultationEntry[];
  exams: ExamEntry[];
};

/** Registro completo de um paciente pro Prontuário: dados básicos, histórico
 *  de consultas finalizadas e exames. Sempre escopado por clinicId. Não
 *  registra o acesso — isso é `logRecordAccess`, chamado à parte pela page. */
export async function getPatientRecord(
  clinicId: number,
  patientId: number,
  currentDoctorId: number
): Promise<PatientRecord | null> {
  const patient = await prisma.patient.findFirst({
    where: { id: patientId, clinicId },
    include: {
      appointments: {
        where: { status: "DONE" },
        orderBy: { date: "desc" },
        include: { doctor: { include: { user: { select: { name: true } } } } },
      },
      exams: {
        orderBy: { uploadedAt: "desc" },
        include: { uploadedBy: { include: { user: { select: { name: true } } } } },
      },
    },
  });
  if (!patient) return null;

  return {
    patient: {
      id: patient.id,
      name: patient.name,
      cpf: patient.cpf,
      birthDate: patient.birthDate.toISOString(),
      phone: patient.phone,
    },
    consultations: patient.appointments.map((a) => ({
      appointmentId: a.id,
      date: a.date.toISOString(),
      time: extractTime(a.date),
      isWalkIn: a.isWalkIn,
      notes: a.notes,
      doctor: { id: a.doctorId, name: a.doctor.user.name },
      canEdit: a.doctorId === currentDoctorId,
    })),
    exams: patient.exams.map((e) => ({
      id: e.id,
      name: e.name,
      fileType: e.fileType,
      uploadedAt: e.uploadedAt.toISOString(),
      uploadedBy: { id: e.uploadedById, name: e.uploadedBy.user.name },
    })),
  };
}

/** Registra a abertura do prontuário pro log de acesso LGPD. Acesso em si é
 *  aberto a qualquer DOCTOR da clínica (ver comentário no schema); isso é o
 *  que dá rastreabilidade a esse acesso aberto. Efeito colateral isolado,
 *  chamado à parte da leitura pra não acoplar "ver o prontuário" a "gravar
 *  no banco" no mesmo retorno de função. */
export async function logRecordAccess(
  clinicId: number,
  patientId: number,
  doctorId: number
): Promise<void> {
  await prisma.recordAccess.create({ data: { clinicId, patientId, doctorId } });
}
