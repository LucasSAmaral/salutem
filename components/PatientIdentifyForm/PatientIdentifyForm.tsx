"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Alert, Button, TextField, Typography } from "@mui/material";
import { formatCPF } from "@/lib/cpf";
import { FormBox, Root, Subtitle } from "./PatientIdentifyForm.styles";

export default function PatientIdentifyForm({ clinicSlug }: { clinicSlug: string }) {
  const router = useRouter();
  const [cpf, setCpf] = useState("");
  const [birthDate, setBirthDate] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const res = await fetch("/api/patient/auth", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ clinicSlug, cpf, birthDate }),
    });

    setLoading(false);

    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setError(data.error ?? "Não foi possível confirmar seus dados.");
      return;
    }

    router.refresh();
  }

  return (
    <Root>
      <Typography variant="h5" gutterBottom>
        Identifique-se
      </Typography>
      <Subtitle variant="body2" color="text.secondary">
        Confirme seu CPF e data de nascimento pra continuar.
      </Subtitle>

      <FormBox component="form" onSubmit={handleSubmit}>
        {error && <Alert severity="error">{error}</Alert>}
        <TextField
          label="CPF"
          value={cpf}
          onChange={(e) => setCpf(formatCPF(e.target.value))}
          placeholder="000.000.000-00"
          required
          fullWidth
        />
        <TextField
          label="Data de nascimento"
          type="date"
          value={birthDate}
          onChange={(e) => setBirthDate(e.target.value)}
          slotProps={{ inputLabel: { shrink: true } }}
          required
          fullWidth
        />
        <Button type="submit" variant="contained" size="large" disabled={loading}>
          {loading ? "Verificando..." : "Continuar"}
        </Button>
      </FormBox>
    </Root>
  );
}
