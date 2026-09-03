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
