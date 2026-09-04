"use client";

import { useState } from "react";
import {
  Alert,
  Button,
  Checkbox,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControlLabel,
  MenuItem,
  TextField,
} from "@mui/material";
import type { DoctorSchedule } from "@prisma/client";
import { DAY_LABELS } from "@/lib/dayLabels";

type FormState = {
  dayOfWeek: number;
  startTime: string;
  endTime: string;
  hasBreak: boolean;
  breakStart: string;
  breakEnd: string;
};

const emptyForm: FormState = {
  dayOfWeek: 1,
  startTime: "08:00",
  endTime: "12:00",
  hasBreak: false,
  breakStart: "",
  breakEnd: "",
};

/** Assume que o componente é remontado (via `key`) toda vez que o dialog abre —
 *  ver ScheduleManager, que muda a key entre aberturas para garantir estado limpo. */
export default function ScheduleFormDialog({
  open,
  editing,
  doctorId,
  onClose,
  onSaved,
}: {
  open: boolean;
  /** Turno sendo editado, ou null quando é criação de um novo turno. */
  editing: DoctorSchedule | null;
  /** Informado quando quem gerencia é o ADMIN editando a agenda de um médico específico. */
  doctorId?: number;
  onClose: () => void;
  onSaved: (saved: DoctorSchedule, wasEditing: boolean) => void;
}) {
  const [form, setForm] = useState<FormState>(() =>
    editing
      ? {
          dayOfWeek: editing.dayOfWeek,
          startTime: editing.startTime,
          endTime: editing.endTime,
          hasBreak: !!editing.breakStart,
          breakStart: editing.breakStart ?? "",
          breakEnd: editing.breakEnd ?? "",
        }
      : emptyForm
  );
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  async function handleSave() {
    setSaving(true);
    setError(null);

    const payload = {
      dayOfWeek: form.dayOfWeek,
      startTime: form.startTime,
      endTime: form.endTime,
      breakStart: form.hasBreak ? form.breakStart : null,
      breakEnd: form.hasBreak ? form.breakEnd : null,
      ...(doctorId ? { doctorId } : {}),
    };

    const url = editing ? `/api/doctor/schedule/${editing.id}` : "/api/doctor/schedule";
    const method = editing ? "PATCH" : "POST";

    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    setSaving(false);

    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setError(data.error ?? "Não foi possível salvar o turno");
      return;
    }

    const saved: DoctorSchedule = await res.json();
    onSaved(saved, !!editing);
  }

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="xs">
      <DialogTitle>{editing ? "Editar turno" : "Novo turno"}</DialogTitle>
      {/* "&&" força a especificidade: o MUI zera o padding-top do DialogContent
       *  quando ele vem logo após um DialogTitle, e um sx normal perde pra essa regra. */}
      <DialogContent sx={{ display: "flex", flexDirection: "column", gap: 2, "&&": { pt: 2.5 } }}>
        {error && <Alert severity="error">{error}</Alert>}
        <TextField
          select
          label="Dia da semana"
          value={form.dayOfWeek}
          onChange={(e) => setForm({ ...form, dayOfWeek: Number(e.target.value) })}
        >
          {DAY_LABELS.map((label, i) => (
            <MenuItem key={i} value={i}>
              {label}
            </MenuItem>
          ))}
        </TextField>
        <TextField
          label="Início"
          type="time"
          value={form.startTime}
          onChange={(e) => setForm({ ...form, startTime: e.target.value })}
          slotProps={{ inputLabel: { shrink: true } }}
        />
        <TextField
          label="Fim"
          type="time"
          value={form.endTime}
          onChange={(e) => setForm({ ...form, endTime: e.target.value })}
          slotProps={{ inputLabel: { shrink: true } }}
        />
        <FormControlLabel
          control={
            <Checkbox
              checked={form.hasBreak}
              onChange={(e) => setForm({ ...form, hasBreak: e.target.checked })}
            />
          }
          label="Tem pausa (almoço, intervalo)"
        />
        {form.hasBreak && (
          <>
            <TextField
              label="Início da pausa"
              type="time"
              value={form.breakStart}
              onChange={(e) => setForm({ ...form, breakStart: e.target.value })}
              slotProps={{ inputLabel: { shrink: true } }}
            />
            <TextField
              label="Fim da pausa"
              type="time"
              value={form.breakEnd}
              onChange={(e) => setForm({ ...form, breakEnd: e.target.value })}
              slotProps={{ inputLabel: { shrink: true } }}
            />
          </>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancelar</Button>
        <Button onClick={handleSave} variant="contained" disabled={saving}>
          {saving ? "Salvando..." : "Salvar"}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
