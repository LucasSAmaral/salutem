"use client";

import { Box, Paper, Typography } from "@mui/material";
import { styled } from "@mui/material/styles";

export const PageRoot = styled(Box)(({ theme }) => ({
  padding: theme.spacing(4),
}));

export const Subtitle = styled(Typography)(({ theme }) => ({
  marginBottom: theme.spacing(3),
}));

export const AccountCard = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(3),
  display: "flex",
  gap: theme.spacing(5),
  marginBottom: theme.spacing(4),
  maxWidth: 700,
}));

export const FieldLabel = styled(Typography)({
  display: "block",
});

export const BoldText = styled(Typography)({
  fontWeight: 500,
});

export const SectionLabel = styled(Typography)(({ theme }) => ({
  fontWeight: 500,
  marginBottom: theme.spacing(1.5),
}));

export const CardsGrid = styled(Box)(({ theme }) => ({
  display: "grid",
  gridTemplateColumns: "repeat(3, minmax(0, 1fr))",
  gap: theme.spacing(2),
  maxWidth: 900,
}));

export const AccessCard = styled(Paper, {
  shouldForwardProp: (prop) => prop !== "clickable",
})<{ clickable?: boolean }>(({ theme, clickable }) => ({
  padding: theme.spacing(2.5),
  display: "flex",
  flexDirection: "column",
  gap: theme.spacing(1.5),
  height: "100%",
  opacity: clickable ? 1 : 0.55,
  ...(clickable
    ? { "&:hover": { borderColor: theme.palette.primary.light } }
    : {}),
}));

export const CardIcon = styled(Box)(({ theme }) => ({
  width: 40,
  height: 40,
  borderRadius: theme.shape.borderRadius,
  backgroundColor: theme.palette.action.selected,
  color: theme.palette.primary.dark,
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
}));
