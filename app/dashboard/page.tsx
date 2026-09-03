import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { authOptions } from "@/lib/auth";
import { Box, Paper, Typography, Chip, Tooltip } from "@mui/material";
import CalendarMonthOutlinedIcon from "@mui/icons-material/CalendarMonthOutlined";
import PeopleOutlinedIcon from "@mui/icons-material/PeopleOutlined";
import FormatListBulletedOutlinedIcon from "@mui/icons-material/FormatListBulletedOutlined";
import FolderOutlinedIcon from "@mui/icons-material/FolderOutlined";
import PaymentsOutlinedIcon from "@mui/icons-material/PaymentsOutlined";
import { getNavItems, type NavItemKey } from "@/lib/navItems";

const CARD_META: Partial<Record<NavItemKey, { icon: React.ElementType; description: string }>> = {
  agenda: {
    icon: CalendarMonthOutlinedIcon,
    description: "Configure os turnos e horários de atendimento.",
  },
  patients: {
    icon: PeopleOutlinedIcon,
    description: "Cadastre e busque pacientes da clínica.",
  },
  queue: {
    icon: FormatListBulletedOutlinedIcon,
    description: "Veja os pacientes aguardando em tempo real.",
  },
  records: {
    icon: FolderOutlinedIcon,
    description: "Busque um paciente e veja o histórico clínico.",
  },
  payment: {
    icon: PaymentsOutlinedIcon,
    description: "Gerencie cobranças e pagamentos da clínica.",
  },
};

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/login");

  const quickAccess = getNavItems(session.user.role).filter((item) => item.key !== "dashboard");

  return (
    <Box sx={{ p: 4 }}>
      <Typography variant="h5" gutterBottom>
        Bem-vindo, {session.user.name}
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
        Aqui está um resumo da sua conta.
      </Typography>

      <Paper variant="outlined" sx={{ p: 3, display: "flex", gap: 5, mb: 4, maxWidth: 700 }}>
        <Box>
          <Typography variant="caption" color="text.secondary" sx={{ display: "block" }}>
            E-mail
          </Typography>
          <Typography variant="body2" sx={{ fontWeight: 500 }}>
            {session.user.email}
          </Typography>
        </Box>
        <Box>
          <Typography variant="caption" color="text.secondary" sx={{ display: "block" }}>
            Perfil
          </Typography>
          <Chip label={session.user.role} size="small" color="primary" variant="outlined" />
        </Box>
        <Box>
          <Typography variant="caption" color="text.secondary" sx={{ display: "block" }}>
            Clínica
          </Typography>
          <Typography variant="body2" sx={{ fontWeight: 500 }}>
            {session.user.clinicSlug}
          </Typography>
        </Box>
      </Paper>

      <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 500, mb: 1.5 }}>
        Acesso rápido
      </Typography>
      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: "repeat(3, minmax(0, 1fr))",
          gap: 2,
          maxWidth: 900,
        }}
      >
        {quickAccess.map((item) => {
          const meta = CARD_META[item.key];
          if (!meta) return null;
          const Icon = meta.icon;

          const card = (
            <Paper
              variant="outlined"
              sx={{
                p: 2.5,
                display: "flex",
                flexDirection: "column",
                gap: 1.5,
                height: "100%",
                opacity: item.href ? 1 : 0.55,
                "&:hover": item.href ? { borderColor: "primary.light" } : undefined,
              }}
            >
              <Box
                sx={{
                  width: 40,
                  height: 40,
                  borderRadius: 1,
                  bgcolor: "action.selected",
                  color: "primary.dark",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <Icon fontSize="small" />
              </Box>
              <Typography variant="body2" sx={{ fontWeight: 500 }}>
                {item.label}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {meta.description}
              </Typography>
            </Paper>
          );

          if (!item.href) {
            return (
              <Tooltip key={item.key} title="Em breve">
                <Box>{card}</Box>
              </Tooltip>
            );
          }

          return (
            <Link key={item.key} href={item.href} style={{ textDecoration: "none", color: "inherit" }}>
              {card}
            </Link>
          );
        })}
      </Box>
    </Box>
  );
}
