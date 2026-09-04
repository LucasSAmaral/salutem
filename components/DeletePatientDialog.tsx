"use client";

import { useState } from "react";
import { Alert, Button, Dialog, DialogActions, DialogContent, DialogTitle, Typography } from "@mui/material";
import type { Patient } from "@prisma/client";

export default function DeletePatientDialog({
  target,
  onClose,
  onDeleted,
}: {
  /** Paciente a remover, ou null quando o dialog está fechado. */
  target: Patient | null;
  onClose: () => void;
  onDeleted: (id: number) => void;
}) {
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function confirmDelete() {
    if (!target) return;
    setDeleting(true);
    setError(null);

    const res = await fetch(`/api/patients/${target.id}`, { method: "DELETE" });
    setDeleting(false);

    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setError(data.error ?? "Não foi possível excluir o paciente");
      return;
    }

    onDeleted(target.id);
  }

  return (
    <Dialog open={!!target} onClose={onClose} fullWidth maxWidth="xs">
      <DialogTitle>Excluir paciente</DialogTitle>
      <DialogContent sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
        {error && <Alert severity="error">{error}</Alert>}
        {target && (
          <Typography variant="body2">
            Excluir o cadastro de {target.name}? Essa ação não pode ser desfeita.
          </Typography>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancelar</Button>
        <Button onClick={confirmDelete} variant="contained" color="error" disabled={deleting}>
          {deleting ? "Excluindo..." : "Excluir"}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
