import { Box, Paper, Typography } from "@mui/material";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";
import { styled } from "@mui/material/styles";

export const BackLink = styled(Box)(({ theme }) => ({
  display: "inline-flex",
  alignItems: "center",
  gap: theme.spacing(0.5),
  color: theme.palette.text.secondary,
  fontSize: 13,
  cursor: "pointer",
  marginBottom: theme.spacing(2),
  "&:hover": { color: theme.palette.text.primary },
}));

export const RestrictedNote = styled(Box)(({ theme }) => ({
  display: "flex",
  alignItems: "center",
  gap: theme.spacing(1),
  fontSize: 12,
  color: theme.palette.text.secondary,
  marginBottom: theme.spacing(2.5),
}));

export const RestrictedIcon = styled(InfoOutlinedIcon)(({ theme }) => ({
  fontSize: 16,
  color: theme.palette.text.disabled,
  flexShrink: 0,
}));

export const PatientHeader = styled(Paper)(({ theme }) => ({
  display: "flex",
  alignItems: "center",
  gap: theme.spacing(2),
  padding: theme.spacing(2.5, 3),
  marginBottom: theme.spacing(3.5),
}));

export const AvatarLg = styled(Box)(({ theme }) => ({
  width: 52,
  height: 52,
  borderRadius: "50%",
  backgroundColor: theme.palette.action.selected,
  color: theme.palette.text.secondary,
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  fontSize: 17,
  fontWeight: 600,
  flexShrink: 0,
}));

export const SectionTitle = styled(Typography)(({ theme }) => ({
  fontSize: 15,
  fontWeight: 500,
  marginBottom: theme.spacing(1.75),
}));

export const ConsultList = styled(Paper)({
  overflow: "hidden",
});

export const ConsultItem = styled(Box)(({ theme }) => ({
  display: "flex",
  gap: theme.spacing(2),
  padding: theme.spacing(1.75, 2.5),
  borderBottom: `1px solid ${theme.palette.divider}`,
  "&:last-of-type": { borderBottom: "none" },
}));

export const ConsultDate = styled(Box)(({ theme }) => ({
  width: 100,
  flexShrink: 0,
  fontSize: 13,
  color: theme.palette.text.secondary,
}));

export const ConsultBody = styled(Box)({
  flex: 1,
  minWidth: 0,
});

export const ConsultTitleRow = styled(Box)(({ theme }) => ({
  display: "flex",
  alignItems: "center",
  gap: theme.spacing(1),
  marginBottom: theme.spacing(0.25),
}));

export const EditActions = styled(Box)(({ theme }) => ({
  display: "flex",
  gap: theme.spacing(1),
  marginTop: theme.spacing(1),
}));

export const ExamsSection = styled(Box)(({ theme }) => ({
  marginTop: theme.spacing(4),
}));

export const ExamGrid = styled(Box)(({ theme }) => ({
  display: "grid",
  gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))",
  gap: theme.spacing(1.75),
}));

export const ExamCard = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(2),
  display: "flex",
  flexDirection: "column",
  gap: theme.spacing(1.25),
  cursor: "pointer",
  "&:hover": { borderColor: theme.palette.primary.main },
}));

export const FileIconBadge = styled(Box)(({ theme }) => ({
  width: 40,
  height: 40,
  borderRadius: theme.shape.borderRadius,
  backgroundColor: theme.palette.action.selected,
  color: theme.palette.text.secondary,
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
}));

export const UploadCard = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(2),
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  justifyContent: "center",
  gap: theme.spacing(1),
  color: theme.palette.text.secondary,
  fontSize: 13,
  textAlign: "center",
  cursor: "pointer",
  border: `1.5px dashed ${theme.palette.divider}`,
  minHeight: 108,
  "&:hover": { borderColor: theme.palette.primary.main, color: theme.palette.primary.main },
}));
