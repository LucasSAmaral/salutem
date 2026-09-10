"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import { Alert, Button, TextField, Typography } from "@mui/material";
import {
  BrandName,
  FormBox,
  FormContainer,
  FormPanel,
  HeroBrand,
  HeroCircleLarge,
  HeroCircleSmall,
  HeroPanel,
  HeroSpacer,
  LogoBadge,
  PageRoot,
  Subtitle,
  Tagline,
} from "./LoginForm.styles";

export default function LoginForm() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const result = await signIn("credentials", {
      email,
      password,
      redirect: false,
    });

    setLoading(false);

    if (result?.error) {
      setError("E-mail ou senha inválidos");
      return;
    }

    router.push("/dashboard");
  }

  return (
    <PageRoot>
      <HeroPanel>
        <HeroCircleLarge />
        <HeroCircleSmall />

        <HeroBrand>
          <LogoBadge>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth={2} strokeLinecap="round">
              <path d="M12 3v18M3 12h18" />
            </svg>
          </LogoBadge>
          <BrandName variant="h6">Salutem</BrandName>
        </HeroBrand>

        <Tagline>
          Gestão de agenda, fila e prontuário para a sua clínica — tudo em um só lugar.
        </Tagline>

        <HeroSpacer />
      </HeroPanel>

      <FormPanel>
        <FormContainer>
          <Typography variant="h5" component="h1" gutterBottom>
            Acesse sua conta
          </Typography>
          <Subtitle variant="body2" color="text.secondary">
            Entre com o e-mail e senha cadastrados pela sua clínica.
          </Subtitle>

          <FormBox component="form" onSubmit={handleSubmit}>
            {error && <Alert severity="error">{error}</Alert>}

            <TextField
              label="E-mail"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              fullWidth
            />
            <TextField
              label="Senha"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              fullWidth
            />
            <Button type="submit" variant="contained" size="large" disabled={loading}>
              {loading ? "Entrando..." : "Entrar"}
            </Button>
          </FormBox>
        </FormContainer>
      </FormPanel>
    </PageRoot>
  );
}
