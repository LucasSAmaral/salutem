"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Alert,
  Box,
  Button,
  Chip,
  CircularProgress,
  InputAdornment,
  Stack,
  Typography,
} from "@mui/material";
import CheckIcon from "@mui/icons-material/Check";
import AddIcon from "@mui/icons-material/Add";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import type { Doctor, Patient, User } from "@prisma/client";
import { getInitials } from "@/lib/initials";
import { onlyDigits } from "@/lib/cpf";
import { formatDateBR } from "@/lib/formatDate";
import StatusChip from "@/components/StatusChip/StatusChip";
import {
  ChipAvatarSm,
  DayCell,
  DaysRow,
  DividerLine,
  DividerRow,
  DoctorChipsRow,
  DowLabel,
  FooterBar,
  GrowBox,
  LoadingRow,
  MediumText,
  NoDoctorsText,
  NoResultsText,
  PatientAvatarLg,
  PatientAvatarSm,
  PatientSearchField,
  Root,
  SearchIconMuted,
  SearchWrapper,
  SelectedPatientCard,
  SlotCell,
  SlotsGrid,
  SlotsWrapper,
  SuggestionDivider,
  SuggestionRow,
  SuggestionsPaper,
  WalkInConfirmRow,
  WalkInRow,
  WalkInTimeField,
} from "./AppointmentBooking.styles";

type DoctorWithUser = Doctor & { user: User };

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

export default function AppointmentBooking({
  doctors,
  patients,
}: {
  doctors: DoctorWithUser[];
  patients: Patient[];
}) {
  const days = useMemo(buildDayOptions, []);

  const [query, setQuery] = useState("");
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  const [doctorId, setDoctorId] = useState<number | null>(doctors[0]?.id ?? null);
  const [dateStr, setDateStr] = useState(days[0]?.dateStr ?? todayDateStr());
  const [slots, setSlots] = useState<string[]>([]);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [isWalkIn, setIsWalkIn] = useState(false);
  const [walkInTime, setWalkInTime] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const filteredPatients = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return [];
    const qDigits = onlyDigits(q);
    return patients
      .filter((p) => p.name.toLowerCase().includes(q) || (qDigits && onlyDigits(p.cpf).includes(qDigits)))
      .slice(0, 6);
  }, [patients, query]);

  useEffect(() => {
    if (!doctorId || !dateStr) {
      setSlots([]);
      return;
    }
    let cancelled = false;
    setLoadingSlots(true);
    setSelectedTime(null);
    setIsWalkIn(false);
    fetch(`/api/appointments/availability?doctorId=${doctorId}&date=${dateStr}`)
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

  function selectPatient(p: Patient) {
    setSelectedPatient(p);
    setQuery("");
  }

  function selectSlot(time: string) {
    setSelectedTime(time);
    setIsWalkIn(false);
  }

  function addWalkIn() {
    if (!walkInTime) return;
    setSelectedTime(walkInTime);
    setIsWalkIn(true);
  }

  const selectedDoctor = doctors.find((d) => d.id === doctorId) ?? null;
  const selectedDay = days.find((d) => d.dateStr === dateStr) ?? null;
  const selectedDateShort = dateStr.split("-").reverse().slice(0, 2).join("/");

  const canConfirm = !!selectedPatient && !!doctorId && !!dateStr && !!selectedTime && !saving;

  async function handleConfirm() {
    if (!canConfirm) return;
    setSaving(true);
    setError(null);
    setSuccess(null);

    const res = await fetch("/api/appointments", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        patientId: selectedPatient!.id,
        doctorId,
        date: dateStr,
        time: selectedTime,
        isWalkIn,
      }),
    });

    setSaving(false);

    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setError(data.error ?? "Não foi possível marcar a consulta");
      // horário pode ter sido tomado por outro atendente enquanto essa tela estava aberta
      if (doctorId) {
        fetch(`/api/appointments/availability?doctorId=${doctorId}&date=${dateStr}`)
          .then((r) => r.json())
          .then((data) => setSlots(data.slots ?? []));
      }
      return;
    }

    setSuccess(
      `Consulta marcada: ${selectedPatient!.name} com ${selectedDoctor?.user.name} em ${formatDateBR(
        new Date(`${dateStr}T00:00:00.000Z`)
      )} às ${selectedTime}.`
    );
    setSelectedPatient(null);
    setSelectedTime(null);
    setIsWalkIn(false);
    setWalkInTime("");
    if (doctorId) {
      fetch(`/api/appointments/availability?doctorId=${doctorId}&date=${dateStr}`)
        .then((r) => r.json())
        .then((data) => setSlots(data.slots ?? []));
    }
  }

  return (
    <Root>
      <Box>
        <Typography variant="h5" gutterBottom>
          Novo Agendamento
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Marque uma consulta a partir dos horários livres do médico.
        </Typography>
      </Box>

      {error && <Alert severity="error">{error}</Alert>}
      {success && <Alert severity="success">{success}</Alert>}

      <Box>
        <Typography variant="overline" color="text.secondary">
          Paciente
        </Typography>
        {selectedPatient ? (
          <SelectedPatientCard variant="outlined">
            <PatientAvatarLg>{getInitials(selectedPatient.name)}</PatientAvatarLg>
            <GrowBox>
              <MediumText variant="body2">{selectedPatient.name}</MediumText>
              <Typography variant="caption" color="text.secondary">
                CPF {selectedPatient.cpf} · nasc. {formatDateBR(selectedPatient.birthDate)}
              </Typography>
            </GrowBox>
            <Button size="small" onClick={() => setSelectedPatient(null)}>
              Trocar
            </Button>
          </SelectedPatientCard>
        ) : (
          <SearchWrapper>
            <PatientSearchField
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Buscar paciente por nome ou CPF"
              fullWidth
              slotProps={{
                input: {
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIconMuted fontSize="small" />
                    </InputAdornment>
                  ),
                },
              }}
            />
            {filteredPatients.length > 0 && (
              <SuggestionsPaper variant="outlined">
                <Stack divider={<SuggestionDivider />}>
                  {filteredPatients.map((p) => (
                    <SuggestionRow key={p.id} onClick={() => selectPatient(p)}>
                      <PatientAvatarSm>{getInitials(p.name)}</PatientAvatarSm>
                      <Box>
                        <MediumText variant="body2">{p.name}</MediumText>
                        <Typography variant="caption" color="text.secondary">
                          CPF {p.cpf}
                        </Typography>
                      </Box>
                    </SuggestionRow>
                  ))}
                </Stack>
              </SuggestionsPaper>
            )}
            {query.trim() && filteredPatients.length === 0 && (
              <NoResultsText variant="body2" color="text.secondary">
                Nenhum paciente encontrado.
              </NoResultsText>
            )}
          </SearchWrapper>
        )}
      </Box>

      <Box>
        <Typography variant="overline" color="text.secondary">
          Médico
        </Typography>
        {doctors.length === 0 ? (
          <NoDoctorsText variant="body2" color="text.secondary">
            Nenhum médico cadastrado nesta clínica ainda.
          </NoDoctorsText>
        ) : (
          <DoctorChipsRow direction="row" spacing={1.25}>
            {doctors.map((d) => (
              <Chip
                key={d.id}
                clickable
                onClick={() => setDoctorId(d.id)}
                avatar={<ChipAvatarSm>{getInitials(d.user.name)}</ChipAvatarSm>}
                label={d.user.name}
                color={doctorId === d.id ? "primary" : "default"}
                variant={doctorId === d.id ? "filled" : "outlined"}
              />
            ))}
          </DoctorChipsRow>
        )}
      </Box>

      <Box>
        <Typography variant="overline" color="text.secondary">
          Data
        </Typography>
        <DaysRow direction="row" spacing={1.25}>
          {days.map((d) => (
            <DayCell key={d.dateStr} onClick={() => setDateStr(d.dateStr)} selected={dateStr === d.dateStr}>
              <DowLabel variant="caption" selected={dateStr === d.dateStr}>
                {d.dow}
              </DowLabel>
              <MediumText variant="body2">{d.dayNum}</MediumText>
            </DayCell>
          ))}
        </DaysRow>
      </Box>

      <Box>
        <Typography variant="overline" color="text.secondary">
          Horário disponível
        </Typography>
        <SlotsWrapper>
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
            <SlotsGrid>
              {slots.map((time) => {
                const selected = selectedTime === time && !isWalkIn;
                return (
                  <SlotCell key={time} onClick={() => selectSlot(time)} selected={selected}>
                    {time}
                  </SlotCell>
                );
              })}
            </SlotsGrid>
          )}
        </SlotsWrapper>

        <DividerRow direction="row" spacing={1}>
          <DividerLine />
          <Typography variant="caption" color="text.secondary">
            fora do horário padrão
          </Typography>
          <DividerLine />
        </DividerRow>

        <WalkInRow direction="row" spacing={1.5}>
          <WalkInTimeField
            type="time"
            size="small"
            value={walkInTime}
            onChange={(e) => setWalkInTime(e.target.value)}
          />
          <Button size="small" startIcon={<AddIcon />} onClick={addWalkIn} disabled={!walkInTime}>
            Adicionar encaixe
          </Button>
          {isWalkIn && selectedTime && (
            <WalkInConfirmRow direction="row" spacing={0.75}>
              <StatusChip status="WALK_IN" />
              <Typography variant="body2">{selectedTime}</Typography>
              <CheckIcon fontSize="small" color="primary" />
            </WalkInConfirmRow>
          )}
        </WalkInRow>
      </Box>

      <FooterBar>
        <Typography variant="body2" color="text.secondary">
          {selectedPatient && selectedDoctor && selectedTime && selectedDay ? (
            <>
              {selectedPatient.name} com <b>{selectedDoctor.user.name}</b> em{" "}
              <b>
                {selectedDateShort}, {selectedTime}
              </b>
            </>
          ) : (
            "Selecione paciente, médico, data e horário para confirmar."
          )}
        </Typography>
        <Button
          variant="contained"
          endIcon={saving ? undefined : <ArrowForwardIcon />}
          disabled={!canConfirm}
          onClick={handleConfirm}
        >
          {saving ? "Agendando..." : "Confirmar Agendamento"}
        </Button>
      </FooterBar>
    </Root>
  );
}
