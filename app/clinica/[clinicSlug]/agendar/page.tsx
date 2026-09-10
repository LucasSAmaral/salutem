import { prisma } from "@/lib/prisma";
import { resolveIdentifiedPatient } from "@/lib/currentPatient";
import PatientIdentifyForm from "@/components/PatientIdentifyForm/PatientIdentifyForm";
import PatientConsentGate from "@/components/PatientConsentGate/PatientConsentGate";
import PatientAppointmentBooking from "@/components/PatientAppointmentBooking/PatientAppointmentBooking";

export default async function AgendarPage({
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

  const doctors = await prisma.doctor.findMany({
    where: { clinicId: resolved.session.clinicId },
    include: { user: true },
    orderBy: { user: { name: "asc" } },
  });

  return (
    <PatientAppointmentBooking
      doctors={doctors.map((d) => ({ id: d.id, name: d.user.name, specialty: d.specialty }))}
    />
  );
}
