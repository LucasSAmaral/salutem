"use client";

import { useEffect, useMemo, useState } from "react";
import { Alert, Box, Button, CircularProgress, Typography } from "@mui/material";
import CheckIcon from "@mui/icons-material/Check";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import { getInitials } from "@/lib/initials";
import { formatDateBR } from "@/lib/formatDate";
import {
  ConfirmBar,
  ConfirmSummary,
  DayPill,
  DayScroll,
  DoctorAvatar,
  DoctorCard,
  DoctorCheck,
  DoctorInfo,
  DoctorName,
  DoctorSpec,
  DowLabel,
  LoadingRow,
  Root,
  SlotCell,
  SlotGrid,
  StepBlock,
  StepLabel,
  Subtitle,
} from "./PatientAppointmentBooking.styles";

type DoctorOption = { id: number; name: string; specialty: string | null };

const DOW_LABELS = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];
const DAYS_AHEAD = 10;

function todayDateStr(): string {
  return new Date().toISOString().slice(0, 10);
}

function buildDayOptions() {
  const days: { dateStr: string; dow: string; dayNum: number }[] = [];
  const base = new Date(`${todayDateStr()}T00:00:00.000Z`);
  for (let i = 0; i < DAYS_AHEAD; i++) {
    const d = new Date(base);
    d.setUTCDate(base.getUTCDate() + i);
    days.push({
      dateStr: d.toISOString().slice(0, 10),
      dow: DOW_LABELS[d.getUTCDay()],
      dayNum: d.getUTCDate(),
    });
  }
  return days;
}

export default function PatientAppointmentBooking({ doctors }: { doctors: DoctorOption[] }) {
  const days = useMemo(() => buildDayOptions(), []);

  const [doctorId, setDoctorId] = useState<number | null>(doctors[0]?.id ?? null);
  const [dateStr, setDateStr] = useState(days[0]?.dateStr ?? todayDateStr());
  const [slots, setSlots] = useState<string[]>([]);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    if (!doctorId || !dateStr) return;
    let cancelled = false;
    setLoadingSlots(true);
    setSelectedTime(null);
    fetch(`/api/patient/availability?doctorId=${doctorId}&date=${dateStr}`)
      .then((res) => res.json())
      .then((data) => {
        if (!cancelled) setSlots(data.slots ?? []);
      })
      .finally(() => {
        if (!cancelled) setLoadingSlots(false);
      });
    return () => {
      cancelled = true;
    };
  }, [doctorId, dateStr]);

  const selectedDoctor = doctors.find((d) => d.id === doctorId) ?? null;
  const selectedDay = days.find((d) => d.dateStr === dateStr) ?? null;
  const selectedDateShort = dateStr.split("-").reverse().slice(0, 2).join("/");
  const canConfirm = !!doctorId && !!dateStr && !!selectedTime && !saving;

  function refreshSlots() {
    if (!doctorId) return;
    fetch(`/api/patient/availability?doctorId=${doctorId}&date=${dateStr}`)
      .then((r) => r.json())
      .then((data) => setSlots(data.slots ?? []));
  }

  async function handleConfirm() {
    if (!canConfirm) return;
    setSaving(true);
    setError(null);
    setSuccess(null);

    const res = await fetch("/api/patient/appointments", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ doctorId, date: dateStr, time: selectedTime }),
    });

    setSaving(false);

    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setError(data.error ?? "Não foi possível marcar a consulta");
      // horário pode ter sido tomado por outra pessoa enquanto essa tela estava aberta
      refreshSlots();
      return;
    }

    setSuccess(
      `Consulta marcada com ${selectedDoctor?.name} em ${formatDateBR(
        new Date(`${dateStr}T00:00:00.000Z`)
      )} às ${selectedTime}.`
    );
    setSelectedTime(null);
    refreshSlots();
  }

  return (
    <Root>
      <Box>
        <Typography variant="h5" gutterBottom>
          Agendar Consulta
        </Typography>
        <Subtitle variant="body2" color="text.secondary">
          Escolha o médico, o dia e o horário que funcionam melhor para você.
        </Subtitle>
      </Box>

      {error && <Alert severity="error">{error}</Alert>}
      {success && <Alert severity="success">{success}</Alert>}

      <StepBlock>
        <StepLabel>Médico</StepLabel>
        {doctors.length === 0 ? (
          <Typography variant="body2" color="text.secondary">
            Nenhum médico disponível pra agendamento no momento.
          </Typography>
        ) : (
          doctors.map((d) => {
            const selected = doctorId === d.id;
            return (
              <DoctorCard key={d.id} selected={selected} onClick={() => setDoctorId(d.id)}>
                <DoctorAvatar selected={selected}>{getInitials(d.name)}</DoctorAvatar>
                <DoctorInfo>
                  <DoctorName variant="body2">{d.name}</DoctorName>
                  {d.specialty && <DoctorSpec>{d.specialty}</DoctorSpec>}
                </DoctorInfo>
                {selected && (
                  <DoctorCheck>
                    <CheckIcon fontSize="small" />
                  </DoctorCheck>
                )}
              </DoctorCard>
            );
          })
        )}
      </StepBlock>

      <StepBlock>
        <StepLabel>Dia</StepLabel>
        <DayScroll>
          {days.map((d) => (
            <DayPill key={d.dateStr} selected={dateStr === d.dateStr} onClick={() => setDateStr(d.dateStr)}>
              <DowLabel selected={dateStr === d.dateStr}>{d.dow}</DowLabel>
              {d.dayNum}
            </DayPill>
          ))}
        </DayScroll>
      </StepBlock>

      <StepBlock>
        <StepLabel>Horário</StepLabel>
        {loadingSlots ? (
          <LoadingRow>
            <CircularProgress size={16} />
            <Typography variant="body2" color="text.secondary">
              Carregando horários...
            </Typography>
          </LoadingRow>
        ) : slots.length === 0 ? (
          <Typography variant="body2" color="text.secondary">
            Nenhum horário livre nessa data para o médico selecionado.
          </Typography>
        ) : (
          <SlotGrid>
            {slots.map((time) => (
              <SlotCell key={time} selected={selectedTime === time} onClick={() => setSelectedTime(time)}>
                {time}
              </SlotCell>
            ))}
          </SlotGrid>
        )}
      </StepBlock>

      <ConfirmBar>
        <ConfirmSummary>
          {selectedDoctor && selectedTime && selectedDay ? (
            <>
              {selectedDoctor.name} ·{" "}
              <b>
                {selectedDay.dow}, {selectedDateShort} às {selectedTime}
              </b>
            </>
          ) : (
            "Selecione médico, dia e horário para confirmar."
          )}
        </ConfirmSummary>
        <Button
          fullWidth
          variant="contained"
          size="large"
          endIcon={saving ? undefined : <ArrowForwardIcon />}
          disabled={!canConfirm}
          onClick={handleConfirm}
        >
          {saving ? "Agendando..." : "Confirmar Agendamento"}
        </Button>
      </ConfirmBar>
    </Root>
  );
}
