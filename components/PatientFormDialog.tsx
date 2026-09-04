"use client";

import { useState } from "react";
import {
  Alert,
  Box,
  Button,
  Checkbox,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  TextField,
  Typography,
} from "@mui/material";
import type { Patient } from "@prisma/client";
import { formatCPF } from "@/lib/cpf";
import { formatPhone } from "@/lib/masks";
import { toDateInputValue } from "@/lib/formatDate";

type FormState = {
  name: string;
  cpf: string;
  birthDate: string;
  phone: string;
  email: string;
  consent: boolean;
};

const emptyForm: FormState = {
  name: "",
  cpf: "",
  birthDate: "",
  phone: "",
  email: "",
  consent: false,
};

/** Assume que o componente é remontado (via `key`) toda vez que o dialog abre —
 *  ver PatientsManager, que muda a key entre aberturas para garantir estado limpo. */
export default function PatientFormDialog({
  open,
  editing,
  onClose,
  onSaved,
}: {
  open: boolean;
  /** Paciente sendo editado, ou null quando é cadastro de um novo paciente. */
  editing: Patient | null;
  onClose: () => void;
  onSaved: (saved: Patient, wasEditing: boolean) => void;
}) {
  const [form, setForm] = useState<FormState>(() =>
    editing
      ? {
          name: editing.name,
          cpf: editing.cpf,
          birthDate: toDateInputValue(editing.birthDate),
          phone: editing.phone ?? "",
          email: editing.email ?? "",
          consent: editing.consent,
        }
      : emptyForm
  );
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  async function handleSave() {
    setSaving(true);
    setError(null);

    const payload = {
      name: form.name,
      cpf: form.cpf,
      birthDate: form.birthDate,
      phone: form.phone || null,
      email: form.email || null,
      consent: form.consent,
    };

    const url = editing ? `/api/patients/${editing.id}` : "/api/patients";
    const method = editing ? "PATCH" : "POST";

    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    setSaving(false);

    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setError(data.error ?? "Não foi possível salvar o paciente");
      return;
    }

    const saved: Patient = await res.json();
    // fetch/JSON não revive Date — sem isso, birthDate chega como string e quebra
    // formatDateBR (que espera um Date de verdade) ao renderizar a linha na tabela.
    saved.birthDate = new Date(saved.birthDate);
    onSaved(saved, !!editing);
  }

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>{editing ? "Editar paciente" : "Novo Paciente"}</DialogTitle>
      <DialogContent sx={{ display: "flex", flexDirection: "column", gap: 2, pt: 1 }}>
        <Typography variant="body2" color="text.secondary">
          Os dados abaixo ficam vinculados ao prontuário do paciente.
        </Typography>
        {error && <Alert severity="error">{error}</Alert>}
        <TextField
          label="Nome completo"
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
        />
        <Box sx={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 2 }}>
          <TextField
            label="CPF"
            value={form.cpf}
            onChange={(e) => setForm({ ...form, cpf: formatCPF(e.target.value) })}
            placeholder="000.000.000-00"
          />
          <TextField
            label="Data de nascimento"
            type="date"
            value={form.birthDate}
            onChange={(e) => setForm({ ...form, birthDate: e.target.value })}
            slotProps={{ inputLabel: { shrink: true } }}
          />
        </Box>
        <Box sx={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 2 }}>
          <TextField
            label="Telefone"
            value={form.phone}
            onChange={(e) => setForm({ ...form, phone: formatPhone(e.target.value) })}
            placeholder="(00) 00000-0000"
          />
          <TextField
            label="E-mail"
            type="email"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
          />
        </Box>

        <Box
          sx={{
            bgcolor: "background.default",
            border: 1,
            borderColor: "divider",
            borderRadius: 1,
            p: 1.75,
            display: "flex",
            gap: 1.5,
          }}
        >
          <Checkbox
            checked={form.consent}
            onChange={(e) => setForm({ ...form, consent: e.target.checked })}
            sx={{ p: 0, mt: 0.25 }}
          />
          <Box>
            <Typography variant="body2" sx={{ fontWeight: 500 }}>
              Paciente consentiu com o tratamento de dados (LGPD)
            </Typography>
            <Typography variant="caption" color="text.secondary">
              Necessário para armazenar prontuário, exames e histórico de consultas.
            </Typography>
          </Box>
        </Box>
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
