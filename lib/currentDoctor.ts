import type { Session } from "next-auth";
import { prisma } from "@/lib/prisma";

/** Resolve o Doctor do usuário logado, escopado à própria clínica.
 *  Retorna null se o usuário não é médico (ou o vínculo não existe). */
export async function getCurrentDoctor(session: Session) {
  return prisma.doctor.findFirst({
    where: {
      userId: Number(session.user.id),
      clinicId: session.user.clinicId,
    },
  });
}

/** Resolve o médico-alvo de uma operação sobre agenda (DoctorSchedule).
 *  - DOCTOR: só pode operar na própria agenda; qualquer doctorId recebido é ignorado.
 *  - ADMIN (secretária): precisa informar doctorId, e só pode operar em médico
 *    da própria clínica — nunca de outra (isolamento multi-tenant).
 *  - qualquer outro papel: sem acesso. */
export async function resolveTargetDoctor(session: Session, requestedDoctorId?: number | null) {
  if (session.user.role === "DOCTOR") {
    return getCurrentDoctor(session);
  }

  if (session.user.role === "ADMIN") {
    if (!requestedDoctorId) return null;
    return prisma.doctor.findFirst({
      where: { id: requestedDoctorId, clinicId: session.user.clinicId },
    });
  }

  return null;
}

/** Verifica se a sessão atual pode mexer num DoctorSchedule já existente,
 *  dado o Doctor dono desse turno. */
export function canAccessDoctor(
  session: Session,
  doctor: { id: number; userId: number; clinicId: number }
) {
  if (session.user.role === "DOCTOR") return doctor.userId === Number(session.user.id);
  if (session.user.role === "ADMIN") return doctor.clinicId === session.user.clinicId;
  return false;
}
