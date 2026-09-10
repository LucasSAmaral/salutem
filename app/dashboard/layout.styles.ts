"use client";

import { Box } from "@mui/material";
import { styled } from "@mui/material/styles";

export const LayoutRoot = styled(Box)({
  display: "flex",
  height: "100vh",
});

export const MainColumn = styled(Box)({
  flex: 1,
  minWidth: 0,
  display: "flex",
  flexDirection: "column",
  overflow: "hidden",
});

export const TopBar = styled(Box)(({ theme }) => ({
  height: 64,
  flexShrink: 0,
  display: "flex",
  alignItems: "center",
  justifyContent: "flex-end",
  gap: theme.spacing(1.5),
  paddingLeft: theme.spacing(4),
  paddingRight: theme.spacing(4),
  borderBottom: `1px solid ${theme.palette.divider}`,
  backgroundColor: theme.palette.background.paper,
}));

export const UserAvatar = styled(Box)(({ theme }) => ({
  width: 32,
  height: 32,
  borderRadius: "50%",
  backgroundColor: theme.palette.primary.light,
  color: theme.palette.primary.contrastText,
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  fontSize: 13,
  fontWeight: 600,
}));

export const ContentArea = styled(Box)({
  flex: 1,
  overflowY: "auto",
});
