"use client";

import { Box, Typography } from "@mui/material";
import { styled } from "@mui/material/styles";

export const PageRoot = styled(Box)(({ theme }) => ({
  padding: theme.spacing(4),
  maxWidth: 760,
}));

export const Subtitle = styled(Typography)(({ theme }) => ({
  marginBottom: theme.spacing(3),
}));
