import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import AppointmentBooking from "@/components/AppointmentBooking/AppointmentBooking";
import { PageRoot } from "./page.styles";

export default async function AppointmentsPage() {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/login");
  if (!["ADMIN", "ATTENDANT"].includes(session.user.role)) {
    redirect("/dashboard");
  }

  const [doctors, patients] = await Promise.all([
    prisma.doctor.findMany({
      where: { clinicId: session.user.clinicId },
      include: { user: true },
      orderBy: { user: { name: "asc" } },
    }),
    prisma.patient.findMany({
      where: { clinicId: session.user.clinicId },
      orderBy: { name: "asc" },
    }),
  ]);

  return (
    <PageRoot>
      <AppointmentBooking doctors={doctors} patients={patients} />
    </PageRoot>
  );
}
