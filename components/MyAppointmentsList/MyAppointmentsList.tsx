"use client";

import { useState } from "react";
import { Typography } from "@mui/material";
import CalendarMonthOutlinedIcon from "@mui/icons-material/CalendarMonthOutlined";
import type { AppointmentStatus } from "@prisma/client";
import StatusChip from "@/components/StatusChip/StatusChip";
import CancelAppointmentDialog, {
  type CancelTarget,
} from "@/components/CancelAppointmentDialog/CancelAppointmentDialog";
import { formatDateBR } from "@/lib/formatDate";
import { extractTime } from "@/lib/availability";
import {
  AppointmentCard,
  AppointmentDate,
  AppointmentIcon,
  AppointmentInfo,
  AppointmentTopRow,
  CancelButton,
  CancelRow,
  DoctorName,
  Root,
  Subtitle,
} from "./MyAppointmentsList.styles";

export type AppointmentItem = {
  id: number;
  date: string;
  status: AppointmentStatus;
  doctorName: string;
  specialty: string | null;
};

export default function MyAppointmentsList({
  initialAppointments,
}: {
  initialAppointments: AppointmentItem[];
}) {
  const [appointments, setAppointments] = useState(initialAppointments);
  const [cancelTarget, setCancelTarget] = useState<CancelTarget | null>(null);

  function handleCancelled(id: number) {
    setAppointments((prev) =>
      prev.map((a) => (a.id === id ? { ...a, status: "CANCELLED" as AppointmentStatus } : a))
    );
    setCancelTarget(null);
  }

  return (
    <Root>
      <Typography variant="h5" gutterBottom>
        Meus Agendamentos
      </Typography>
      <Subtitle variant="body2" color="text.secondary">
        Suas consultas marcadas nesta clínica.
      </Subtitle>

      {appointments.length === 0 ? (
        <Typography variant="body2" color="text.secondary">
          Você ainda não tem consultas marcadas.
        </Typography>
      ) : (
        appointments.map((a) => {
          const date = new Date(a.date);
          const dateLabel = `${formatDateBR(date)} às ${extractTime(date)}`;
          return (
            <AppointmentCard key={a.id}>
              <AppointmentTopRow>
                <AppointmentIcon>
                  <CalendarMonthOutlinedIcon fontSize="small" />
                </AppointmentIcon>
                <AppointmentInfo>
                  <DoctorName variant="body2">{a.doctorName}</DoctorName>
                  {a.specialty && (
                    <Typography variant="caption" color="text.secondary">
                      {a.specialty}
                    </Typography>
                  )}
                  <AppointmentDate variant="body2">{dateLabel}</AppointmentDate>
                </AppointmentInfo>
                <StatusChip status={a.status} />
              </AppointmentTopRow>
              {a.status === "SCHEDULED" && (
                <CancelRow>
                  <CancelButton
                    size="small"
                    color="error"
                    onClick={() => setCancelTarget({ id: a.id, doctorName: a.doctorName, dateLabel })}
                  >
                    Cancelar consulta
                  </CancelButton>
                </CancelRow>
              )}
            </AppointmentCard>
          );
        })
      )}

      <CancelAppointmentDialog
        target={cancelTarget}
        onClose={() => setCancelTarget(null)}
        onCancelled={handleCancelled}
      />
    </Root>
  );
}
