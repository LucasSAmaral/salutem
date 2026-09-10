import { Button } from "@mui/material";
import { styled } from "@mui/material/styles";

export const LogoutButtonRoot = styled(Button)(({ theme }) => ({
  color: theme.palette.text.secondary,
}));
