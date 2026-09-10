import { DialogContent } from "@mui/material";
import { styled } from "@mui/material/styles";

/** "&&" força a especificidade: o MUI zera o padding-top do DialogContent
 *  quando ele vem logo após um DialogTitle, e um estilo normal perde pra essa regra. */
export const FormDialogContent = styled(DialogContent)(({ theme }) => ({
  display: "flex",
  flexDirection: "column",
  gap: theme.spacing(2),
  "&&": {
    paddingTop: theme.spacing(2.5),
  },
}));
