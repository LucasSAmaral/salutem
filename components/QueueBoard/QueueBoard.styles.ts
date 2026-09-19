import { Alert, Box, Typography } from "@mui/material";
import CheckIcon from "@mui/icons-material/Check";
import { styled } from "@mui/material/styles";

export const GroupSection = styled(Box)(({ theme }) => ({
  marginBottom: theme.spacing(4),
}));

export const GroupTitle = styled(Typography)(({ theme }) => ({
  fontWeight: 700,
  marginBottom: theme.spacing(1.5),
}));

export const SectionLabel = styled(Typography)(({ theme }) => ({
  marginTop: theme.spacing(2.5),
  marginBottom: theme.spacing(1),
}));

export const QueueRow = styled(Box, {
  shouldForwardProp: (prop) => prop !== "highlighted" && prop !== "dimmed",
})<{ highlighted?: boolean; dimmed?: boolean }>(({ theme, highlighted, dimmed }) => ({
  display: "flex",
  alignItems: "center",
  gap: theme.spacing(2),
  backgroundColor: theme.palette.background.paper,
  border: `1px solid ${highlighted ? theme.palette.primary.main : theme.palette.divider}`,
  boxShadow: highlighted ? `0 0 0 1px ${theme.palette.primary.main}` : "none",
  borderRadius: theme.shape.borderRadius,
  padding: theme.spacing(1.75, 2.25),
  marginBottom: theme.spacing(1.25),
  opacity: dimmed ? 0.65 : 1,
}));

export const PositionBadge = styled(Box, {
  shouldForwardProp: (prop) => prop !== "highlighted",
})<{ highlighted?: boolean }>(({ theme, highlighted }) => ({
  width: 28,
  height: 28,
  borderRadius: "50%",
  backgroundColor: highlighted ? theme.palette.primary.main : theme.palette.action.selected,
  color: highlighted ? theme.palette.primary.contrastText : theme.palette.text.secondary,
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  fontSize: 13,
  fontWeight: 600,
  flexShrink: 0,
}));

export const PatientInfo = styled(Box)({
  minWidth: 0,
});

export const PatientName = styled(Typography)({
  fontWeight: 500,
});

export const RowActions = styled(Box)(({ theme }) => ({
  display: "flex",
  alignItems: "center",
  gap: theme.spacing(0.75),
  marginLeft: "auto",
  flexWrap: "wrap",
  justifyContent: "flex-end",
}));

export const EmptyState = styled(Typography)(({ theme }) => ({
  paddingTop: theme.spacing(2),
}));

export const QueueAlert = styled(Alert)(({ theme }) => ({
  marginBottom: theme.spacing(2),
}));

export const DoneIcon = styled(CheckIcon)({
  fontSize: 16,
});
