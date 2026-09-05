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
    <Box
      component="nav"
      sx={{
        width: 232,
        flexShrink: 0,
        bgcolor: "background.paper",
        borderRight: 1,
        borderColor: "divider",
        display: "flex",
        flexDirection: "column",
        overflowY: "auto",
        p: 1.5,
      }}
    >
      <Stack direction="row" spacing={1.25} sx={{ alignItems: "center", px: 1.5, pt: 1, pb: 3 }}>
        <Box
          sx={{
            width: 32,
            height: 32,
            borderRadius: 1,
            bgcolor: "primary.main",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexShrink: 0,
          }}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth={2} strokeLinecap="round">
            <path d="M12 3v18M3 12h18" />
          </svg>
        </Box>
        <Box sx={{ fontSize: 18, fontWeight: 700, letterSpacing: "-0.2px" }}>Salutem</Box>
      </Stack>

      <Stack spacing={0.25}>
        {items.map((item) => {
          const Icon = ICONS[item.key];
          const active = item.href != null && pathname === item.href;

          const row = (
            <Stack
              direction="row"
              spacing={1.5}
              sx={{
                alignItems: "center",
                px: 1.5,
                py: 1,
                borderRadius: 1,
                fontSize: 14,
                fontWeight: 500,
                color: active ? "primary.dark" : item.href ? "text.secondary" : "text.disabled",
                bgcolor: active ? "action.selected" : "transparent",
                cursor: item.href ? "pointer" : "default",
                "&:hover": item.href && !active ? { bgcolor: "action.hover" } : undefined,
              }}
            >
              <Icon fontSize="small" />
              <Box>{item.label}</Box>
            </Stack>
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

      <Box sx={{ mt: "auto", px: 1.5, py: 1.5, fontSize: 12, color: "text.secondary" }}>
        {clinicSlug}
      </Box>
    </Box>
  );
}
