import { createTheme } from '@mui/material/styles';

// Define breakpoints for responsive design
const breakpoints = {
  values: {
    xs: 0,      // Mobile
    sm: 600,    // Tablet
    md: 960,    // Desktop
    lg: 1280,   // Large Desktop
    xl: 1920,   // Extra Large Desktop
  },
};

// Create responsive theme
const theme = createTheme({
  breakpoints,
  palette: {
    primary: {
      main: '#1976d2',
      light: '#42a5f5',
      dark: '#1565c0',
      contrastText: '#ffffff',
    },
    secondary: {
      main: '#dc004e',
      light: '#f48fb1',
      dark: '#c51162',
      contrastText: '#ffffff',
    },
    background: {
      default: '#fafafa',
      paper: '#ffffff',
    },
    text: {
      primary: 'rgba(0, 0, 0, 0.87)',
      secondary: 'rgba(0, 0, 0, 0.6)',
    },
  },
  typography: {
    fontFamily: [
      'Noto Sans KR',
      '-apple-system',
      'BlinkMacSystemFont',
      '"Segoe UI"',
      'Roboto',
      '"Helvetica Neue"',
      'Arial',
      'sans-serif',
    ].join(','),
    h1: {
      fontSize: '2.5rem',
      fontWeight: 600,
      lineHeight: 1.2,
      '@media (max-width:600px)': {
        fontSize: '2rem',
      },
    },
    h2: {
      fontSize: '2rem',
      fontWeight: 600,
      lineHeight: 1.3,
      '@media (max-width:600px)': {
        fontSize: '1.75rem',
      },
    },
    h3: {
      fontSize: '1.75rem',
      fontWeight: 600,
      lineHeight: 1.4,
      '@media (max-width:600px)': {
        fontSize: '1.5rem',
      },
    },
    h4: {
      fontSize: '1.5rem',
      fontWeight: 600,
      lineHeight: 1.4,
      '@media (max-width:600px)': {
        fontSize: '1.25rem',
      },
    },
    h5: {
      fontSize: '1.25rem',
      fontWeight: 600,
      lineHeight: 1.5,
    },
    h6: {
      fontSize: '1rem',
      fontWeight: 600,
      lineHeight: 1.6,
    },
    body1: {
      fontSize: '1rem',
      lineHeight: 1.5,
      '@media (max-width:600px)': {
        fontSize: '0.875rem',
      },
    },
    body2: {
      fontSize: '0.875rem',
      lineHeight: 1.43,
    },
    button: {
      textTransform: 'none',
      fontWeight: 500,
    },
  },
  spacing: 8, // 8px base spacing
  shape: {
    borderRadius: 8,
  },
  components: {
    // Button optimizations for mobile
    MuiButton: {
      styleOverrides: {
        root: {
          minHeight: 44, // Touch-friendly minimum height
          padding: '8px 16px',
          '@media (max-width:600px)': {
            minHeight: 48, // Larger on mobile
            padding: '12px 16px',
          },
        },
        sizeSmall: {
          minHeight: 36,
          padding: '6px 12px',
          '@media (max-width:600px)': {
            minHeight: 44,
            padding: '10px 16px',
          },
        },
        sizeLarge: {
          minHeight: 52,
          padding: '12px 24px',
          '@media (max-width:600px)': {
            minHeight: 56,
            padding: '16px 24px',
          },
        },
      },
    },
    // IconButton optimizations for mobile
    MuiIconButton: {
      styleOverrides: {
        root: {
          padding: 8,
          '@media (max-width:600px)': {
            padding: 12,
            minWidth: 44,
            minHeight: 44,
          },
        },
        sizeSmall: {
          padding: 6,
          '@media (max-width:600px)': {
            padding: 8,
            minWidth: 40,
            minHeight: 40,
          },
        },
        sizeLarge: {
          padding: 12,
          '@media (max-width:600px)': {
            padding: 16,
            minWidth: 56,
            minHeight: 56,
          },
        },
      },
    },
    // Card optimizations
    MuiCard: {
      styleOverrides: {
        root: {
          boxShadow: '0 2px 8px 0 rgba(0,0,0,0.12)',
          '&:hover': {
            boxShadow: '0 4px 16px 0 rgba(0,0,0,0.16)',
          },
          '@media (max-width:600px)': {
            boxShadow: '0 1px 4px 0 rgba(0,0,0,0.12)',
            '&:hover': {
              boxShadow: '0 2px 8px 0 rgba(0,0,0,0.16)',
            },
          },
        },
      },
    },
    // Container responsive padding
    MuiContainer: {
      styleOverrides: {
        root: {
          paddingLeft: 24,
          paddingRight: 24,
          '@media (max-width:600px)': {
            paddingLeft: 16,
            paddingRight: 16,
          },
        },
      },
    },
    // Paper elevation adjustments for mobile
    MuiPaper: {
      styleOverrides: {
        elevation2: {
          '@media (max-width:600px)': {
            boxShadow: '0 1px 3px 0 rgba(0,0,0,0.12)',
          },
        },
        elevation4: {
          '@media (max-width:600px)': {
            boxShadow: '0 2px 6px 0 rgba(0,0,0,0.16)',
          },
        },
      },
    },
    // AppBar mobile optimization
    MuiAppBar: {
      styleOverrides: {
        root: {
          '@media (max-width:600px)': {
            '& .MuiToolbar-root': {
              minHeight: 56,
              paddingLeft: 16,
              paddingRight: 16,
            },
          },
        },
      },
    },
    // Drawer responsive width
    MuiDrawer: {
      styleOverrides: {
        paper: {
          '@media (max-width:600px)': {
            width: '85%',
            maxWidth: 320,
          },
        },
      },
    },
  },
});

export default theme;