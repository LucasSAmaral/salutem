import { Chip } from "@mui/material";
import { styled } from "@mui/material/styles";

export type Tone = { bg: string; fg: string; outlined?: boolean };

export const ToneChip = styled(Chip, {
  shouldForwardProp: (prop) => prop !== "tone",
})<{ tone: Tone }>(({ tone }) => ({
  backgroundColor: tone.outlined ? "transparent" : tone.bg,
  color: tone.fg,
  borderColor: tone.outlined ? "currentColor" : undefined,
}));
