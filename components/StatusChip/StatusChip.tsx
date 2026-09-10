"use client";

import { useTheme } from "@mui/material/styles";
import { statusLabel, serenoStatus, confiancaStatus, type StatusKey } from "@/theme/tokens";
import { ToneChip } from "./StatusChip.styles";

export default function StatusChip({ status }: { status: StatusKey }) {
  const theme = useTheme();
  const map = theme.palette.primary.main === "#2E4C9B" ? confiancaStatus : serenoStatus;
  const tone = map[status];

  return (
    <ToneChip
      label={statusLabel[status]}
      size="small"
      variant={tone.outlined ? "outlined" : "filled"}
      tone={tone}
    />
  );
}
