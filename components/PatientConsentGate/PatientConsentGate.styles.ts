import { Box, Typography } from "@mui/material";
import { styled } from "@mui/material/styles";

export const Root = styled(Box)(({ theme }) => ({
  maxWidth: 420,
  margin: "0 auto",
  padding: theme.spacing(4, 2.5),
}));

export const Subtitle = styled(Typography)(({ theme }) => ({
  marginBottom: theme.spacing(3),
}));

export const FormBox = styled(Box)(({ theme }) => ({
  display: "flex",
  flexDirection: "column",
  gap: theme.spacing(2.5),
}));

export const ConsentBox = styled(Box)(({ theme }) => ({
  backgroundColor: theme.palette.background.default,
  border: `1px solid ${theme.palette.divider}`,
  borderRadius: theme.shape.borderRadius,
  padding: theme.spacing(1.5),
}));
