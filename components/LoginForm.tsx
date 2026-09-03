"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import { Box, Button, TextField, Typography, Alert } from "@mui/material";
import { alpha } from "@mui/material/styles";

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
    <Box sx={{ display: "flex", minHeight: "100vh" }}>
      <Box
        sx={{
          display: { xs: "none", md: "flex" },
          flexDirection: "column",
          justifyContent: "space-between",
          width: 420,
          flexShrink: 0,
          p: 6,
          bgcolor: "primary.main",
          color: "primary.contrastText",
          position: "relative",
          overflow: "hidden",
        }}
      >
        <Box
          sx={{
            position: "absolute",
            right: -120,
            bottom: -140,
            width: 420,
            height: 420,
            borderRadius: "50%",
            bgcolor: (theme) => alpha(theme.palette.common.white, 0.06),
          }}
        />
        <Box
          sx={{
            position: "absolute",
            right: 40,
            top: -80,
            width: 220,
            height: 220,
            borderRadius: "50%",
            bgcolor: (theme) => alpha(theme.palette.common.white, 0.05),
          }}
        />

        <Box sx={{ position: "relative" }}>
          <Box
            sx={{
              width: 44,
              height: 44,
              borderRadius: 2,
              bgcolor: (theme) => alpha(theme.palette.common.white, 0.16),
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth={2} strokeLinecap="round">
              <path d="M12 3v18M3 12h18" />
            </svg>
          </Box>
          <Typography variant="h6" sx={{ mt: 1.75, fontWeight: 700, letterSpacing: "-0.2px" }}>
            Salutem
          </Typography>
        </Box>

        <Typography sx={{ position: "relative", fontSize: 26, lineHeight: 1.4, maxWidth: 320 }}>
          Gestão de agenda, fila e prontuário para a sua clínica — tudo em um só lugar.
        </Typography>

        <Box sx={{ position: "relative" }} />
      </Box>

      <Box sx={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", px: 2 }}>
        <Box sx={{ width: "100%", maxWidth: 380 }}>
          <Typography variant="h5" component="h1" gutterBottom>
            Acesse sua conta
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 4 }}>
            Entre com o e-mail e senha cadastrados pela sua clínica.
          </Typography>

          <Box component="form" onSubmit={handleSubmit} sx={{ display: "flex", flexDirection: "column", gap: 2.5 }}>
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
          </Box>
        </Box>
      </Box>
    </Box>
  );
}
