import { Theme, SxProps } from '@mui/material/styles';

// Responsive utility functions and common patterns

// Common responsive grid system
export const responsiveGrid = {
  container: {
    display: 'grid',
    gap: { xs: 2, sm: 3, md: 4 },
    gridTemplateColumns: {
      xs: '1fr',
      sm: 'repeat(2, 1fr)',
      md: 'repeat(3, 1fr)',
      lg: 'repeat(4, 1fr)',
    },
  } as SxProps<Theme>,

  // File grid for repository
  fileGrid: {
    display: 'grid',
    gap: { xs: 1, sm: 2 },
    gridTemplateColumns: {
      xs: 'repeat(2, 1fr)',
      sm: 'repeat(3, 1fr)',
      md: 'repeat(4, 1fr)',
      lg: 'repeat(5, 1fr)',
    },
  } as SxProps<Theme>,

  // Status grid for parking monitoring
  statusGrid: {
    display: 'grid',
    gap: { xs: 1, sm: 2 },
    gridTemplateColumns: {
      xs: 'repeat(2, 1fr)',
      sm: 'repeat(4, 1fr)',
      md: 'repeat(6, 1fr)',
      lg: 'repeat(8, 1fr)',
    },
  } as SxProps<Theme>,

  // Two column layout
  twoColumn: {
    display: 'grid',
    gap: { xs: 2, md: 3 },
    gridTemplateColumns: {
      xs: '1fr',
      md: 'repeat(2, 1fr)',
    },
  } as SxProps<Theme>,

  // Three column layout
  threeColumn: {
    display: 'grid',
    gap: { xs: 2, md: 3 },
    gridTemplateColumns: {
      xs: '1fr',
      sm: 'repeat(2, 1fr)',
      lg: 'repeat(3, 1fr)',
    },
  } as SxProps<Theme>,
};

// Common responsive spacing
export const responsiveSpacing = {
  // Page padding
  pagePadding: {
    px: { xs: 2, sm: 3, md: 4 },
    py: { xs: 2, sm: 3 },
  } as SxProps<Theme>,

  // Section margin
  sectionMargin: {
    mb: { xs: 3, sm: 4, md: 5 },
  } as SxProps<Theme>,

  // Card padding
  cardPadding: {
    p: { xs: 2, sm: 3 },
  } as SxProps<Theme>,

  // Dialog padding
  dialogPadding: {
    p: { xs: 2, sm: 3, md: 4 },
  } as SxProps<Theme>,
};

// Touch-friendly interactive elements
export const touchFriendly = {
  // Minimum 44px touch target
  minTouchTarget: {
    minWidth: 44,
    minHeight: 44,
    '@media (max-width:600px)': {
      minWidth: 48,
      minHeight: 48,
    },
  } as SxProps<Theme>,

  // Button with proper touch sizing
  button: {
    minHeight: { xs: 48, sm: 44 },
    px: { xs: 3, sm: 2 },
    py: { xs: 1.5, sm: 1 },
  } as SxProps<Theme>,

  // Icon button with touch optimization
  iconButton: {
    minWidth: { xs: 48, sm: 44 },
    minHeight: { xs: 48, sm: 44 },
    p: { xs: 1.5, sm: 1 },
  } as SxProps<Theme>,
};

// Responsive typography
export const responsiveTypography = {
  // Page title
  pageTitle: {
    variant: 'h4' as const,
    component: 'h1' as const,
    sx: {
      fontSize: { xs: '1.5rem', sm: '2rem', md: '2.5rem' },
      fontWeight: 600,
      mb: { xs: 1, sm: 2 },
    },
  },

  // Section title
  sectionTitle: {
    variant: 'h5' as const,
    component: 'h2' as const,
    sx: {
      fontSize: { xs: '1.25rem', sm: '1.5rem' },
      fontWeight: 600,
      mb: { xs: 1.5, sm: 2 },
    },
  },

  // Card title
  cardTitle: {
    variant: 'h6' as const,
    component: 'h3' as const,
    sx: {
      fontSize: { xs: '1rem', sm: '1.25rem' },
      fontWeight: 600,
      mb: 1,
    },
  },

  // Body text with responsive size
  bodyText: {
    variant: 'body1' as const,
    sx: {
      fontSize: { xs: '0.875rem', sm: '1rem' },
      lineHeight: 1.5,
    },
  },
};

// Common responsive layouts
export const commonLayouts = {
  // Flex container with responsive gap
  flexContainer: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: { xs: 2, sm: 3, md: 4 },
  } as SxProps<Theme>,

  // Flex item with responsive basis
  flexItem: {
    flex: '1 1 300px',
    minWidth: 0, // Prevent overflow
  } as SxProps<Theme>,

  // Center content
  centerContent: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    textAlign: 'center',
    px: { xs: 2, sm: 0 },
  } as SxProps<Theme>,

  // Full height container
  fullHeight: {
    minHeight: {
      xs: 'calc(100vh - 120px)', // Account for mobile header
      sm: 'calc(100vh - 100px)',
    },
  } as SxProps<Theme>,

  // Image container with aspect ratio
  imageContainer: {
    width: '100%',
    aspectRatio: '16/9',
    overflow: 'hidden',
    borderRadius: 1,
    '& img': {
      width: '100%',
      height: '100%',
      objectFit: 'cover',
    },
  } as SxProps<Theme>,
};

// Responsive visibility helpers
export const visibility = {
  // Hide on mobile
  hideOnMobile: {
    display: { xs: 'none', sm: 'block' },
  } as SxProps<Theme>,

  // Show only on mobile
  mobileOnly: {
    display: { xs: 'block', sm: 'none' },
  } as SxProps<Theme>,

  // Hide on desktop
  hideOnDesktop: {
    display: { xs: 'block', md: 'none' },
  } as SxProps<Theme>,

  // Show only on desktop
  desktopOnly: {
    display: { xs: 'none', md: 'block' },
  } as SxProps<Theme>,
};

// Animation and transition helpers
export const animations = {
  // Smooth hover transition
  hoverTransition: {
    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
    '&:hover': {
      transform: { xs: 'none', md: 'translateY(-4px)' },
    },
  } as SxProps<Theme>,

  // Scale animation
  scaleHover: {
    transition: 'transform 0.2s ease-in-out',
    '&:hover': {
      transform: { xs: 'none', md: 'scale(1.02)' },
    },
  } as SxProps<Theme>,

  // Fade in animation
  fadeIn: {
    animation: 'fadeIn 0.5s ease-in-out',
    '@keyframes fadeIn': {
      from: { opacity: 0, transform: 'translateY(20px)' },
      to: { opacity: 1, transform: 'translateY(0)' },
    },
  } as SxProps<Theme>,
};

// Performance optimizations for mobile
export const performance = {
  // Optimized shadows for mobile
  mobileShadow: {
    boxShadow: {
      xs: '0 1px 3px rgba(0,0,0,0.12)',
      sm: '0 2px 8px rgba(0,0,0,0.12)',
    },
  } as SxProps<Theme>,

  // GPU acceleration for animations
  gpuAcceleration: {
    transform: 'translateZ(0)',
    willChange: 'transform',
  } as SxProps<Theme>,

  // Optimized background for performance
  optimizedBackground: {
    backgroundAttachment: { xs: 'scroll', md: 'fixed' },
  } as SxProps<Theme>,
};

// Utility function to combine responsive styles
export const combineResponsiveStyles = (...styles: SxProps<Theme>[]): SxProps<Theme> => {
  return styles.reduce((combined, style) => ({ ...combined, ...style }), {});
};