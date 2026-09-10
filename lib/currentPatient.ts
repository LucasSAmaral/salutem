import type { Patient } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { getPatientSession, type PatientSessionPayload } from "@/lib/patientAuth";

export type ResolvedPatient =
  | { status: "unauthenticated" }
  | { status: "needs-consent"; patient: Patient; session: PatientSessionPayload }
  | { status: "ok"; patient: Patient; session: PatientSessionPayload };

/** Resolve o paciente identificado pra uma clínica (por slug), checando
 *  sessão + LGPD num lugar só — usado pelas duas páginas de autoagendamento
 *  (`/agendar` e `/meus-agendamentos`) pra evitar duplicar essa lógica. */
export async function resolveIdentifiedPatient(clinicSlug: string): Promise<ResolvedPatient> {
  const session = await getPatientSession();
  if (!session || session.clinicSlug !== clinicSlug) {
    return { status: "unauthenticated" };
  }

  const patient = await prisma.patient.findFirst({
    where: { id: session.patientId, clinicId: session.clinicId },
  });
  // paciente pode ter sido excluído pelo staff depois da sessão criada
  if (!patient) return { status: "unauthenticated" };

  if (!patient.consent) return { status: "needs-consent", patient, session };

  return { status: "ok", patient, session };
}
