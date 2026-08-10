import { createTheme } from '@mui/material/styles';

export const magoColors = {
  cloak: '#2A1450',
  cloakMid: '#3B1F6E',
  lining: '#EDE4F8',
  liningDeep: '#D9C6F0',
  inkOnCloak: '#F7F2FF',
  inkOnLining: '#2A1450',
  gold: '#E8C547',
  goldPress: '#C9A62E',
};

export const magoTheme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: magoColors.gold,
      dark: magoColors.goldPress,
      contrastText: magoColors.inkOnLining,
    },
    secondary: {
      main: magoColors.cloakMid,
      contrastText: magoColors.inkOnCloak,
    },
    background: {
      default: magoColors.cloak,
      paper: magoColors.lining,
    },
    text: {
      primary: magoColors.inkOnLining,
      secondary: magoColors.cloakMid,
    },
    error: {
      main: '#B33A3A',
    },
  },
  typography: {
    fontFamily: '"DM Sans", "Helvetica", "Arial", sans-serif',
    h1: {
      fontFamily: '"Fraunces", Georgia, serif',
      fontWeight: 650,
    },
    h2: {
      fontFamily: '"Fraunces", Georgia, serif',
      fontWeight: 600,
    },
    h6: {
      fontFamily: '"Fraunces", Georgia, serif',
      fontWeight: 600,
    },
    subtitle1: {
      fontFamily: '"Fraunces", Georgia, serif',
    },
    button: {
      fontFamily: '"DM Sans", "Helvetica", "Arial", sans-serif',
      fontWeight: 600,
      textTransform: 'none',
    },
  },
  shape: {
    borderRadius: 12,
  },
  components: {
    MuiButton: {
      styleOverrides: {
        containedPrimary: {
          boxShadow: 'none',
          '&:hover': {
            boxShadow: 'none',
            backgroundColor: magoColors.goldPress,
          },
        },
        containedSecondary: {
          boxShadow: 'none',
          '&:hover': {
            boxShadow: 'none',
            backgroundColor: magoColors.cloak,
          },
        },
        outlined: {
          borderColor: magoColors.cloakMid,
          color: magoColors.cloakMid,
        },
      },
    },
    MuiTextField: {
      defaultProps: {
        variant: 'filled',
      },
    },
    MuiFilledInput: {
      styleOverrides: {
        root: {
          backgroundColor: '#fff',
          '&:hover': {
            backgroundColor: '#fff',
          },
          '&.Mui-focused': {
            backgroundColor: '#fff',
          },
        },
      },
    },
    MuiAccordion: {
      styleOverrides: {
        root: {
          backgroundColor: magoColors.liningDeep,
          boxShadow: 'none',
          '&:before': { display: 'none' },
        },
      },
    },
  },
});
