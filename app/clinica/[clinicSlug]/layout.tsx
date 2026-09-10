import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getPatientSession } from "@/lib/patientAuth";
import PatientTopBar from "@/components/PatientTopBar/PatientTopBar";
import { ContentArea, ShellRoot } from "./layout.styles";

export default async function ClinicPatientLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ clinicSlug: string }>;
}) {
  const { clinicSlug } = await params;

  const clinic = await prisma.clinic.findUnique({ where: { slug: clinicSlug } });
  if (!clinic) notFound();

  const session = await getPatientSession();
  const identified = !!session && session.clinicSlug === clinicSlug;

  return (
    <ShellRoot>
      <PatientTopBar clinicSlug={clinicSlug} clinicName={clinic.name} showLogout={identified} />
      <ContentArea>{children}</ContentArea>
    </ShellRoot>
  );
}
