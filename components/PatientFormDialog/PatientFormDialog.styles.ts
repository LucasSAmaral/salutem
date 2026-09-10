import { Box, Checkbox, DialogContent, Typography } from "@mui/material";
import { styled } from "@mui/material/styles";

export const FormDialogContent = styled(DialogContent)(({ theme }) => ({
  display: "flex",
  flexDirection: "column",
  gap: theme.spacing(2),
  paddingTop: theme.spacing(1),
}));

export const FieldRow = styled(Box)(({ theme }) => ({
  display: "grid",
  gridTemplateColumns: "1fr 1fr",
  gap: theme.spacing(2),
}));

export const ConsentBox = styled(Box)(({ theme }) => ({
  backgroundColor: theme.palette.background.default,
  border: `1px solid ${theme.palette.divider}`,
  borderRadius: theme.shape.borderRadius,
  padding: theme.spacing(1.75),
  display: "flex",
  gap: theme.spacing(1.5),
}));

export const ConsentCheckbox = styled(Checkbox)(({ theme }) => ({
  padding: 0,
  marginTop: theme.spacing(0.25),
}));

export const ConsentTitle = styled(Typography)({
  fontWeight: 500,
});
