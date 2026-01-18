import { createTheme } from '@mui/material/styles'

const theme = createTheme({
  palette: {
    mode: 'dark',
    primary: {
      main: '#4bb4ff',
    },
    secondary: {
      main: '#6fd1ff',
    },
    background: {
      default: '#0b1d3a',
      paper: 'rgba(14, 32, 64, 0.92)',
    },
    text: {
      primary: '#eaf2ff',
      secondary: '#b8c7e6',
    },
  },
  typography: {
    fontFamily: '"Space Grotesk", "Helvetica", "Arial", sans-serif',
    h3: {
      fontWeight: 700,
    },
    h4: {
      fontWeight: 700,
    },
    h6: {
      fontWeight: 600,
    },
  },
  shape: {
    borderRadius: 16,
  },
  components: {
    MuiCssBaseline: {
      styleOverrides: {
        body: {
          background:
            'linear-gradient(180deg, #3a78d6 0%, #1e4fb2 45%, #0b1d3a 100%)',
        },
      },
    },
  },
})

export default theme
