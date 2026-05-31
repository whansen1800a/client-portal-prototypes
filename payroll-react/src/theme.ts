import { createTheme } from '@mui/material/styles';

const theme = createTheme({
  palette: {
    primary:    { main: '#2DA38D' },
    secondary:  { main: '#F15F22' },
    text:       { primary: '#121724', secondary: 'rgba(18,23,36,.55)' },
    background: { default: '#F7F7F7', paper: '#FFFFFF' },
  },
  typography: {
    fontFamily: "'Poppins', Roboto, system-ui",
    fontSize: 14,
  },
  shape: { borderRadius: 8 },
  components: {
    MuiButton: {
      styleOverrides: {
        root: { textTransform: 'none', fontWeight: 600 },
      },
    },
  },
});

export default theme;
