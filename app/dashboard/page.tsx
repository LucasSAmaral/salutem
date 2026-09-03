import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { authOptions } from "@/lib/auth";
import { Box, Paper, Typography, Button } from "@mui/material";

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect("/login");
  }

  return (
    <Box sx={{ p: 4 }}>
      <Paper sx={{ p: 4, maxWidth: 500 }} elevation={2}>
        <Typography variant="h5" gutterBottom>
          Bem-vindo, {session.user.name}
        </Typography>
        <Typography>E-mail: {session.user.email}</Typography>
        <Typography>Perfil: {session.user.role}</Typography>
        <Typography>Clínica: {session.user.clinicSlug}</Typography>

        {session.user.role === "DOCTOR" && (
          <Link href="/dashboard/agenda" style={{ textDecoration: "none" }}>
            <Button variant="outlined" sx={{ mt: 3 }}>
              Minha Agenda
            </Button>
          </Link>
        )}
      </Paper>
    </Box>
  );
}
