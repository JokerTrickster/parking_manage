import { createTheme, Theme } from '@mui/material/styles';

declare module '@mui/material/styles' {
  interface Palette {
    neutral: Palette['primary'];
    accent: Palette['primary'];
    glass: {
      light: string;
      medium: string;
      dark: string;
    };
  }
  interface PaletteOptions {
    neutral?: PaletteOptions['primary'];
    accent?: PaletteOptions['primary'];
    glass?: {
      light: string;
      medium: string;
      dark: string;
    };
  }
  interface TypeBackground {
    elevated: string;
    surface: string;
  }
}

// ============================
// DESIGN TOKENS
// ============================

// Primary Colors - Blue with gradient support
const PRIMARY_MAIN = '#3b82f6';
const PRIMARY_DARK = '#2563eb';
const PRIMARY_LIGHT = '#60a5fa';
const PRIMARY_GRADIENT = 'linear-gradient(135deg, #3b82f6 0%, #60a5fa 100%)';

// Secondary Colors - Green
const SECONDARY_MAIN = '#10b981';
const SECONDARY_DARK = '#059669';
const SECONDARY_LIGHT = '#34d399';

// Accent Colors - Purple/Violet
const ACCENT_MAIN = '#8b5cf6';
const ACCENT_DARK = '#7c3aed';
const ACCENT_LIGHT = '#a78bfa';
const ACCENT_GRADIENT = 'linear-gradient(135deg, #8b5cf6 0%, #a78bfa 100%)';

// Semantic Status Colors
const STATUS_SUCCESS = '#10b981';
const STATUS_WARNING = '#f59e0b';
const STATUS_ERROR = '#ef4444';
const STATUS_INFO = '#3b82f6';

// Dark Theme Palette
const DARK_BG_DEFAULT = '#0a0a0a';        // Pure black base
const DARK_BG_PAPER = '#141414';          // Elevated surface
const DARK_BG_ELEVATED = '#1a1a1a';       // Modal/drawer backgrounds
const DARK_BG_SURFACE = '#1e1e1e';        // Card surfaces

const DARK_TEXT_PRIMARY = '#f5f5f5';
const DARK_TEXT_SECONDARY = '#a3a3a3';
const DARK_TEXT_TERTIARY = '#737373';
const DARK_TEXT_DISABLED = '#525252';

const DARK_BORDER_SUBTLE = 'rgba(255, 255, 255, 0.06)';
const DARK_BORDER_MEDIUM = 'rgba(255, 255, 255, 0.12)';
const DARK_BORDER_STRONG = 'rgba(255, 255, 255, 0.18)';

// Glass effect colors for dark mode
const DARK_GLASS_LIGHT = 'rgba(255, 255, 255, 0.05)';
const DARK_GLASS_MEDIUM = 'rgba(255, 255, 255, 0.08)';
const DARK_GLASS_DARK = 'rgba(0, 0, 0, 0.3)';

// Light Theme Palette
const LIGHT_BG_DEFAULT = '#f8f9fa';       // Soft grey background
const LIGHT_BG_PAPER = '#ffffff';         // Pure white
const LIGHT_BG_ELEVATED = '#ffffff';      // Modal/drawer backgrounds
const LIGHT_BG_SURFACE = '#f5f6f8';       // Card surfaces

const LIGHT_TEXT_PRIMARY = '#1a1a1a';
const LIGHT_TEXT_SECONDARY = '#525252';
const LIGHT_TEXT_TERTIARY = '#737373';
const LIGHT_TEXT_DISABLED = '#a3a3a3';

const LIGHT_BORDER_SUBTLE = 'rgba(0, 0, 0, 0.06)';
const LIGHT_BORDER_MEDIUM = 'rgba(0, 0, 0, 0.12)';
const LIGHT_BORDER_STRONG = 'rgba(0, 0, 0, 0.18)';

// Glass effect colors for light mode
const LIGHT_GLASS_LIGHT = 'rgba(255, 255, 255, 0.7)';
const LIGHT_GLASS_MEDIUM = 'rgba(255, 255, 255, 0.85)';
const LIGHT_GLASS_DARK = 'rgba(0, 0, 0, 0.05)';

// ============================
// ELEVATION SHADOWS
// ============================

const DARK_SHADOWS = {
  sm: '0 1px 2px 0 rgba(0, 0, 0, 0.5)',
  md: '0 4px 6px -1px rgba(0, 0, 0, 0.4), 0 2px 4px -2px rgba(0, 0, 0, 0.3)',
  lg: '0 10px 15px -3px rgba(0, 0, 0, 0.5), 0 4px 6px -4px rgba(0, 0, 0, 0.4)',
  xl: '0 20px 25px -5px rgba(0, 0, 0, 0.6), 0 8px 10px -6px rgba(0, 0, 0, 0.5)',
  '2xl': '0 25px 50px -12px rgba(0, 0, 0, 0.7)',
  glow: '0 0 20px rgba(59, 130, 246, 0.3)',
};

const LIGHT_SHADOWS = {
  sm: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
  md: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -2px rgba(0, 0, 0, 0.08)',
  lg: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -4px rgba(0, 0, 0, 0.08)',
  xl: '0 20px 25px -5px rgba(0, 0, 0, 0.12), 0 8px 10px -6px rgba(0, 0, 0, 0.1)',
  '2xl': '0 25px 50px -12px rgba(0, 0, 0, 0.15)',
  glow: '0 0 20px rgba(59, 130, 246, 0.2)',
};

export const getTheme = (mode: 'dark' | 'light'): Theme => {
  const isDark = mode === 'dark';

  return createTheme({
    palette: {
      mode,
      primary: {
        main: PRIMARY_MAIN,
        dark: PRIMARY_DARK,
        light: PRIMARY_LIGHT,
        contrastText: '#ffffff',
      },
      secondary: {
        main: SECONDARY_MAIN,
        dark: SECONDARY_DARK,
        light: SECONDARY_LIGHT,
        contrastText: '#ffffff',
      },
      accent: {
        main: ACCENT_MAIN,
        dark: ACCENT_DARK,
        light: ACCENT_LIGHT,
        contrastText: '#ffffff',
      },
      neutral: {
        main: '#64748B',
        contrastText: '#fff',
      },
      background: {
        default: isDark ? DARK_BG_DEFAULT : LIGHT_BG_DEFAULT,
        paper: isDark ? DARK_BG_PAPER : LIGHT_BG_PAPER,
        elevated: isDark ? DARK_BG_ELEVATED : LIGHT_BG_ELEVATED,
        surface: isDark ? DARK_BG_SURFACE : LIGHT_BG_SURFACE,
      },
      text: {
        primary: isDark ? DARK_TEXT_PRIMARY : LIGHT_TEXT_PRIMARY,
        secondary: isDark ? DARK_TEXT_SECONDARY : LIGHT_TEXT_SECONDARY,
        disabled: isDark ? DARK_TEXT_DISABLED : LIGHT_TEXT_DISABLED,
      },
      success: {
        main: STATUS_SUCCESS,
        light: '#34d399',
        dark: '#059669',
        contrastText: '#ffffff',
      },
      warning: {
        main: STATUS_WARNING,
        light: '#fbbf24',
        dark: '#d97706',
        contrastText: '#ffffff',
      },
      error: {
        main: STATUS_ERROR,
        light: '#f87171',
        dark: '#dc2626',
        contrastText: '#ffffff',
      },
      info: {
        main: STATUS_INFO,
        light: '#60a5fa',
        dark: '#2563eb',
        contrastText: '#ffffff',
      },
      glass: {
        light: isDark ? DARK_GLASS_LIGHT : LIGHT_GLASS_LIGHT,
        medium: isDark ? DARK_GLASS_MEDIUM : LIGHT_GLASS_MEDIUM,
        dark: isDark ? DARK_GLASS_DARK : LIGHT_GLASS_DARK,
      },
      divider: isDark ? DARK_BORDER_SUBTLE : LIGHT_BORDER_SUBTLE,
    },
    typography: {
      fontFamily: [
        'Pretendard',
        'Inter',
        '-apple-system',
        'BlinkMacSystemFont',
        'system-ui',
        'Roboto',
        '"Helvetica Neue"',
        '"Segoe UI"',
        '"Apple SD Gothic Neo"',
        '"Malgun Gothic"',
        'sans-serif',
      ].join(','),
      h1: {
        fontWeight: 800,
        fontSize: '2.5rem',
        lineHeight: 1.2,
        letterSpacing: '-0.02em',
      },
      h2: {
        fontWeight: 700,
        fontSize: '2rem',
        lineHeight: 1.3,
        letterSpacing: '-0.01em',
      },
      h3: {
        fontWeight: 700,
        fontSize: '1.75rem',
        lineHeight: 1.3,
      },
      h4: {
        fontWeight: 600,
        fontSize: '1.5rem',
        lineHeight: 1.4,
      },
      h5: {
        fontWeight: 600,
        fontSize: '1.25rem',
        lineHeight: 1.4,
      },
      h6: {
        fontWeight: 600,
        fontSize: '1rem',
        lineHeight: 1.5,
      },
      subtitle1: {
        fontWeight: 500,
        fontSize: '1rem',
        lineHeight: 1.5,
      },
      subtitle2: {
        fontWeight: 500,
        fontSize: '0.875rem',
        lineHeight: 1.5,
      },
      body1: {
        fontSize: '1rem',
        lineHeight: 1.6,
      },
      body2: {
        fontSize: '0.875rem',
        lineHeight: 1.6,
      },
      button: {
        fontWeight: 600,
        textTransform: 'none',
        letterSpacing: '0.01em',
      },
      caption: {
        fontSize: '0.75rem',
        lineHeight: 1.5,
      },
      overline: {
        fontSize: '0.75rem',
        fontWeight: 700,
        textTransform: 'uppercase',
        letterSpacing: '0.08em',
      },
    },
    shape: {
      borderRadius: 8,
    },
    spacing: 8, // 8px grid system
    components: {
      MuiCssBaseline: {
        styleOverrides: `
          @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap');

          * {
            box-sizing: border-box;
          }

          ::-webkit-scrollbar {
            width: 8px;
            height: 8px;
          }

          ::-webkit-scrollbar-track {
            background: ${isDark ? DARK_BG_PAPER : LIGHT_BG_SURFACE};
          }

          ::-webkit-scrollbar-thumb {
            background: ${isDark ? 'rgba(255, 255, 255, 0.2)' : 'rgba(0, 0, 0, 0.2)'};
            border-radius: 4px;
          }

          ::-webkit-scrollbar-thumb:hover {
            background: ${isDark ? 'rgba(255, 255, 255, 0.3)' : 'rgba(0, 0, 0, 0.3)'};
          }
        `,
      },
      MuiButton: {
        styleOverrides: {
          root: {
            borderRadius: 8,
            padding: '10px 24px',
            fontSize: '0.9375rem',
            fontWeight: 600,
            transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
            boxShadow: 'none',
            '&:hover': {
              boxShadow: 'none',
              transform: 'translateY(-1px)',
            },
            '&:active': {
              transform: 'translateY(0)',
            },
          },
          contained: {
            background: PRIMARY_GRADIENT,
            '&:hover': {
              background: `linear-gradient(135deg, ${PRIMARY_DARK} 0%, ${PRIMARY_MAIN} 100%)`,
              boxShadow: isDark ? DARK_SHADOWS.md : LIGHT_SHADOWS.md,
            },
          },
          outlined: {
            borderWidth: '1.5px',
            borderColor: isDark ? DARK_BORDER_MEDIUM : LIGHT_BORDER_MEDIUM,
            '&:hover': {
              borderWidth: '1.5px',
              borderColor: PRIMARY_MAIN,
              backgroundColor: isDark ? 'rgba(59, 130, 246, 0.08)' : 'rgba(59, 130, 246, 0.05)',
            },
          },
          text: {
            '&:hover': {
              backgroundColor: isDark ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.04)',
            },
          },
          sizeLarge: {
            padding: '14px 32px',
            fontSize: '1rem',
          },
          sizeSmall: {
            padding: '6px 16px',
            fontSize: '0.8125rem',
          },
        },
      },
      MuiCard: {
        styleOverrides: {
          root: {
            borderRadius: 12,
            border: `1px solid ${isDark ? DARK_BORDER_SUBTLE : LIGHT_BORDER_SUBTLE}`,
            boxShadow: 'none',
            backgroundImage: 'none',
            backgroundColor: isDark ? DARK_BG_PAPER : LIGHT_BG_PAPER,
            transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
            '&:hover': {
              transform: 'translateY(-4px)',
              borderColor: `${PRIMARY_MAIN}80`,
              boxShadow: isDark ? DARK_SHADOWS.xl : LIGHT_SHADOWS.xl,
            },
          },
        },
      },
      MuiPaper: {
        styleOverrides: {
          root: {
            backgroundImage: 'none',
            backgroundColor: isDark ? DARK_BG_PAPER : LIGHT_BG_PAPER,
          },
          rounded: {
            borderRadius: 12,
          },
          elevation1: {
            boxShadow: isDark ? DARK_SHADOWS.sm : LIGHT_SHADOWS.sm,
          },
          elevation2: {
            boxShadow: isDark ? DARK_SHADOWS.md : LIGHT_SHADOWS.md,
          },
          elevation3: {
            boxShadow: isDark ? DARK_SHADOWS.lg : LIGHT_SHADOWS.lg,
          },
        },
      },
      MuiChip: {
        styleOverrides: {
          root: {
            borderRadius: 6,
            fontWeight: 600,
            fontSize: '0.6875rem',
            height: '24px',
            letterSpacing: '0.02em',
            textTransform: 'uppercase',
            transition: 'all 0.2s ease',
          },
          filled: {
            '&:hover': {
              transform: 'scale(1.05)',
            },
          },
        },
      },
      MuiIconButton: {
        styleOverrides: {
          root: {
            borderRadius: 8,
            transition: 'all 0.2s ease',
            '&:hover': {
              transform: 'scale(1.05)',
            },
          },
        },
      },
      MuiTextField: {
        styleOverrides: {
          root: {
            '& .MuiOutlinedInput-root': {
              borderRadius: 8,
              transition: 'all 0.2s ease',
              '&:hover': {
                '& .MuiOutlinedInput-notchedOutline': {
                  borderColor: isDark ? DARK_BORDER_MEDIUM : LIGHT_BORDER_MEDIUM,
                },
              },
              '&.Mui-focused': {
                '& .MuiOutlinedInput-notchedOutline': {
                  borderWidth: '2px',
                  borderColor: PRIMARY_MAIN,
                },
              },
            },
          },
        },
      },
      MuiInputBase: {
        styleOverrides: {
          root: {
            '&::placeholder': {
              opacity: 0.6,
            },
          },
        },
      },
      MuiDivider: {
        styleOverrides: {
          root: {
            borderColor: isDark ? DARK_BORDER_SUBTLE : LIGHT_BORDER_SUBTLE,
          },
        },
      },
      MuiAppBar: {
        styleOverrides: {
          root: {
            backgroundImage: 'none',
            boxShadow: 'none',
            borderBottom: `1px solid ${isDark ? DARK_BORDER_SUBTLE : LIGHT_BORDER_SUBTLE}`,
          },
        },
      },
      MuiDrawer: {
        styleOverrides: {
          paper: {
            backgroundImage: 'none',
            borderRight: `1px solid ${isDark ? DARK_BORDER_SUBTLE : LIGHT_BORDER_SUBTLE}`,
            borderLeft: `1px solid ${isDark ? DARK_BORDER_SUBTLE : LIGHT_BORDER_SUBTLE}`,
          },
        },
      },
      MuiListItemButton: {
        styleOverrides: {
          root: {
            borderRadius: 6,
            margin: '2px 8px',
            transition: 'all 0.2s ease',
            '&.Mui-selected': {
              backgroundColor: isDark ? 'rgba(59, 130, 246, 0.15)' : 'rgba(59, 130, 246, 0.1)',
              '&:hover': {
                backgroundColor: isDark ? 'rgba(59, 130, 246, 0.2)' : 'rgba(59, 130, 246, 0.15)',
              },
            },
            '&:hover': {
              backgroundColor: isDark ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.04)',
            },
          },
        },
      },
      MuiTooltip: {
        styleOverrides: {
          tooltip: {
            backgroundColor: isDark ? DARK_BG_ELEVATED : LIGHT_BG_ELEVATED,
            color: isDark ? DARK_TEXT_PRIMARY : LIGHT_TEXT_PRIMARY,
            border: `1px solid ${isDark ? DARK_BORDER_MEDIUM : LIGHT_BORDER_MEDIUM}`,
            boxShadow: isDark ? DARK_SHADOWS.lg : LIGHT_SHADOWS.lg,
            fontSize: '0.8125rem',
            borderRadius: 6,
            padding: '8px 12px',
          },
          arrow: {
            color: isDark ? DARK_BG_ELEVATED : LIGHT_BG_ELEVATED,
            '&::before': {
              border: `1px solid ${isDark ? DARK_BORDER_MEDIUM : LIGHT_BORDER_MEDIUM}`,
            },
          },
        },
      },
      MuiAlert: {
        styleOverrides: {
          root: {
            borderRadius: 8,
            border: `1px solid`,
          },
          standardSuccess: {
            backgroundColor: isDark ? 'rgba(16, 185, 129, 0.15)' : 'rgba(16, 185, 129, 0.1)',
            borderColor: STATUS_SUCCESS,
          },
          standardError: {
            backgroundColor: isDark ? 'rgba(239, 68, 68, 0.15)' : 'rgba(239, 68, 68, 0.1)',
            borderColor: STATUS_ERROR,
          },
          standardWarning: {
            backgroundColor: isDark ? 'rgba(245, 158, 11, 0.15)' : 'rgba(245, 158, 11, 0.1)',
            borderColor: STATUS_WARNING,
          },
          standardInfo: {
            backgroundColor: isDark ? 'rgba(59, 130, 246, 0.15)' : 'rgba(59, 130, 246, 0.1)',
            borderColor: STATUS_INFO,
          },
        },
      },
    },
  });
};

// Export gradients for custom usage
export const GRADIENTS = {
  primary: PRIMARY_GRADIENT,
  accent: ACCENT_GRADIENT,
  success: 'linear-gradient(135deg, #10b981 0%, #34d399 100%)',
  warning: 'linear-gradient(135deg, #f59e0b 0%, #fbbf24 100%)',
  error: 'linear-gradient(135deg, #ef4444 0%, #f87171 100%)',
  night: 'linear-gradient(180deg, #0a0a0a 0%, #1a1a1a 100%)',
  dawn: 'linear-gradient(180deg, #f8f9fa 0%, #ffffff 100%)',
};

// Export shadows for custom usage
export const SHADOWS = {
  dark: DARK_SHADOWS,
  light: LIGHT_SHADOWS,
};

// Default theme (dark mode)
const theme = getTheme('dark');
export default theme;
