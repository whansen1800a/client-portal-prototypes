import { createTheme } from '@mui/material/styles';

const theme = createTheme({
  palette: {
    primary:    { main: '#F15F22', contrastText: '#FFFFFF' },
    secondary:  { main: '#2DA38D', contrastText: '#FFFFFF' },
    error:      { main: '#E0284A' },
    warning:    { main: '#784E03', light: '#FFCF7C' },
    success:    { main: '#2DA38D', light: '#DBF6E7' },
    info:       { main: '#1776B6', light: '#EBF3FF' },
    text: {
      primary:   '#121724',
      secondary: 'rgba(18,23,36,0.65)',
      disabled:  'rgba(18,23,36,0.42)',
    },
    background: {
      default: '#F7F7F7',
      paper:   '#FFFFFF',
    },
    divider: 'rgba(0,0,0,0.12)',
    action: {
      hover:    'rgba(0,0,0,0.08)',
      selected: '#DBF6E7',
    },
  },
  typography: {
    fontFamily: "'Poppins', 'Roboto', -apple-system, BlinkMacSystemFont, sans-serif",
    fontWeightLight:   300,
    fontWeightRegular: 400,
    fontWeightMedium:  500,
    fontWeightBold:    600,
    caption: { fontSize: '0.75rem',  lineHeight: 1.33 },
    body2:   { fontSize: '0.875rem', lineHeight: 1.43 },
    body1:   { fontSize: '1rem',     lineHeight: 1.5  },
    h6:      { fontSize: '1.125rem', fontWeight: 600  },
    h5:      { fontSize: '1.5rem',   fontWeight: 600  },
    h4:      { fontSize: '1.75rem',  fontWeight: 600  },
    overline: {
      fontSize: '0.625rem',
      fontWeight: 700,
      letterSpacing: '0.08em',
      textTransform: 'uppercase' as const,
    },
  },
  shape: { borderRadius: 8 },
  components: {
    MuiCssBaseline: {
      styleOverrides: {
        body: { backgroundColor: '#F7F7F7' },
      },
    },
    MuiButton: {
      defaultProps: { disableElevation: true },
      styleOverrides: {
        root: {
          height: 36,
          textTransform: 'none',
          fontWeight: 500,
          fontSize: '0.875rem',
        },
        sizeSmall: { height: 28, fontSize: '0.75rem' },
        sizeLarge:  { height: 52, fontSize: '1rem' },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: { borderRadius: 999 },
      },
    },
    MuiCheckbox: {
      defaultProps: { color: 'secondary' },
    },
    MuiTableCell: {
      styleOverrides: {
        root: { borderColor: 'rgba(0,0,0,0.04)' },
        head: {
          fontSize: '0.75rem',
          fontWeight: 700,
          color: 'rgba(18,23,36,0.5)',
          textTransform: 'uppercase' as const,
          letterSpacing: '0.06em',
          backgroundColor: '#FFFFFF',
        },
      },
    },
    MuiTableRow: {
      styleOverrides: {
        root: {
          '&:last-child td': { borderBottom: 0 },
        },
      },
    },
    MuiPaper: {
      defaultProps: { elevation: 0 },
      styleOverrides: {
        root: {
          boxShadow: '0 2px 4px rgba(18,23,36,0.06), 0 1px 2px rgba(18,23,36,0.04)',
        },
      },
    },
    MuiAvatar: {
      styleOverrides: {
        root: {
          width: 36,
          height: 36,
          fontSize: '0.8125rem',
          fontWeight: 600,
          borderRadius: '50%',
        },
      },
    },
  },
});

export default theme;
