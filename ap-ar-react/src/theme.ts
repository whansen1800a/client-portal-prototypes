import { createTheme } from '@mui/material/styles';

const theme = createTheme({
  palette: {
    primary:    { main: '#F15F22' },
    secondary:  { main: '#2DA38D' },
    error:      { main: '#E0284A' },
    warning:    { main: '#784E03' },
    success:    { main: '#2DA38D' },
    info:       { main: '#1776B6' },
    text: {
      primary:   '#121724',
      secondary: 'rgba(18,23,36,0.65)',
    },
    background: {
      default: '#F7F7F7',
      paper:   '#FFFFFF',
    },
  },
  typography: {
    fontFamily: "'Poppins', 'Roboto', -apple-system, BlinkMacSystemFont, sans-serif",
    fontWeightLight:   300,
    fontWeightRegular: 400,
    fontWeightMedium:  500,
    fontWeightBold:    600,
  },
  shape: { borderRadius: 8 },
  components: {
    MuiButton: {
      styleOverrides: {
        root: { height: 36, textTransform: 'none', fontWeight: 500 },
      },
    },
    MuiChip: {
      styleOverrides: { root: { borderRadius: 999 } },
    },
    MuiTableHead: {
      styleOverrides: {
        root: { '& .MuiTableCell-head': { fontWeight: 600, fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em' } },
      },
    },
    MuiCard: {
      styleOverrides: { root: { borderRadius: 12, boxShadow: '0 1px 4px rgba(0,0,0,0.08)' } },
    },
  },
});

export default theme;
