import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Box } from "@mui/material";
import PatientsManager from "@/components/PatientsManager";

export default async function PatientsPage() {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/login");
  if (!["ADMIN", "DOCTOR", "ATTENDANT"].includes(session.user.role)) {
    redirect("/dashboard");
  }

  const patients = await prisma.patient.findMany({
    where: { clinicId: session.user.clinicId },
    orderBy: { name: "asc" },
  });

  return (
    <Box sx={{ p: 4 }}>
      <PatientsManager initialPatients={patients} />
    </Box>
  );
}
