import { Box, IconButton, Typography } from "@mui/material";
import { styled } from "@mui/material/styles";
import Link from "next/link";

export const TopBarRoot = styled(Box)(({ theme }) => ({
  height: 64,
  flexShrink: 0,
  display: "flex",
  alignItems: "center",
  gap: theme.spacing(1.25),
  paddingLeft: theme.spacing(2.5),
  paddingRight: theme.spacing(2.5),
  backgroundColor: theme.palette.background.paper,
  borderBottom: `1px solid ${theme.palette.divider}`,
}));

export const LogoMark = styled(Box)(({ theme }) => ({
  width: 30,
  height: 30,
  borderRadius: theme.shape.borderRadius,
  backgroundColor: theme.palette.primary.main,
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  flexShrink: 0,
}));

export const BrandBlock = styled(Box)({
  display: "flex",
  flexDirection: "column",
  lineHeight: 1.2,
});

export const BrandName = styled(Typography)({
  fontSize: 15,
  fontWeight: 800,
  letterSpacing: "-0.2px",
});

export const ClinicName = styled(Typography)(({ theme }) => ({
  fontSize: 11,
  color: theme.palette.text.secondary,
}));

export const LogoutIconButton = styled(IconButton)({
  marginLeft: "auto",
});

export const NavRow = styled(Box)(({ theme }) => ({
  display: "flex",
  gap: theme.spacing(1),
  paddingLeft: theme.spacing(2.5),
  paddingRight: theme.spacing(2.5),
  paddingTop: theme.spacing(1),
  paddingBottom: theme.spacing(1),
  backgroundColor: theme.palette.background.paper,
  borderBottom: `1px solid ${theme.palette.divider}`,
}));

export const NavTab = styled(Link, {
  shouldForwardProp: (prop) => prop !== "active",
})<{ active?: boolean }>(({ theme, active }) => ({
  textDecoration: "none",
  display: "inline-block",
  fontSize: 13,
  fontWeight: 600,
  padding: theme.spacing(0.75, 1.5),
  borderRadius: theme.shape.borderRadius,
  color: active ? theme.palette.primary.contrastText : theme.palette.text.secondary,
  backgroundColor: active ? theme.palette.primary.main : "transparent",
}));
