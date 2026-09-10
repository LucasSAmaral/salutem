"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Alert, Button, Checkbox, FormControlLabel, Typography } from "@mui/material";
import { ConsentBox, FormBox, Root, Subtitle } from "./PatientConsentGate.styles";

export default function PatientConsentGate() {
  const router = useRouter();
  const [checked, setChecked] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleAccept() {
    if (!checked) return;
    setLoading(true);
    setError(null);

    const res = await fetch("/api/patient/consent", { method: "PATCH" });

    setLoading(false);

    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setError(data.error ?? "Não foi possível registrar seu consentimento.");
      return;
    }

    router.refresh();
  }

  return (
    <Root>
      <Typography variant="h5" gutterBottom>
        Antes de continuar
      </Typography>
      <Subtitle variant="body2" color="text.secondary">
        Pra agendar e ver suas consultas, precisamos do seu consentimento pra tratar seus dados
        pessoais, conforme a LGPD.
      </Subtitle>

      <FormBox>
        {error && <Alert severity="error">{error}</Alert>}

        <ConsentBox>
          <FormControlLabel
            control={<Checkbox checked={checked} onChange={(e) => setChecked(e.target.checked)} />}
            label="Autorizo o tratamento dos meus dados pessoais (nome, CPF, data de nascimento, contato e histórico de consultas) por esta clínica, conforme a LGPD."
          />
        </ConsentBox>

        <Button
          variant="contained"
          size="large"
          fullWidth
          disabled={!checked || loading}
          onClick={handleAccept}
        >
          {loading ? "Confirmando..." : "Aceitar e continuar"}
        </Button>
      </FormBox>
    </Root>
  );
}
