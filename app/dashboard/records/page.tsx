import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import RecordsSearch from "@/components/RecordsSearch/RecordsSearch";
import { PageRoot } from "./page.styles";

export default async function RecordsPage() {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/login");
  if (session.user.role !== "DOCTOR") redirect("/dashboard");

  const patients = await prisma.patient.findMany({
    where: { clinicId: session.user.clinicId },
    orderBy: { name: "asc" },
  });

  return (
    <PageRoot>
      <RecordsSearch initialPatients={patients} />
    </PageRoot>
  );
}
