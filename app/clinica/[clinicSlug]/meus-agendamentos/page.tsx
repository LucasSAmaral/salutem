import { prisma } from "@/lib/prisma";
import { resolveIdentifiedPatient } from "@/lib/currentPatient";
import PatientIdentifyForm from "@/components/PatientIdentifyForm/PatientIdentifyForm";
import PatientConsentGate from "@/components/PatientConsentGate/PatientConsentGate";
import MyAppointmentsList from "@/components/MyAppointmentsList/MyAppointmentsList";

export default async function MeusAgendamentosPage({
  params,
}: {
  params: Promise<{ clinicSlug: string }>;
}) {
  const { clinicSlug } = await params;
  const resolved = await resolveIdentifiedPatient(clinicSlug);

  if (resolved.status === "unauthenticated") {
    return <PatientIdentifyForm clinicSlug={clinicSlug} />;
  }
  if (resolved.status === "needs-consent") {
    return <PatientConsentGate />;
  }

  const appointments = await prisma.appointment.findMany({
    where: { patientId: resolved.session.patientId, clinicId: resolved.session.clinicId },
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
