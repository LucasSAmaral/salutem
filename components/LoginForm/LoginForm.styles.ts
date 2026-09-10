import { Box, Typography } from "@mui/material";
import { alpha, styled } from "@mui/material/styles";

export const PageRoot = styled(Box)({
  display: "flex",
  minHeight: "100vh",
});

export const HeroPanel = styled(Box)(({ theme }) => ({
  display: "none",
  [theme.breakpoints.up("md")]: {
    display: "flex",
  },
  flexDirection: "column",
  justifyContent: "space-between",
  width: 420,
  flexShrink: 0,
  padding: theme.spacing(6),
  backgroundColor: theme.palette.primary.main,
  color: theme.palette.primary.contrastText,
  position: "relative",
  overflow: "hidden",
}));

export const HeroCircleLarge = styled(Box)(({ theme }) => ({
  position: "absolute",
  right: -120,
  bottom: -140,
  width: 420,
  height: 420,
  borderRadius: "50%",
  backgroundColor: alpha(theme.palette.common.white, 0.06),
}));

export const HeroCircleSmall = styled(Box)(({ theme }) => ({
  position: "absolute",
  right: 40,
  top: -80,
  width: 220,
  height: 220,
  borderRadius: "50%",
  backgroundColor: alpha(theme.palette.common.white, 0.05),
}));

export const HeroBrand = styled(Box)({
  position: "relative",
});

export const LogoBadge = styled(Box)(({ theme }) => ({
  width: 44,
  height: 44,
  borderRadius: (theme.shape.borderRadius as number) * 2,
  backgroundColor: alpha(theme.palette.common.white, 0.16),
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
}));

export const BrandName = styled(Typography)(({ theme }) => ({
  marginTop: theme.spacing(1.75),
  fontWeight: 700,
  letterSpacing: "-0.2px",
}));

export const Tagline = styled(Typography)({
  position: "relative",
  fontSize: 26,
  lineHeight: 1.4,
  maxWidth: 320,
});

export const HeroSpacer = styled(Box)({
  position: "relative",
});

export const FormPanel = styled(Box)(({ theme }) => ({
  flex: 1,
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  padding: theme.spacing(0, 2),
}));

export const FormContainer = styled(Box)({
  width: "100%",
  maxWidth: 380,
});

export const Subtitle = styled(Typography)(({ theme }) => ({
  marginBottom: theme.spacing(4),
}));

export const FormBox = styled(Box)(({ theme }) => ({
  display: "flex",
  flexDirection: "column",
  gap: theme.spacing(2.5),
})) as typeof Box;
