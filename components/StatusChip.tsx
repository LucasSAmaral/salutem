"use client";

import { Chip } from "@mui/material";
import { useTheme } from "@mui/material/styles";
import { statusLabel, serenoStatus, confiancaStatus, type StatusKey } from "@/theme/tokens";

export default function StatusChip({ status }: { status: StatusKey }) {
  const theme = useTheme();
  const map = theme.palette.primary.main === "#2E4C9B" ? confiancaStatus : serenoStatus;
  const tone = map[status];

  return (
    <Chip
      label={statusLabel[status]}
      size="small"
      variant={tone.outlined ? "outlined" : "filled"}
      sx={{
        backgroundColor: tone.outlined ? "transparent" : tone.bg,
        color: tone.fg,
        borderColor: tone.outlined ? "currentColor" : undefined,
      }}
    />
  );
}
