"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Box, Stack, Tooltip } from "@mui/material";
import HomeOutlinedIcon from "@mui/icons-material/HomeOutlined";
import CalendarMonthOutlinedIcon from "@mui/icons-material/CalendarMonthOutlined";
import EventAvailableOutlinedIcon from "@mui/icons-material/EventAvailableOutlined";
import PeopleOutlinedIcon from "@mui/icons-material/PeopleOutlined";
import FormatListBulletedOutlinedIcon from "@mui/icons-material/FormatListBulletedOutlined";
import FolderOutlinedIcon from "@mui/icons-material/FolderOutlined";
import PaymentsOutlinedIcon from "@mui/icons-material/PaymentsOutlined";
import type { NavItem, NavItemKey } from "@/lib/navItems";
import {
  BrandRow,
  BrandText,
  ClinicSlug,
  LogoBadge,
  NavRow,
  SidebarRoot,
} from "./Sidebar.styles";

const ICONS: Record<NavItemKey, React.ElementType> = {
  dashboard: HomeOutlinedIcon,
  agenda: CalendarMonthOutlinedIcon,
  appointments: EventAvailableOutlinedIcon,
  patients: PeopleOutlinedIcon,
  queue: FormatListBulletedOutlinedIcon,
  records: FolderOutlinedIcon,
  payment: PaymentsOutlinedIcon,
};

export default function Sidebar({ items, clinicSlug }: { items: NavItem[]; clinicSlug: string }) {
  const pathname = usePathname();

  return (
    <SidebarRoot component="nav">
      <BrandRow direction="row" spacing={1.25}>
        <LogoBadge>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth={2} strokeLinecap="round">
            <path d="M12 3v18M3 12h18" />
          </svg>
        </LogoBadge>
        <BrandText>Salutem</BrandText>
      </BrandRow>

      <Stack spacing={0.25}>
        {items.map((item) => {
          const Icon = ICONS[item.key];
          // "/dashboard" não conta como prefixo dos outros itens — senão eles
          // ficariam ativos junto com o Dashboard em qualquer rota aninhada.
          const active =
            item.href != null &&
            (pathname === item.href ||
              (item.href !== "/dashboard" && pathname.startsWith(`${item.href}/`)));

          const row = (
            <NavRow direction="row" spacing={1.5} active={active} clickable={!!item.href}>
              <Icon fontSize="small" />
              <Box>{item.label}</Box>
            </NavRow>
          );

          if (!item.href) {
            return (
              <Tooltip key={item.key} title="Em breve" placement="right">
                <Box>{row}</Box>
              </Tooltip>
            );
          }

          return (
            <Link key={item.key} href={item.href} style={{ textDecoration: "none" }}>
              {row}
            </Link>
          );
        })}
      </Stack>

      <ClinicSlug>{clinicSlug}</ClinicSlug>
    </SidebarRoot>
  );
}
