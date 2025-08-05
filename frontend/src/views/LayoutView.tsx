import React from 'react';
import {
  AppBar,
  Toolbar,
  Typography,
  Container,
  Box,
  CssBaseline,
  ThemeProvider,
  createTheme,
} from '@mui/material';
import { LocalParking as ParkingIcon } from '@mui/icons-material';

const theme = createTheme({
  palette: {
    primary: {
      main: '#1976d2',
    },
    secondary: {
      main: '#dc004e',
    },
  },
});

interface LayoutViewProps {
  children: React.ReactNode;
}

const LayoutView: React.FC<LayoutViewProps> = ({ children }) => {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
        <AppBar position="static">
          <Toolbar>
            <ParkingIcon sx={{ mr: 2 }} />
            <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
              주차 관리 시스템
            </Typography>
          </Toolbar>
        </AppBar>
        <Container component="main" sx={{ flexGrow: 1, py: 3 }}>
          {children}
        </Container>
      </Box>
    </ThemeProvider>
  );
};

export default LayoutView; 