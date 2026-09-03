import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import { getCurrentDoctor } from "@/lib/currentDoctor";
import { prisma } from "@/lib/prisma";
import { Box, Typography } from "@mui/material";
import ScheduleManager from "@/components/ScheduleManager";

export default async function AgendaPage() {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/login");
  if (session.user.role !== "DOCTOR") redirect("/dashboard");

  const doctor = await getCurrentDoctor(session);
  if (!doctor) redirect("/dashboard");

  const schedules = await prisma.doctorSchedule.findMany({
    where: { doctorId: doctor.id },
    orderBy: [{ dayOfWeek: "asc" }, { startTime: "asc" }],
  });

  return (
    <Box sx={{ p: 4, maxWidth: 700 }}>
      <Typography variant="h5" gutterBottom>
        Minha Agenda
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
        Os turnos abaixo definem o calendário de disponibilidade usado para
        agendamento de consultas.
      </Typography>

      <ScheduleManager initialSchedules={schedules} />
    </Box>
  );
}
