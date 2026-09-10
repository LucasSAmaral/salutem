import { Avatar, Box, Paper, Stack, TextField, Typography } from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import { styled } from "@mui/material/styles";

export const Root = styled(Box)(({ theme }) => ({
  display: "flex",
  flexDirection: "column",
  gap: theme.spacing(3.5),
}));

export const MediumText = styled(Typography)({
  fontWeight: 500,
});

export const SelectedPatientCard = styled(Paper)(({ theme }) => ({
  display: "flex",
  alignItems: "center",
  gap: theme.spacing(1.5),
  padding: theme.spacing(1.5),
  borderColor: theme.palette.primary.main,
  borderWidth: 1.5,
}));

export const PatientAvatarLg = styled(Avatar)(({ theme }) => ({
  width: 36,
  height: 36,
  fontSize: 13,
  backgroundColor: theme.palette.action.selected,
  color: theme.palette.primary.dark,
}));

export const PatientAvatarSm = styled(Avatar)(({ theme }) => ({
  width: 32,
  height: 32,
  fontSize: 12,
  backgroundColor: theme.palette.action.selected,
  color: theme.palette.primary.dark,
}));

export const ChipAvatarSm = styled(Avatar)({
  fontSize: 11,
});

export const GrowBox = styled(Box)({
  flex: 1,
});

export const SearchWrapper = styled(Box)({
  position: "relative",
});

export const PatientSearchField = styled(TextField)(({ theme }) => ({
  marginTop: theme.spacing(0.5),
}));

export const SearchIconMuted = styled(SearchIcon)(({ theme }) => ({
  color: theme.palette.text.disabled,
}));

export const SuggestionsPaper = styled(Paper)(({ theme }) => ({
  marginTop: theme.spacing(0.5),
}));

export const SuggestionDivider = styled(Box)(({ theme }) => ({
  borderBottom: `1px solid ${theme.palette.divider}`,
}));

export const SuggestionRow = styled(Box)(({ theme }) => ({
  display: "flex",
  alignItems: "center",
  gap: theme.spacing(1.5),
  padding: theme.spacing(1.5),
  cursor: "pointer",
  "&:hover": {
    backgroundColor: theme.palette.action.hover,
  },
}));

export const NoResultsText = styled(Typography)(({ theme }) => ({
  marginTop: theme.spacing(1),
}));

export const NoDoctorsText = styled(Typography)(({ theme }) => ({
  marginTop: theme.spacing(0.5),
}));

export const DoctorChipsRow = styled(Stack)(({ theme }) => ({
  marginTop: theme.spacing(0.5),
  flexWrap: "wrap",
  rowGap: theme.spacing(1.25),
}));

export const DaysRow = styled(Stack)(({ theme }) => ({
  marginTop: theme.spacing(0.5),
  overflowX: "auto",
  paddingBottom: theme.spacing(0.5),
}));

export const DayCell = styled(Box, {
  shouldForwardProp: (prop) => prop !== "selected",
})<{ selected?: boolean }>(({ theme, selected }) => ({
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  justifyContent: "center",
  gap: theme.spacing(0.25),
  width: 56,
  height: 60,
  flexShrink: 0,
  borderRadius: theme.shape.borderRadius,
  borderWidth: 1.5,
  borderStyle: "solid",
  borderColor: selected ? theme.palette.primary.main : theme.palette.divider,
  backgroundColor: selected ? theme.palette.primary.main : "transparent",
  color: selected ? theme.palette.primary.contrastText : theme.palette.text.primary,
  cursor: "pointer",
}));

export const DowLabel = styled(Typography, {
  shouldForwardProp: (prop) => prop !== "selected",
})<{ selected?: boolean }>(({ theme, selected }) => ({
  textTransform: "uppercase",
  color: selected ? theme.palette.primary.contrastText : theme.palette.text.secondary,
  opacity: selected ? 0.85 : 1,
}));

export const SlotsWrapper = styled(Box)(({ theme }) => ({
  marginTop: theme.spacing(0.5),
}));

export const LoadingRow = styled(Box)(({ theme }) => ({
  display: "flex",
  alignItems: "center",
  gap: theme.spacing(1),
  paddingTop: theme.spacing(1),
  paddingBottom: theme.spacing(1),
}));

export const SlotsGrid = styled(Box)(({ theme }) => ({
  display: "grid",
  gridTemplateColumns: "repeat(auto-fill, minmax(88px, 1fr))",
  gap: theme.spacing(1.25),
}));

export const SlotCell = styled(Box, {
  shouldForwardProp: (prop) => prop !== "selected",
})<{ selected?: boolean }>(({ theme, selected }) => ({
  height: 40,
  borderRadius: theme.shape.borderRadius,
  borderWidth: 1.5,
  borderStyle: "solid",
  borderColor: selected ? theme.palette.primary.main : theme.palette.divider,
  backgroundColor: selected ? theme.palette.primary.main : "transparent",
  color: selected ? theme.palette.primary.contrastText : theme.palette.text.primary,
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  fontSize: 13,
  fontWeight: 500,
  cursor: "pointer",
}));

export const DividerRow = styled(Stack)(({ theme }) => ({
  marginTop: theme.spacing(2),
  alignItems: "center",
}));

export const DividerLine = styled(Box)(({ theme }) => ({
  flex: 1,
  borderBottom: `1px solid ${theme.palette.divider}`,
}));

export const WalkInRow = styled(Stack)(({ theme }) => ({
  marginTop: theme.spacing(1.5),
  alignItems: "center",
  flexWrap: "wrap",
}));

export const WalkInTimeField = styled(TextField)({
  width: 140,
});

export const WalkInConfirmRow = styled(Stack)({
  alignItems: "center",
});

export const FooterBar = styled(Box)(({ theme }) => ({
  marginTop: "auto",
  paddingTop: theme.spacing(2.5),
  borderTop: `1px solid ${theme.palette.divider}`,
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  flexWrap: "wrap",
  gap: theme.spacing(1.5),
}));
