import { Box, Typography } from "@mui/material";
import { alpha, styled } from "@mui/material/styles";

export const Root = styled(Box)(({ theme }) => ({
  maxWidth: 480,
  margin: "0 auto",
  padding: theme.spacing(3, 2.5, 0),
  display: "flex",
  flexDirection: "column",
  gap: theme.spacing(2),
}));

export const Subtitle = styled(Typography)(({ theme }) => ({
  marginBottom: theme.spacing(1),
}));

export const StepLabel = styled(Typography)(({ theme }) => ({
  fontSize: 12,
  fontWeight: 700,
  color: theme.palette.text.secondary,
  textTransform: "uppercase",
  letterSpacing: "0.4px",
  marginBottom: theme.spacing(1.5),
}));

export const StepBlock = styled(Box)({});

export const DoctorCard = styled(Box, {
  shouldForwardProp: (prop) => prop !== "selected",
})<{ selected?: boolean }>(({ theme, selected }) => ({
  display: "flex",
  alignItems: "center",
  gap: theme.spacing(1.5),
  backgroundColor: selected ? theme.palette.action.selected : theme.palette.background.paper,
  border: `1.5px solid ${selected ? theme.palette.primary.main : theme.palette.divider}`,
  borderRadius: theme.shape.borderRadius,
  padding: theme.spacing(1.75, 2),
  marginBottom: theme.spacing(1.25),
  cursor: "pointer",
}));

export const DoctorAvatar = styled(Box, {
  shouldForwardProp: (prop) => prop !== "selected",
})<{ selected?: boolean }>(({ theme, selected }) => ({
  width: 40,
  height: 40,
  borderRadius: "50%",
  backgroundColor: selected ? theme.palette.primary.main : theme.palette.action.selected,
  color: selected ? theme.palette.primary.contrastText : theme.palette.primary.dark,
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  fontSize: 14,
  fontWeight: 700,
  flexShrink: 0,
}));

export const DoctorInfo = styled(Box)({
  flex: 1,
});

export const DoctorSpec = styled(Typography)(({ theme }) => ({
  fontSize: 12,
  color: theme.palette.text.secondary,
}));

export const DoctorCheck = styled(Box)(({ theme }) => ({
  color: theme.palette.primary.main,
  display: "flex",
}));

export const DayScroll = styled(Box)(({ theme }) => ({
  display: "flex",
  gap: theme.spacing(1.25),
  overflowX: "auto",
  paddingBottom: theme.spacing(0.5),
}));

export const DayPill = styled(Box, {
  shouldForwardProp: (prop) => prop !== "selected",
})<{ selected?: boolean }>(({ theme, selected }) => ({
  flexShrink: 0,
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  justifyContent: "center",
  gap: 2,
  width: 58,
  height: 64,
  borderRadius: theme.shape.borderRadius,
  border: `1.5px solid ${selected ? theme.palette.primary.main : theme.palette.divider}`,
  backgroundColor: selected ? theme.palette.primary.main : theme.palette.background.paper,
  color: selected ? theme.palette.primary.contrastText : theme.palette.text.primary,
  fontSize: 14,
  fontWeight: 700,
  cursor: "pointer",
}));

export const DowLabel = styled(Typography, {
  shouldForwardProp: (prop) => prop !== "selected",
})<{ selected?: boolean }>(({ theme, selected }) => ({
  fontSize: 11,
  fontWeight: 600,
  textTransform: "uppercase",
  color: selected ? alpha(theme.palette.common.white, 0.8) : theme.palette.text.secondary,
}));

export const SlotGrid = styled(Box)(({ theme }) => ({
  display: "grid",
  gridTemplateColumns: "repeat(3, minmax(0, 1fr))",
  gap: theme.spacing(1.25),
}));

export const SlotCell = styled(Box, {
  shouldForwardProp: (prop) => prop !== "selected",
})<{ selected?: boolean }>(({ theme, selected }) => ({
  height: 48,
  borderRadius: theme.shape.borderRadius,
  border: `1.5px solid ${selected ? theme.palette.primary.main : theme.palette.divider}`,
  backgroundColor: selected ? theme.palette.primary.main : theme.palette.background.paper,
  color: selected ? theme.palette.primary.contrastText : theme.palette.text.primary,
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  fontSize: 14,
  fontWeight: 700,
  cursor: "pointer",
}));

export const LoadingRow = styled(Box)(({ theme }) => ({
  display: "flex",
  alignItems: "center",
  gap: theme.spacing(1),
  paddingTop: theme.spacing(1),
  paddingBottom: theme.spacing(1),
}));

export const ConfirmBar = styled(Box)(({ theme }) => ({
  position: "sticky",
  bottom: 0,
  backgroundColor: theme.palette.background.paper,
  borderTop: `1px solid ${theme.palette.divider}`,
  padding: theme.spacing(2, 2.5, 2.75),
  marginLeft: theme.spacing(-2.5),
  marginRight: theme.spacing(-2.5),
}));

export const ConfirmSummary = styled(Typography)(({ theme }) => ({
  fontSize: 12,
  color: theme.palette.text.secondary,
  marginBottom: theme.spacing(1.25),
}));

export const DoctorName = styled(Typography)({
  fontWeight: 700,
});
