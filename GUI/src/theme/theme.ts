import { createTheme } from '@mui/material';

export const lightTheme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: '#1976d2',
    },
    secondary: {
      main: '#dc004e',
    },
    background: {
      default: '#f5f5f5',
      paper: '#ffffff',
    },
  },
  typography: {
    // Professional typography scaling - smaller, more compact sizes
    h1: {
      fontSize: '1.75rem', // was ~2.125rem
      fontWeight: 500,
    },
    h2: {
      fontSize: '1.5rem', // was ~1.875rem  
      fontWeight: 500,
    },
    h3: {
      fontSize: '1.25rem', // was ~1.5rem
      fontWeight: 500,
    },
    h4: {
      fontSize: '1.125rem', // was ~1.25rem
      fontWeight: 500,
    },
    h5: {
      fontSize: '1rem', // was ~1.125rem
      fontWeight: 500,
    },
    h6: {
      fontSize: '0.875rem', // was ~1rem - much smaller for navigation/toolbars
      fontWeight: 600,
    },
    subtitle1: {
      fontSize: '0.875rem', // was ~1rem
      fontWeight: 500,
    },
    subtitle2: {
      fontSize: '0.8125rem', // was ~0.875rem
      fontWeight: 500,
    },
    body1: {
      fontSize: '0.8125rem', // was ~0.875rem
    },
    body2: {
      fontSize: '0.75rem', // was ~0.8125rem
    },
    button: {
      fontSize: '0.75rem', // smaller buttons
      textTransform: 'none', // preserve case for professional look
    },
    caption: {
      fontSize: '0.6875rem', // was ~0.75rem
    },
  },
  components: {
    // Professional button defaults
    MuiButton: {
      defaultProps: {
        size: 'small', // Default all buttons to small
        disableElevation: true,
      },
      styleOverrides: {
        root: {
          textTransform: 'none',
          fontSize: '0.75rem',
          padding: '4px 12px',
          minHeight: 'auto',
        },
        sizeSmall: {
          padding: '2px 8px',
          fontSize: '0.6875rem',
        },
      },
    },
    // Professional input defaults
    MuiTextField: {
      defaultProps: {
        size: 'small',
      },
    },
    MuiFormControl: {
      defaultProps: {
        size: 'small',
      },
    },
    MuiSelect: {
      defaultProps: {
        size: 'small',
      },
    },
    // Professional icon button defaults
    MuiIconButton: {
      defaultProps: {
        size: 'small',
      },
      styleOverrides: {
        root: {
          padding: '4px',
        },
        sizeSmall: {
          padding: '2px',
        },
      },
    },
    // Professional chip defaults
    MuiChip: {
      defaultProps: {
        size: 'small',
      },
      styleOverrides: {
        root: {
          height: '20px',
          fontSize: '0.6875rem',
        },
        sizeSmall: {
          height: '18px',
          fontSize: '0.625rem',
        },
      },
    },
  },
});

export const darkTheme = createTheme({
  palette: {
    mode: 'dark',
    primary: {
      main: '#90caf9',
    },
    secondary: {
      main: '#f48fb1',
    },
    background: {
      default: '#0a0a0a',
      paper: '#141414',
    },
    divider: 'rgba(255, 255, 255, 0.12)',
  },
  typography: {
    // Professional typography scaling - smaller, more compact sizes
    h1: {
      fontSize: '1.75rem', // was ~2.125rem
      fontWeight: 500,
    },
    h2: {
      fontSize: '1.5rem', // was ~1.875rem  
      fontWeight: 500,
    },
    h3: {
      fontSize: '1.25rem', // was ~1.5rem
      fontWeight: 500,
    },
    h4: {
      fontSize: '1.125rem', // was ~1.25rem
      fontWeight: 500,
    },
    h5: {
      fontSize: '1rem', // was ~1.125rem
      fontWeight: 500,
    },
    h6: {
      fontSize: '0.875rem', // was ~1rem - much smaller for navigation/toolbars
      fontWeight: 600,
    },
    subtitle1: {
      fontSize: '0.875rem', // was ~1rem
      fontWeight: 500,
    },
    subtitle2: {
      fontSize: '0.8125rem', // was ~0.875rem
      fontWeight: 500,
    },
    body1: {
      fontSize: '0.8125rem', // was ~0.875rem
    },
    body2: {
      fontSize: '0.75rem', // was ~0.8125rem
    },
    button: {
      fontSize: '0.75rem', // smaller buttons
      textTransform: 'none', // preserve case for professional look
    },
    caption: {
      fontSize: '0.6875rem', // was ~0.75rem
    },
  },
  components: {
    // Professional button defaults
    MuiButton: {
      defaultProps: {
        size: 'small', // Default all buttons to small
        disableElevation: true,
      },
      styleOverrides: {
        root: {
          textTransform: 'none',
          fontSize: '0.75rem',
          padding: '4px 12px',
          minHeight: 'auto',
        },
        sizeSmall: {
          padding: '2px 8px',
          fontSize: '0.6875rem',
        },
      },
    },
    // Professional input defaults
    MuiTextField: {
      defaultProps: {
        size: 'small',
      },
    },
    MuiFormControl: {
      defaultProps: {
        size: 'small',
      },
    },
    MuiSelect: {
      defaultProps: {
        size: 'small',
      },
    },
    // Professional icon button defaults
    MuiIconButton: {
      defaultProps: {
        size: 'small',
      },
      styleOverrides: {
        root: {
          padding: '4px',
        },
        sizeSmall: {
          padding: '2px',
        },
      },
    },
    // Professional chip defaults
    MuiChip: {
      defaultProps: {
        size: 'small',
      },
      styleOverrides: {
        root: {
          height: '20px',
          fontSize: '0.6875rem',
        },
        sizeSmall: {
          height: '18px',
          fontSize: '0.625rem',
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundImage: 'none',
          borderRadius: 8,
          border: '1px solid rgba(255, 255, 255, 0.12)',
        },
      },
    },
    MuiAppBar: {
      styleOverrides: {
        root: {
          backgroundColor: '#111111',
          borderBottom: '1px solid rgba(255, 255, 255, 0.12)',
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          border: '1px solid rgba(255, 255, 255, 0.12)',
          backgroundColor: '#141414',
        },
      },
    },
    MuiTableCell: {
      styleOverrides: {
        root: {
          borderColor: 'rgba(255, 255, 255, 0.12)',
        },
      },
    },
    MuiTabs: {
      styleOverrides: {
        root: {
          backgroundColor: '#111111',
          borderBottom: '1px solid rgba(255, 255, 255, 0.12)',
        },
      },
    },
  },
});
