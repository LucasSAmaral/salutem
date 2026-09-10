"use client";

import { useState } from "react";
import { Alert, Button, Dialog, DialogActions, DialogTitle, Typography } from "@mui/material";
import { ConfirmDialogContent } from "./CancelAppointmentDialog.styles";

export type CancelTarget = {
  id: number;
  doctorName: string;
  dateLabel: string;
};

export default function CancelAppointmentDialog({
  target,
  onClose,
  onCancelled,
}: {
  /** Consulta a cancelar, ou null quando o dialog está fechado. */
  target: CancelTarget | null;
  onClose: () => void;
  onCancelled: (id: number) => void;
}) {
  const [cancelling, setCancelling] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function confirmCancel() {
    if (!target) return;
    setCancelling(true);
    setError(null);

    const res = await fetch(`/api/patient/appointments/${target.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "cancel" }),
    });

    setCancelling(false);

    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setError(data.error ?? "Não foi possível cancelar a consulta");
      return;
    }

    onCancelled(target.id);
  }

  return (
    <Dialog open={!!target} onClose={onClose} fullWidth maxWidth="xs">
      <DialogTitle>Cancelar consulta</DialogTitle>
      <ConfirmDialogContent>
        {error && <Alert severity="error">{error}</Alert>}
        {target && (
          <Typography variant="body2">
            Cancelar a consulta com {target.doctorName} em {target.dateLabel}? Essa ação não pode
            ser desfeita.
          </Typography>
        )}
      </ConfirmDialogContent>
      <DialogActions>
        <Button onClick={onClose}>Voltar</Button>
        <Button onClick={confirmCancel} variant="contained" color="error" disabled={cancelling}>
          {cancelling ? "Cancelando..." : "Cancelar consulta"}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
