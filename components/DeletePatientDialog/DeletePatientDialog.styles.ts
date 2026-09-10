import { DialogContent } from "@mui/material";
import { styled } from "@mui/material/styles";

export const ConfirmDialogContent = styled(DialogContent)(({ theme }) => ({
  display: "flex",
  flexDirection: "column",
  gap: theme.spacing(2),
}));
