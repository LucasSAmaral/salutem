"use client";

import { usePathname } from "next/navigation";
import { SessionProvider } from "next-auth/react";
import { ThemeProvider, CssBaseline } from "@mui/material";
import { AppRouterCacheProvider } from "@mui/material-nextjs/v16-appRouter";
import { sereno } from "@/theme/sereno";
import { confianca } from "@/theme/confianca";

export default function Providers({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isPatientArea = pathname.includes("/agendar") || pathname.includes("/meus-agendamentos");
  const theme = isPatientArea ? confianca : sereno;

  return (
    <AppRouterCacheProvider>
      <SessionProvider>
        <ThemeProvider theme={theme}>
          <CssBaseline />
          {children}
        </ThemeProvider>
      </SessionProvider>
    </AppRouterCacheProvider>
  );
}
