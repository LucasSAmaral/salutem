"use client";

import { Button, Typography } from "@mui/material";
import type { ExpectedArrival } from "@/lib/queue";
import StatusChip from "@/components/StatusChip/StatusChip";
import {
  PatientInfo,
  PatientName,
  QueueRow,
  RowActions,
  SectionLabel,
} from "@/components/QueueBoard/QueueBoard.styles";
import { EmptyText } from "./ExpectedArrivals.styles";

/** Chave de "ocupado" de uma linha desta seção; o `QueueBoard` guarda uma só
 *  chave por vez, compartilhada com as linhas da fila. */
export const arrivalBusyKey = (arrival: ExpectedArrival): string =>
  `arrival-${arrival.appointmentId}`;

/** Consultas de hoje ainda sem chegada confirmada. A atendente confirma aqui
 *  quando o paciente chega, e ele entra no fim da fila do médico. */
export default function ExpectedArrivals({
  arrivals,
  busyKey,
  onConfirm,
}: {
  arrivals: ExpectedArrival[];
  busyKey: string | null;
  onConfirm: (arrival: ExpectedArrival) => void;
}) {
  return (
    <>
      <SectionLabel variant="body2" color="text.secondary">
        Aguardando chegada
      </SectionLabel>

      {arrivals.length === 0 && (
        <EmptyText color="text.secondary">
          Nenhuma consulta de hoje aguardando a chegada do paciente.
        </EmptyText>
      )}

      {arrivals.map((arrival) => (
        <QueueRow key={arrival.appointmentId}>
          <PatientInfo>
            <PatientName variant="body2">{arrival.patient.name}</PatientName>
            <Typography variant="caption" color="text.secondary">
              {arrival.isWalkIn ? "encaixe" : "agendado"} {arrival.scheduledTime} ·{" "}
              {arrival.doctor.name}
            </Typography>
          </PatientInfo>

          <RowActions>
            {arrival.isWalkIn && <StatusChip status="WALK_IN" />}
            <Button
              size="small"
              variant="contained"
              disabled={busyKey === arrivalBusyKey(arrival)}
              onClick={() => onConfirm(arrival)}
            >
              Confirmar chegada
            </Button>
          </RowActions>
        </QueueRow>
      ))}
    </>
  );
}
