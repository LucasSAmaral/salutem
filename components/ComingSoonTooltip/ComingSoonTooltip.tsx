"use client";

import type { ReactNode } from "react";
import { Tooltip } from "@mui/material";

/** Envolve um item que ainda não existe com o tooltip "Em breve".
 *
 *  Precisa ser Client Component: o `Tooltip` clona o filho, e um filho criado
 *  numa Server Component chega ao SSR como referência lazy — não como elemento
 *  válido —, então o MUI renderiza um `<span>` no servidor e um `<div>` no
 *  navegador (erro de hidratação). Aqui o `<div>` nasce já no cliente. */
export default function ComingSoonTooltip({ children }: { children: ReactNode }) {
  return (
    <Tooltip title="Em breve">
      <div>{children}</div>
    </Tooltip>
  );
}
