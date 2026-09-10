"use client";

import { Box, Paper, Typography } from "@mui/material";
import ChevronRightOutlinedIcon from "@mui/icons-material/ChevronRightOutlined";
import { styled } from "@mui/material/styles";

export const PageRoot = styled(Box)(({ theme }) => ({
  padding: theme.spacing(4),
  maxWidth: 700,
}));

export const Subtitle = styled(Typography)(({ theme }) => ({
  marginBottom: theme.spacing(3),
}));

export const BackLink = styled(Typography)(({ theme }) => ({
  marginBottom: theme.spacing(1),
}));

export const DoctorRow = styled(Paper)(({ theme }) => ({
  display: "flex",
  alignItems: "center",
  gap: theme.spacing(1.75),
  padding: theme.spacing(2),
  "&:hover": {
    borderColor: theme.palette.primary.light,
  },
}));

export const DoctorAvatar = styled(Box)(({ theme }) => ({
  width: 44,
  height: 44,
  borderRadius: "50%",
  backgroundColor: theme.palette.action.selected,
  color: theme.palette.primary.dark,
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  fontSize: 15,
  fontWeight: 600,
  flexShrink: 0,
}));

export const BoldText = styled(Typography)({
  fontWeight: 500,
});

export const ChevronIcon = styled(ChevronRightOutlinedIcon)(({ theme }) => ({
  marginLeft: "auto",
  color: theme.palette.text.disabled,
}));
