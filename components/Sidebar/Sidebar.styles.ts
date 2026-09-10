import { Box, Stack } from "@mui/material";
import { styled } from "@mui/material/styles";

export const SidebarRoot = styled(Box)(({ theme }) => ({
  width: 232,
  flexShrink: 0,
  backgroundColor: theme.palette.background.paper,
  borderRight: `1px solid ${theme.palette.divider}`,
  display: "flex",
  flexDirection: "column",
  overflowY: "auto",
  padding: theme.spacing(1.5),
})) as typeof Box;

export const BrandRow = styled(Stack)(({ theme }) => ({
  alignItems: "center",
  paddingLeft: theme.spacing(1.5),
  paddingRight: theme.spacing(1.5),
  paddingTop: theme.spacing(1),
  paddingBottom: theme.spacing(3),
}));

export const LogoBadge = styled(Box)(({ theme }) => ({
  width: 32,
  height: 32,
  borderRadius: theme.shape.borderRadius,
  backgroundColor: theme.palette.primary.main,
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  flexShrink: 0,
}));

export const BrandText = styled(Box)({
  fontSize: 18,
  fontWeight: 700,
  letterSpacing: "-0.2px",
});

export const NavRow = styled(Stack, {
  shouldForwardProp: (prop) => prop !== "active" && prop !== "clickable",
})<{ active?: boolean; clickable?: boolean }>(({ theme, active, clickable }) => ({
  alignItems: "center",
  paddingLeft: theme.spacing(1.5),
  paddingRight: theme.spacing(1.5),
  paddingTop: theme.spacing(1),
  paddingBottom: theme.spacing(1),
  borderRadius: theme.shape.borderRadius,
  fontSize: 14,
  fontWeight: 500,
  color: active
    ? theme.palette.primary.dark
    : clickable
      ? theme.palette.text.secondary
      : theme.palette.text.disabled,
  backgroundColor: active ? theme.palette.action.selected : "transparent",
  cursor: clickable ? "pointer" : "default",
  ...(clickable && !active
    ? { "&:hover": { backgroundColor: theme.palette.action.hover } }
    : {}),
}));

export const ClinicSlug = styled(Box)(({ theme }) => ({
  marginTop: "auto",
  paddingLeft: theme.spacing(1.5),
  paddingRight: theme.spacing(1.5),
  paddingTop: theme.spacing(1.5),
  paddingBottom: theme.spacing(1.5),
  fontSize: 12,
  color: theme.palette.text.secondary,
}));
