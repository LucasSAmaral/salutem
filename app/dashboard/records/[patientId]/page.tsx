import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import { getCurrentDoctor } from "@/lib/currentDoctor";
import { getPatientRecord, logRecordAccess } from "@/lib/records";
import PatientRecordView from "@/components/PatientRecordView/PatientRecordView";
import { PageRoot } from "./page.styles";

export default async function PatientRecordPage({
  params,
}: {
  params: Promise<{ patientId: string }>;
}) {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/login");
  if (session.user.role !== "DOCTOR") redirect("/dashboard");

  const doctor = await getCurrentDoctor(session);
  const { patientId: patientIdParam } = await params;
  const patientId = Number(patientIdParam);
  if (!doctor || !Number.isInteger(patientId)) redirect("/dashboard/records");

  const record = await getPatientRecord(session.user.clinicId, patientId, doctor.id);
  if (!record) redirect("/dashboard/records");

  // Efeito colateral isolado da leitura: a page grava o acesso depois de já
  // ter o dado em mãos, sem condicionar a exibição do prontuário a essa gravação.
  await logRecordAccess(session.user.clinicId, patientId, doctor.id);

  return (
    <PageRoot>
      <PatientRecordView initialRecord={record} />
    </PageRoot>
  );
}
