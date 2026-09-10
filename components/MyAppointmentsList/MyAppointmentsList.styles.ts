"use client";

import { Box, Button, Typography } from "@mui/material";
import { styled } from "@mui/material/styles";

export const Root = styled(Box)(({ theme }) => ({
  maxWidth: 480,
  margin: "0 auto",
  padding: theme.spacing(3, 2.5),
}));

export const Subtitle = styled(Typography)(({ theme }) => ({
  marginBottom: theme.spacing(3),
}));

export const AppointmentCard = styled(Box)(({ theme }) => ({
  display: "flex",
  flexDirection: "column",
  gap: theme.spacing(1),
  backgroundColor: theme.palette.background.paper,
  border: `1px solid ${theme.palette.divider}`,
  borderRadius: theme.shape.borderRadius,
  padding: theme.spacing(1.75, 2),
  marginBottom: theme.spacing(1.25),
}));

export const AppointmentTopRow = styled(Box)(({ theme }) => ({
  display: "flex",
  alignItems: "center",
  gap: theme.spacing(1.5),
}));

export const CancelRow = styled(Box)(({ theme }) => ({
  display: "flex",
  justifyContent: "flex-end",
  paddingTop: theme.spacing(0.5),
  borderTop: `1px solid ${theme.palette.divider}`,
}));

export const CancelButton = styled(Button)({
  fontSize: 12,
});

export const AppointmentIcon = styled(Box)(({ theme }) => ({
  width: 40,
  height: 40,
  borderRadius: theme.shape.borderRadius,
  backgroundColor: theme.palette.action.selected,
  color: theme.palette.primary.dark,
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  flexShrink: 0,
}));

export const AppointmentInfo = styled(Box)({
  flex: 1,
});

export const DoctorName = styled(Typography)({
  fontWeight: 700,
});

export const AppointmentDate = styled(Typography)(({ theme }) => ({
  marginTop: theme.spacing(0.25),
}));
