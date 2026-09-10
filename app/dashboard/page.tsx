import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { authOptions } from "@/lib/auth";
import { Box, Chip, Tooltip, Typography } from "@mui/material";
import CalendarMonthOutlinedIcon from "@mui/icons-material/CalendarMonthOutlined";
import EventAvailableOutlinedIcon from "@mui/icons-material/EventAvailableOutlined";
import PeopleOutlinedIcon from "@mui/icons-material/PeopleOutlined";
import FormatListBulletedOutlinedIcon from "@mui/icons-material/FormatListBulletedOutlined";
import FolderOutlinedIcon from "@mui/icons-material/FolderOutlined";
import PaymentsOutlinedIcon from "@mui/icons-material/PaymentsOutlined";
import { getNavItems, type NavItemKey } from "@/lib/navItems";
import {
  AccessCard,
  AccountCard,
  BoldText,
  CardIcon,
  CardsGrid,
  FieldLabel,
  PageRoot,
  SectionLabel,
  Subtitle,
} from "./page.styles";

const CARD_META: Partial<Record<NavItemKey, { icon: React.ElementType; description: string }>> = {
  agenda: {
    icon: CalendarMonthOutlinedIcon,
    description: "Configure os turnos e horários de atendimento.",
  },
  appointments: {
    icon: EventAvailableOutlinedIcon,
    description: "Marque consultas a partir dos horários livres do médico.",
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
    <PageRoot>
      <Typography variant="h5" gutterBottom>
        Bem-vindo, {session.user.name}
      </Typography>
      <Subtitle variant="body2" color="text.secondary">
        Aqui está um resumo da sua conta.
      </Subtitle>

      <AccountCard variant="outlined">
        <Box>
          <FieldLabel variant="caption" color="text.secondary">
            E-mail
          </FieldLabel>
          <BoldText variant="body2">{session.user.email}</BoldText>
        </Box>
        <Box>
          <FieldLabel variant="caption" color="text.secondary">
            Perfil
          </FieldLabel>
          <Chip label={session.user.role} size="small" color="primary" variant="outlined" />
        </Box>
        <Box>
          <FieldLabel variant="caption" color="text.secondary">
            Clínica
          </FieldLabel>
          <BoldText variant="body2">{session.user.clinicSlug}</BoldText>
        </Box>
      </AccountCard>

      <SectionLabel variant="body2" color="text.secondary">
        Acesso rápido
      </SectionLabel>
      <CardsGrid>
        {quickAccess.map((item) => {
          const meta = CARD_META[item.key];
          if (!meta) return null;
          const Icon = meta.icon;

          const card = (
            <AccessCard variant="outlined" clickable={!!item.href}>
              <CardIcon>
                <Icon fontSize="small" />
              </CardIcon>
              <BoldText variant="body2">{item.label}</BoldText>
              <Typography variant="body2" color="text.secondary">
                {meta.description}
              </Typography>
            </AccessCard>
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
      </CardsGrid>
    </PageRoot>
  );
}
