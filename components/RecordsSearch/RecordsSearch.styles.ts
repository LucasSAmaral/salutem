import { Box, TextField, Typography } from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import { styled } from "@mui/material/styles";

export const HeaderRow = styled(Box)(({ theme }) => ({
  marginBottom: theme.spacing(2.5),
}));

export const SearchField = styled(TextField)(({ theme }) => ({
  maxWidth: 380,
  marginBottom: theme.spacing(2.5),
}));

export const SearchIconMuted = styled(SearchIcon)(({ theme }) => ({
  color: theme.palette.text.disabled,
}));

export const EmptyStateText = styled(Typography)(({ theme }) => ({
  paddingTop: theme.spacing(2),
  paddingBottom: theme.spacing(2),
}));

export const PatientNameCell = styled(Box)(({ theme }) => ({
  display: "flex",
  alignItems: "center",
  gap: theme.spacing(1.25),
}));

export const AvatarCircle = styled(Box)(({ theme }) => ({
  width: 32,
  height: 32,
  borderRadius: "50%",
  backgroundColor: theme.palette.action.selected,
  color: theme.palette.text.secondary,
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  fontSize: 12,
  fontWeight: 600,
  flexShrink: 0,
}));
