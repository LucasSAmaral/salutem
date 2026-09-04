import type { ThemeOptions } from '@mui/material/styles';

/** Fundações compartilhadas pelos dois temas do Salutem.
 *  Nada de cor aqui — só forma, escala, densidade e comportamento. */
export const shared: ThemeOptions = {
  spacing: 8,
  breakpoints: { values: { xs: 0, sm: 600, md: 900, lg: 1200, xl: 1536 } },
  typography: {
    htmlFontSize: 16,
    button: { textTransform: 'none', fontWeight: 500 },
  },
  components: {
    MuiButton: {
      defaultProps: { disableElevation: false },
      styleOverrides: { root: { minHeight: 44 } },
    },
    MuiTextField: { defaultProps: { size: 'medium', fullWidth: true } },
    MuiTableCell: { styleOverrides: { root: { paddingTop: 12, paddingBottom: 12 } } },
    MuiChip: { styleOverrides: { root: { fontWeight: 500 } } },
    // Foco sempre visível — regra de acessibilidade do sistema.
    // Inputs ficam de fora: o MuiOutlinedInput/MuiFilledInput já tem indicador de foco
    // próprio (borda colorida), então o anel genérico só duplicava e ficava pesado.
    MuiCssBaseline: {
      styleOverrides: {
        ':focus-visible': { outline: 'none', boxShadow: '0 0 0 3px currentColor' },
        'input:focus-visible, textarea:focus-visible, select:focus-visible': { boxShadow: 'none' },
        '@media print': {
          '*': { boxShadow: 'none !important', background: 'transparent !important', color: '#000 !important' },
        },
      },
    },
  },
};

/** Status: uma fonte de verdade, resolvida pelo tema ativo.
 *  Consumido por <StatusChip status={appointment.status} />. */
export type StatusKey =
  | 'SCHEDULED' | 'CONFIRMED' | 'IN_PROGRESS' | 'DONE' | 'CANCELLED'
  | 'WALK_IN' | 'LAST_OF_DAY';

export const statusLabel: Record<StatusKey, string> = {
  SCHEDULED: 'Agendado',
  CONFIRMED: 'Confirmado',
  IN_PROGRESS: 'Em atendimento',
  DONE: 'Atendido',
  CANCELLED: 'Cancelado',
  WALK_IN: 'Encaixe',
  LAST_OF_DAY: 'Último do dia',
};

export const serenoStatus: Record<StatusKey, { bg: string; fg: string; outlined?: boolean }> = {
  SCHEDULED:   { bg: '#EDF0F0', fg: '#14201F' },
  CONFIRMED:   { bg: '#DCEDED', fg: '#0B5A5F' },
  IN_PROGRESS: { bg: '#12787E', fg: '#FFFFFF' },
  DONE:        { bg: '#E9F5EF', fg: '#1D5A40' },
  CANCELLED:   { bg: '#FDECEA', fg: '#7F1D18' },
  WALK_IN:     { bg: '#FBEDDF', fg: '#8C4A20' },
  LAST_OF_DAY: { bg: 'transparent', fg: '#0B5A5F', outlined: true },
};

export const confiancaStatus: Record<StatusKey, { bg: string; fg: string; outlined?: boolean }> = {
  SCHEDULED:   { bg: '#EDEFF5', fg: '#131A2B' },
  CONFIRMED:   { bg: '#EAEFFA', fg: '#1F3574' },
  IN_PROGRESS: { bg: '#2E4C9B', fg: '#FFFFFF' },
  DONE:        { bg: '#E7F4F0', fg: '#0E5F4C' },
  CANCELLED:   { bg: '#FCEDEB', fg: '#8E2A22' },
  WALK_IN:     { bg: '#FBEEDC', fg: '#A65E00' },
  LAST_OF_DAY: { bg: 'transparent', fg: '#5B657C', outlined: true },
};
