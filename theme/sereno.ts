import { createTheme } from '@mui/material/styles';
import { shared } from './tokens';

/** Sereno — tema do operador (atendente, médico, admin). */
export const sereno = createTheme(shared, {
  palette: {
    mode: 'light',
    primary: { main: '#12787E', dark: '#0B5A5F', light: '#4FA5A9', contrastText: '#FFFFFF' },
    secondary: { main: '#C2564B' },
    success: { main: '#2E7D5B' },
    warning: { main: '#A16207' },
    error: { main: '#B3261E' },
    info: { main: '#0B6E99' },
    background: { default: '#F6F8F8', paper: '#FFFFFF' },
    text: { primary: '#14201F', secondary: '#5A6B6A' },
    divider: '#E1E6E6',
  },
  shape: { borderRadius: 8 },
  typography: {
    fontFamily: 'var(--font-roboto), system-ui, sans-serif',
    h4: { fontSize: 34, fontWeight: 400, letterSpacing: '-0.5px' },
    h5: { fontSize: 24, fontWeight: 400 },
    h6: { fontSize: 20, fontWeight: 500 },
    body1: { fontSize: 15, lineHeight: 1.55 },
    body2: { fontSize: 13, lineHeight: 1.55 },
    caption: { fontSize: 12 },
  },
  components: {
    MuiAppBar: {
      defaultProps: { elevation: 0, color: 'primary' },
      styleOverrides: { root: { height: 60 } },
    },
    MuiPaper: { styleOverrides: { root: { backgroundImage: 'none' } } },
  },
});

/** Sereno escuro — consultório com luz baixa.
 *  A app bar deixa de ser teal sólida e vira paper com borda. */
export const serenoDark = createTheme(shared, {
  palette: {
    mode: 'dark',
    primary: { main: '#5FBDBF', dark: '#12787E', light: '#8FD5D6', contrastText: '#0E1717' },
    secondary: { main: '#E0857A' },
    success: { main: '#66C69B' },
    warning: { main: '#D9A63C' },
    error: { main: '#E9837B' },
    background: { default: '#0E1717', paper: '#16211F' },
    text: { primary: '#E6EDEC', secondary: '#8FA3A2' },
    divider: '#253433',
  },
  shape: { borderRadius: 8 },
  typography: sereno.typography,
  components: {
    MuiAppBar: {
      defaultProps: { elevation: 0, color: 'default' },
      styleOverrides: { root: { height: 60, borderBottom: '1px solid #253433', backgroundColor: '#16211F' } },
    },
  },
});
