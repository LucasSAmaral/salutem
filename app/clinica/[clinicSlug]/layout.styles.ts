"use client";

import { Box } from "@mui/material";
import { styled } from "@mui/material/styles";

export const ShellRoot = styled(Box)({
  minHeight: "100vh",
  display: "flex",
  flexDirection: "column",
});

export const ContentArea = styled(Box)({
  flex: 1,
});
