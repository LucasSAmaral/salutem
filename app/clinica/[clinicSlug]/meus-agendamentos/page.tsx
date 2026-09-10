import { prisma } from "@/lib/prisma";
import { getPatientSession } from "@/lib/patientAuth";
import PatientIdentifyForm from "@/components/PatientIdentifyForm/PatientIdentifyForm";
import MyAppointmentsList from "@/components/MyAppointmentsList/MyAppointmentsList";

export default async function MeusAgendamentosPage({
  params,
}: {
  params: Promise<{ clinicSlug: string }>;
}) {
  const { clinicSlug } = await params;
  const session = await getPatientSession();

  if (!session || session.clinicSlug !== clinicSlug) {
    return <PatientIdentifyForm clinicSlug={clinicSlug} />;
  }

  const appointments = await prisma.appointment.findMany({
    where: { patientId: session.patientId, clinicId: session.clinicId },
    include: { doctor: { include: { user: true } } },
    orderBy: { date: "asc" },
  });

  return (
    <MyAppointmentsList
      initialAppointments={appointments.map((a) => ({
        id: a.id,
        date: a.date.toISOString(),
        status: a.status,
        doctorName: a.doctor.user.name,
        specialty: a.doctor.specialty,
      }))}
    />
  );
}
