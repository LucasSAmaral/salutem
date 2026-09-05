"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Alert,
  Avatar,
  Box,
  Button,
  Chip,
  CircularProgress,
  InputAdornment,
  Paper,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import CheckIcon from "@mui/icons-material/Check";
import AddIcon from "@mui/icons-material/Add";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import type { Doctor, Patient, User } from "@prisma/client";
import { getInitials } from "@/lib/initials";
import { onlyDigits } from "@/lib/cpf";
import { formatDateBR } from "@/lib/formatDate";
import StatusChip from "@/components/StatusChip";

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
    <Box sx={{ display: "flex", flexDirection: "column", gap: 3.5 }}>
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
          <Paper
            variant="outlined"
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 1.5,
              p: 1.5,
              borderColor: "primary.main",
              borderWidth: 1.5,
            }}
          >
            <Avatar sx={{ width: 36, height: 36, fontSize: 13, bgcolor: "action.selected", color: "primary.dark" }}>
              {getInitials(selectedPatient.name)}
            </Avatar>
            <Box sx={{ flex: 1 }}>
              <Typography variant="body2" sx={{ fontWeight: 500 }}>
                {selectedPatient.name}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                CPF {selectedPatient.cpf} · nasc. {formatDateBR(selectedPatient.birthDate)}
              </Typography>
            </Box>
            <Button size="small" onClick={() => setSelectedPatient(null)}>
              Trocar
            </Button>
          </Paper>
        ) : (
          <Box sx={{ position: "relative" }}>
            <TextField
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Buscar paciente por nome ou CPF"
              fullWidth
              sx={{ mt: 0.5 }}
              slotProps={{
                input: {
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon fontSize="small" sx={{ color: "text.disabled" }} />
                    </InputAdornment>
                  ),
                },
              }}
            />
            {filteredPatients.length > 0 && (
              <Paper variant="outlined" sx={{ mt: 0.5 }}>
                <Stack divider={<Box sx={{ borderBottom: 1, borderColor: "divider" }} />}>
                  {filteredPatients.map((p) => (
                    <Box
                      key={p.id}
                      onClick={() => selectPatient(p)}
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        gap: 1.5,
                        p: 1.5,
                        cursor: "pointer",
                        "&:hover": { bgcolor: "action.hover" },
                      }}
                    >
                      <Avatar sx={{ width: 32, height: 32, fontSize: 12, bgcolor: "action.selected", color: "primary.dark" }}>
                        {getInitials(p.name)}
                      </Avatar>
                      <Box>
                        <Typography variant="body2" sx={{ fontWeight: 500 }}>
                          {p.name}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          CPF {p.cpf}
                        </Typography>
                      </Box>
                    </Box>
                  ))}
                </Stack>
              </Paper>
            )}
            {query.trim() && filteredPatients.length === 0 && (
              <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                Nenhum paciente encontrado.
              </Typography>
            )}
          </Box>
        )}
      </Box>

      <Box>
        <Typography variant="overline" color="text.secondary">
          Médico
        </Typography>
        {doctors.length === 0 ? (
          <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
            Nenhum médico cadastrado nesta clínica ainda.
          </Typography>
        ) : (
          <Stack direction="row" spacing={1.25} sx={{ mt: 0.5, flexWrap: "wrap", rowGap: 1.25 }}>
            {doctors.map((d) => (
              <Chip
                key={d.id}
                clickable
                onClick={() => setDoctorId(d.id)}
                avatar={<Avatar sx={{ fontSize: 11 }}>{getInitials(d.user.name)}</Avatar>}
                label={d.user.name}
                color={doctorId === d.id ? "primary" : "default"}
                variant={doctorId === d.id ? "filled" : "outlined"}
              />
            ))}
          </Stack>
        )}
      </Box>

      <Box>
        <Typography variant="overline" color="text.secondary">
          Data
        </Typography>
        <Stack direction="row" spacing={1.25} sx={{ mt: 0.5, overflowX: "auto", pb: 0.5 }}>
          {days.map((d) => (
            <Box
              key={d.dateStr}
              onClick={() => setDateStr(d.dateStr)}
              sx={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                gap: 0.25,
                width: 56,
                height: 60,
                flexShrink: 0,
                borderRadius: 1,
                border: 1.5,
                borderColor: dateStr === d.dateStr ? "primary.main" : "divider",
                bgcolor: dateStr === d.dateStr ? "primary.main" : "transparent",
                color: dateStr === d.dateStr ? "primary.contrastText" : "text.primary",
                cursor: "pointer",
              }}
            >
              <Typography
                variant="caption"
                sx={{
                  textTransform: "uppercase",
                  color: dateStr === d.dateStr ? "primary.contrastText" : "text.secondary",
                  opacity: dateStr === d.dateStr ? 0.85 : 1,
                }}
              >
                {d.dow}
              </Typography>
              <Typography variant="body2" sx={{ fontWeight: 500 }}>
                {d.dayNum}
              </Typography>
            </Box>
          ))}
        </Stack>
      </Box>

      <Box>
        <Typography variant="overline" color="text.secondary">
          Horário disponível
        </Typography>
        <Box sx={{ mt: 0.5 }}>
          {loadingSlots ? (
            <Box sx={{ display: "flex", alignItems: "center", gap: 1, py: 1 }}>
              <CircularProgress size={16} />
              <Typography variant="body2" color="text.secondary">
                Carregando horários...
              </Typography>
            </Box>
          ) : slots.length === 0 ? (
            <Typography variant="body2" color="text.secondary">
              Nenhum horário livre nessa data para o médico selecionado.
            </Typography>
          ) : (
            <Box
              sx={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fill, minmax(88px, 1fr))",
                gap: 1.25,
              }}
            >
              {slots.map((time) => {
                const selected = selectedTime === time && !isWalkIn;
                return (
                  <Box
                    key={time}
                    onClick={() => selectSlot(time)}
                    sx={{
                      height: 40,
                      borderRadius: 1,
                      border: 1.5,
                      borderColor: selected ? "primary.main" : "divider",
                      bgcolor: selected ? "primary.main" : "transparent",
                      color: selected ? "primary.contrastText" : "text.primary",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: 13,
                      fontWeight: 500,
                      cursor: "pointer",
                    }}
                  >
                    {time}
                  </Box>
                );
              })}
            </Box>
          )}
        </Box>

        <Stack direction="row" spacing={1} sx={{ mt: 2, alignItems: "center" }}>
          <Box sx={{ flex: 1, borderBottom: 1, borderColor: "divider" }} />
          <Typography variant="caption" color="text.secondary">
            fora do horário padrão
          </Typography>
          <Box sx={{ flex: 1, borderBottom: 1, borderColor: "divider" }} />
        </Stack>

        <Stack direction="row" spacing={1.5} sx={{ mt: 1.5, alignItems: "center", flexWrap: "wrap" }}>
          <TextField
            type="time"
            size="small"
            value={walkInTime}
            onChange={(e) => setWalkInTime(e.target.value)}
            sx={{ width: 140 }}
          />
          <Button size="small" startIcon={<AddIcon />} onClick={addWalkIn} disabled={!walkInTime}>
            Adicionar encaixe
          </Button>
          {isWalkIn && selectedTime && (
            <Stack direction="row" spacing={0.75} sx={{ alignItems: "center" }}>
              <StatusChip status="WALK_IN" />
              <Typography variant="body2">{selectedTime}</Typography>
              <CheckIcon fontSize="small" color="primary" />
            </Stack>
          )}
        </Stack>
      </Box>

      <Box
        sx={{
          mt: "auto",
          pt: 2.5,
          borderTop: 1,
          borderColor: "divider",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          flexWrap: "wrap",
          gap: 1.5,
        }}
      >
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
      </Box>
    </Box>
  );
}
