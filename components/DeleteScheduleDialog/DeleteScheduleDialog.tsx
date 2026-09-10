"use client";

import { useState } from "react";
import { Button, Dialog, DialogActions, DialogContent, DialogTitle, Typography } from "@mui/material";
import type { DoctorSchedule } from "@prisma/client";
import { DAY_LABELS } from "@/lib/dayLabels";

export default function DeleteScheduleDialog({
  target,
  onClose,
  onDeleted,
}: {
  /** Turno a remover, ou null quando o dialog está fechado. */
  target: DoctorSchedule | null;
  onClose: () => void;
  onDeleted: (id: number) => void;
}) {
  const [deleting, setDeleting] = useState(false);

  async function confirmDelete() {
    if (!target) return;
    setDeleting(true);
    const res = await fetch(`/api/doctor/schedule/${target.id}`, { method: "DELETE" });
    setDeleting(false);

    if (res.ok) {
      onDeleted(target.id);
    }
  }

  return (
    <Dialog open={!!target} onClose={onClose} fullWidth maxWidth="xs">
      <DialogTitle>Remover turno</DialogTitle>
      <DialogContent>
        {target && (
          <Typography variant="body2">
            Remover o turno de {DAY_LABELS[target.dayOfWeek]}, {target.startTime} –{" "}
            {target.endTime}?
          </Typography>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancelar</Button>
        <Button onClick={confirmDelete} variant="contained" color="error" disabled={deleting}>
          {deleting ? "Removendo..." : "Remover"}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
