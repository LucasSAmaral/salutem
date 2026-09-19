"use client";

import { useTheme } from "@mui/material/styles";
import { statusLabel, serenoStatus, confiancaStatus, type StatusKey } from "@/theme/tokens";
import { ToneChip } from "./StatusChip.styles";

/** `label` sobrescreve o texto padrão do status — a fila chama de "Aguardando"
 *  o que o resto do sistema chama de "Confirmado" (mesmo tom visual). */
export default function StatusChip({ status, label }: { status: StatusKey; label?: string }) {
  const theme = useTheme();
  const map = theme.palette.primary.main === "#2E4C9B" ? confiancaStatus : serenoStatus;
  const tone = map[status];

  return (
    <ToneChip
      label={label ?? statusLabel[status]}
      size="small"
      variant={tone.outlined ? "outlined" : "filled"}
      tone={tone}
    />
  );
}
