import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { authOptions } from "@/lib/auth";
import { getCurrentDoctor } from "@/lib/currentDoctor";
import { prisma } from "@/lib/prisma";
import { Box, Typography, Stack } from "@mui/material";
import ScheduleManager from "@/components/ScheduleManager/ScheduleManager";
import { getInitials } from "@/lib/initials";
import {
  BackLink,
  BoldText,
  ChevronIcon,
  DoctorAvatar,
  DoctorRow,
  PageRoot,
  Subtitle,
} from "./page.styles";

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
      <PageRoot>
        <Typography variant="h5" gutterBottom>
          Minha Agenda
        </Typography>
        <Subtitle variant="body2" color="text.secondary">
          Os turnos abaixo definem o calendário de disponibilidade usado para
          agendamento de consultas.
        </Subtitle>
        <ScheduleManager initialSchedules={schedules} />
      </PageRoot>
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
      <PageRoot>
        <Typography variant="h5" gutterBottom>
          Agenda dos Médicos
        </Typography>
        <Subtitle variant="body2" color="text.secondary">
          Selecione um médico para ver ou editar os turnos.
        </Subtitle>

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
                <DoctorRow variant="outlined">
                  <DoctorAvatar>{getInitials(d.user.name)}</DoctorAvatar>
                  <Box>
                    <BoldText variant="body2">{d.user.name}</BoldText>
                    {d.specialty && (
                      <Typography variant="body2" color="text.secondary">
                        {d.specialty}
                      </Typography>
                    )}
                  </Box>
                  <ChevronIcon />
                </DoctorRow>
              </Link>
            ))}
          </Stack>
        )}
      </PageRoot>
    );
  }

  const schedules = await prisma.doctorSchedule.findMany({
    where: { doctorId: selectedDoctor.id },
    orderBy: [{ dayOfWeek: "asc" }, { startTime: "asc" }],
  });

  return (
    <PageRoot>
      <Link href="/dashboard/agenda" style={{ textDecoration: "none" }}>
        <BackLink variant="body2" color="primary">
          ← Trocar de médico
        </BackLink>
      </Link>
      <Typography variant="h5" gutterBottom>
        Agenda de {selectedDoctor.user.name}
      </Typography>
      <Subtitle variant="body2" color="text.secondary">
        Os turnos abaixo definem o calendário de disponibilidade usado para
        agendamento de consultas.
      </Subtitle>

      <ScheduleManager initialSchedules={schedules} doctorId={selectedDoctor.id} />
    </PageRoot>
  );
}
