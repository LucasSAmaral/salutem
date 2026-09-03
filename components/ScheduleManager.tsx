"use client";

import { useState } from "react";
import { Box, Paper, Typography, Button, IconButton, Stack } from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import AddIcon from "@mui/icons-material/Add";
import type { DoctorSchedule } from "@prisma/client";
import { DAY_LABELS } from "@/lib/dayLabels";
import ScheduleFormDialog from "@/components/ScheduleFormDialog";
import DeleteScheduleDialog from "@/components/DeleteScheduleDialog";

export default function ScheduleManager({
  initialSchedules,
  doctorId,
}: {
  initialSchedules: DoctorSchedule[];
  /** Informado quando quem gerencia é o ADMIN editando a agenda de um médico específico. */
  doctorId?: number;
}) {
  const [schedules, setSchedules] = useState(initialSchedules);
  const [formOpen, setFormOpen] = useState(false);
  const [editingSchedule, setEditingSchedule] = useState<DoctorSchedule | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<DoctorSchedule | null>(null);

  function openCreate() {
    setEditingSchedule(null);
    setFormOpen(true);
  }

  function openEdit(s: DoctorSchedule) {
    setEditingSchedule(s);
    setFormOpen(true);
  }

  function sortSchedules(list: DoctorSchedule[]) {
    return [...list].sort(
      (a, b) => a.dayOfWeek - b.dayOfWeek || a.startTime.localeCompare(b.startTime)
    );
  }

  function handleSaved(saved: DoctorSchedule, wasEditing: boolean) {
    setSchedules((prev) =>
      sortSchedules(wasEditing ? prev.map((s) => (s.id === saved.id ? saved : s)) : [...prev, saved])
    );
    setFormOpen(false);
  }

  function handleDeleted(id: number) {
    setSchedules((prev) => prev.filter((s) => s.id !== id));
    setDeleteTarget(null);
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

      <ScheduleFormDialog
        key={formOpen ? (editingSchedule?.id ?? "new") : "closed"}
        open={formOpen}
        editing={editingSchedule}
        doctorId={doctorId}
        onClose={() => setFormOpen(false)}
        onSaved={handleSaved}
      />

      <DeleteScheduleDialog
        target={deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onDeleted={handleDeleted}
      />
    </Box>
  );
}
