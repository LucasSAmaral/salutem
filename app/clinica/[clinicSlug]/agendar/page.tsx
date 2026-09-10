import { prisma } from "@/lib/prisma";
import { getPatientSession } from "@/lib/patientAuth";
import PatientIdentifyForm from "@/components/PatientIdentifyForm/PatientIdentifyForm";
import PatientAppointmentBooking from "@/components/PatientAppointmentBooking/PatientAppointmentBooking";

export default async function AgendarPage({
  params,
}: {
  params: Promise<{ clinicSlug: string }>;
}) {
  const { clinicSlug } = await params;
  const session = await getPatientSession();

  if (!session || session.clinicSlug !== clinicSlug) {
    return <PatientIdentifyForm clinicSlug={clinicSlug} />;
  }

  const doctors = await prisma.doctor.findMany({
    where: { clinicId: session.clinicId },
    include: { user: true },
    orderBy: { user: { name: "asc" } },
  });

  return (
    <PatientAppointmentBooking
      doctors={doctors.map((d) => ({ id: d.id, name: d.user.name, specialty: d.specialty }))}
    />
  );
}
