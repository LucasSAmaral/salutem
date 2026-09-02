import { createTheme } from '@mui/material/styles';
import { shared } from './tokens';

/** Confiança — tema do autoagendamento do paciente. */
export const confianca = createTheme(shared, {
  palette: {
    mode: 'light',
    primary: { main: '#2E4C9B', dark: '#1F3574', light: '#7A93D6', contrastText: '#FFFFFF' },
    secondary: { main: '#16856A' },
    success: { main: '#16856A' },
    warning: { main: '#A65E00' },
    error: { main: '#C0392F' },
    info: { main: '#2E4C9B' },
    background: { default: '#F4F6FB', paper: '#FFFFFF' },
    text: { primary: '#131A2B', secondary: '#5B657C' },
    divider: '#E4E8F2',
  },
  shape: { borderRadius: 14 },
  typography: {
    fontFamily: 'var(--font-plex), system-ui, sans-serif',
    h4: { fontFamily: 'var(--font-manrope)', fontSize: 30, fontWeight: 800, letterSpacing: '-0.7px' },
    h5: { fontFamily: 'var(--font-manrope)', fontSize: 22, fontWeight: 800, letterSpacing: '-0.5px' },
    h6: { fontFamily: 'var(--font-manrope)', fontSize: 18, fontWeight: 700 },
    body1: { fontSize: 16, lineHeight: 1.6 },
    body2: { fontSize: 13, lineHeight: 1.6 },
    button: { fontFamily: 'var(--font-manrope)', fontWeight: 700, textTransform: 'none' },
  },
  components: {
    MuiPaper: { defaultProps: { elevation: 0 } },
    MuiTextField: { defaultProps: { variant: 'filled', fullWidth: true } },
    MuiButton: {
      defaultProps: { disableElevation: true },
      // Alvo de toque maior: o paciente costuma estar no celular.
      styleOverrides: { root: { minHeight: 48, paddingLeft: 20, paddingRight: 20 } },
    },
    MuiAppBar: {
      defaultProps: { elevation: 0, color: 'transparent' },
      styleOverrides: { root: { backgroundColor: '#FFFFFF', borderBottom: '1px solid #E4E8F2' } },
    },
  },
});
