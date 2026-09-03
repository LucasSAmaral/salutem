import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { authOptions } from "@/lib/auth";
import { getCurrentDoctor } from "@/lib/currentDoctor";
import { prisma } from "@/lib/prisma";
import { Box, Typography, Paper, Stack } from "@mui/material";
import ChevronRightOutlinedIcon from "@mui/icons-material/ChevronRightOutlined";
import ScheduleManager from "@/components/ScheduleManager";
import { getInitials } from "@/lib/initials";

export default async function AgendaPage({
  searchParams,
}: {
  searchParams: Promise<{ doctorId?: string }>;
}) {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/login");
  if (session.user.role !== "DOCTOR" && session.user.role !== "ADMIN") {
    redirect("/dashboard");
  }

  if (session.user.role === "DOCTOR") {
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

  // ADMIN: precisa escolher qual médico gerenciar
  const { doctorId: doctorIdParam } = await searchParams;
  const doctorId = doctorIdParam ? Number(doctorIdParam) : null;

  const selectedDoctor = doctorId
    ? await prisma.doctor.findFirst({
        where: { id: doctorId, clinicId: session.user.clinicId },
        include: { user: true },
      })
    : null;

  if (doctorId && !selectedDoctor) {
    // doctorId inválido ou de outra clínica — volta pro seletor
    redirect("/dashboard/agenda");
  }

  if (!selectedDoctor) {
    const doctors = await prisma.doctor.findMany({
      where: { clinicId: session.user.clinicId },
      include: { user: true },
      orderBy: { user: { name: "asc" } },
    });

    return (
      <Box sx={{ p: 4, maxWidth: 700 }}>
        <Typography variant="h5" gutterBottom>
          Agenda dos Médicos
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
          Selecione um médico para ver ou editar os turnos.
        </Typography>

        {doctors.length === 0 ? (
          <Typography variant="body2" color="text.secondary">
            Nenhum médico cadastrado nesta clínica ainda.
          </Typography>
        ) : (
          <Stack spacing={1.25}>
            {doctors.map((d) => (
              <Link
                key={d.id}
                href={`/dashboard/agenda?doctorId=${d.id}`}
                style={{ textDecoration: "none" }}
              >
                <Paper
                  variant="outlined"
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    gap: 1.75,
                    p: 2,
                    "&:hover": { borderColor: "primary.light" },
                  }}
                >
                  <Box
                    sx={{
                      width: 44,
                      height: 44,
                      borderRadius: "50%",
                      bgcolor: "action.selected",
                      color: "primary.dark",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: 15,
                      fontWeight: 600,
                      flexShrink: 0,
                    }}
                  >
                    {getInitials(d.user.name)}
                  </Box>
                  <Box>
                    <Typography variant="body2" sx={{ fontWeight: 500 }}>
                      {d.user.name}
                    </Typography>
                    {d.specialty && (
                      <Typography variant="body2" color="text.secondary">
                        {d.specialty}
                      </Typography>
                    )}
                  </Box>
                  <ChevronRightOutlinedIcon sx={{ ml: "auto", color: "text.disabled" }} />
                </Paper>
              </Link>
            ))}
          </Stack>
        )}
      </Box>
    );
  }

  const schedules = await prisma.doctorSchedule.findMany({
    where: { doctorId: selectedDoctor.id },
    orderBy: [{ dayOfWeek: "asc" }, { startTime: "asc" }],
  });

  return (
    <Box sx={{ p: 4, maxWidth: 700 }}>
      <Link href="/dashboard/agenda" style={{ textDecoration: "none" }}>
        <Typography variant="body2" color="primary" sx={{ mb: 1 }}>
          ← Trocar de médico
        </Typography>
      </Link>
      <Typography variant="h5" gutterBottom>
        Agenda de {selectedDoctor.user.name}
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
        Os turnos abaixo definem o calendário de disponibilidade usado para
        agendamento de consultas.
      </Typography>

      <ScheduleManager initialSchedules={schedules} doctorId={selectedDoctor.id} />
    </Box>
  );
}
