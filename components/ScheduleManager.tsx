"use client";

import { useState } from "react";
import {
  Box,
  Paper,
  Typography,
  Button,
  IconButton,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  MenuItem,
  Checkbox,
  FormControlLabel,
  Stack,
} from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import AddIcon from "@mui/icons-material/Add";
import type { DoctorSchedule } from "@prisma/client";

const DAY_LABELS = [
  "Domingo",
  "Segunda-feira",
  "Terça-feira",
  "Quarta-feira",
  "Quinta-feira",
  "Sexta-feira",
  "Sábado",
];

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

export default function ScheduleManager({
  initialSchedules,
  doctorId,
}: {
  initialSchedules: DoctorSchedule[];
  /** Informado quando quem gerencia é o ADMIN editando a agenda de um médico específico. */
  doctorId?: number;
}) {
  const [schedules, setSchedules] = useState(initialSchedules);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [form, setForm] = useState<FormState>(emptyForm);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<DoctorSchedule | null>(null);
  const [deleting, setDeleting] = useState(false);

  function openCreate() {
    setEditingId(null);
    setForm(emptyForm);
    setError(null);
    setDialogOpen(true);
  }

  function openEdit(s: DoctorSchedule) {
    setEditingId(s.id);
    setForm({
      dayOfWeek: s.dayOfWeek,
      startTime: s.startTime,
      endTime: s.endTime,
      hasBreak: !!s.breakStart,
      breakStart: s.breakStart ?? "",
      breakEnd: s.breakEnd ?? "",
    });
    setError(null);
    setDialogOpen(true);
  }

  function sortSchedules(list: DoctorSchedule[]) {
    return [...list].sort(
      (a, b) => a.dayOfWeek - b.dayOfWeek || a.startTime.localeCompare(b.startTime)
    );
  }

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

    const url = editingId ? `/api/doctor/schedule/${editingId}` : "/api/doctor/schedule";
    const method = editingId ? "PATCH" : "POST";

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
    setSchedules((prev) =>
      sortSchedules(
        editingId ? prev.map((s) => (s.id === saved.id ? saved : s)) : [...prev, saved]
      )
    );
    setDialogOpen(false);
  }

  async function confirmDelete() {
    if (!deleteTarget) return;
    setDeleting(true);
    const res = await fetch(`/api/doctor/schedule/${deleteTarget.id}`, { method: "DELETE" });
    setDeleting(false);

    if (res.ok) {
      setSchedules((prev) => prev.filter((s) => s.id !== deleteTarget.id));
      setDeleteTarget(null);
    }
  }

  const byDay = DAY_LABELS.map((label, dayOfWeek) => ({
    label,
    dayOfWeek,
    items: schedules.filter((s) => s.dayOfWeek === dayOfWeek),
  }));

  return (
    <Box>
      <Stack spacing={2}>
        {byDay.map(({ label, dayOfWeek, items }) => (
          <Paper key={dayOfWeek} sx={{ p: 2 }} variant="outlined">
            <Typography variant="subtitle1" gutterBottom>
              {label}
            </Typography>
            {items.length === 0 ? (
              <Typography variant="body2" color="text.secondary">
                Sem turno cadastrado
              </Typography>
            ) : (
              <Stack spacing={1}>
                {items.map((s) => (
                  <Box
                    key={s.id}
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                    }}
                  >
                    <Typography variant="body2">
                      {s.startTime} – {s.endTime}
                      {s.breakStart && s.breakEnd ? ` (pausa ${s.breakStart}–${s.breakEnd})` : ""}
                    </Typography>
                    <Box>
                      <IconButton size="small" onClick={() => openEdit(s)} aria-label="Editar turno">
                        <EditIcon fontSize="small" />
                      </IconButton>
                      <IconButton
                        size="small"
                        onClick={() => setDeleteTarget(s)}
                        aria-label="Remover turno"
                      >
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    </Box>
                  </Box>
                ))}
              </Stack>
            )}
          </Paper>
        ))}
      </Stack>

      <Button startIcon={<AddIcon />} onClick={openCreate} sx={{ mt: 3 }} variant="contained">
        Adicionar turno
      </Button>

      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} fullWidth maxWidth="xs">
        <DialogTitle>{editingId ? "Editar turno" : "Novo turno"}</DialogTitle>
        <DialogContent sx={{ display: "flex", flexDirection: "column", gap: 2, pt: 1 }}>
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
          <Button onClick={() => setDialogOpen(false)}>Cancelar</Button>
          <Button onClick={handleSave} variant="contained" disabled={saving}>
            {saving ? "Salvando..." : "Salvar"}
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog open={!!deleteTarget} onClose={() => setDeleteTarget(null)} fullWidth maxWidth="xs">
        <DialogTitle>Remover turno</DialogTitle>
        <DialogContent>
          {deleteTarget && (
            <Typography variant="body2">
              Remover o turno de {DAY_LABELS[deleteTarget.dayOfWeek]},{" "}
              {deleteTarget.startTime} – {deleteTarget.endTime}?
            </Typography>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteTarget(null)}>Cancelar</Button>
          <Button onClick={confirmDelete} variant="contained" color="error" disabled={deleting}>
            {deleting ? "Removendo..." : "Remover"}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
