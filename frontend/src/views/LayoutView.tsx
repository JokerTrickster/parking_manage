import React, { useState } from 'react';
import {
  AppBar,
  Toolbar,
  Typography,
  Container,
  Box,
  CssBaseline,
  ThemeProvider,
  IconButton,
  Drawer,
  List,
  ListItemIcon,
  ListItemText,
  Divider,
  ListItemButton,
  useMediaQuery,
  useTheme,
} from '@mui/material';
import {
  LocalParking as ParkingIcon,
  Menu as MenuIcon,
  Home as HomeIcon,
  Map as MapIcon,
  Settings as SettingsIcon,
  Crop as RoiIcon,
  CheckCircle as ValidationIcon,
  LiveTv as LiveIcon,
  Folder as FolderIcon,
  BugReport as TestingIcon,
} from '@mui/icons-material';
import { useNavigate, useLocation, useParams } from 'react-router-dom';
import theme from '../styles/theme';
import { touchFriendly, responsiveSpacing } from '../styles/responsive';
import DeviceTestingPanel from '../components/DeviceTestingPanel';

interface LayoutViewProps {
  children: React.ReactNode;
}

const LayoutView: React.FC<LayoutViewProps> = ({ children }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { projectId } = useParams<{ projectId: string }>();
  const muiTheme = useTheme();
  const isMobile = useMediaQuery(muiTheme.breakpoints.down('md'));

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [testingPanelOpen, setTestingPanelOpen] = useState(false);

  const menuItems = [
    { id: 'home', title: '프로젝트 선택', path: '/', icon: <HomeIcon /> },
    { id: 'map-editor', title: '맵 에디터', path: `/project/${projectId}/map-editor`, icon: <MapIcon /> },
    { id: 'map-properties', title: '맵 속성 편집기', path: `/project/${projectId}/map-properties`, icon: <SettingsIcon /> },
    { id: 'roi-editor', title: 'ROI 편집기', path: `/project/${projectId}/roi-editor`, icon: <RoiIcon /> },
    { id: 'parking-validation', title: '주차면 검증', path: `/project/${projectId}/parking-validation`, icon: <ValidationIcon /> },
    { id: 'live-status', title: '실시간 현황', path: `/project/${projectId}/live-status`, icon: <LiveIcon /> },
    { id: 'file-repository', title: '파일 보관함', path: `/project/${projectId}/file-repository`, icon: <FolderIcon /> },
  ];

  const handleMenuClick = (path: string) => {
    navigate(path);
    setMobileMenuOpen(false);
  };

  const currentPageTitle = menuItems.find(item => item.path === location.pathname)?.title || '주차 관리 시스템';
  const projectTitle = projectId ? `프로젝트 ${projectId}` : '주차 관리 시스템';

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
        <AppBar position="static">
          <Toolbar>
            {isMobile && (
              <IconButton
                edge="start"
                color="inherit"
                aria-label="menu"
                onClick={() => setMobileMenuOpen(true)}
                sx={{ ...touchFriendly.iconButton, mr: 1 }}
              >
                <MenuIcon />
              </IconButton>
            )}

            <IconButton
              color="inherit"
              onClick={() => navigate('/')}
              sx={{ ...touchFriendly.iconButton, mr: 1 }}
            >
              <ParkingIcon />
            </IconButton>

            <Typography
              variant="h6"
              component="div"
              sx={{
                flexGrow: 1,
                fontSize: { xs: '1rem', sm: '1.25rem' }
              }}
            >
              {isMobile ? currentPageTitle : projectTitle}
            </Typography>

            {!isMobile && (
              <Box sx={{ display: 'flex', gap: 1 }}>
                {menuItems.slice(1).map((item) => (
                  <IconButton
                    key={item.id}
                    color="inherit"
                    onClick={() => handleMenuClick(item.path)}
                    title={item.title}
                    sx={{
                      ...touchFriendly.iconButton,
                      backgroundColor: location.pathname === item.path ? 'rgba(255,255,255,0.1)' : 'transparent',
                      '&:hover': {
                        backgroundColor: 'rgba(255,255,255,0.2)',
                      }
                    }}
                  >
                    {item.icon}
                  </IconButton>
                ))}

                {/* Testing Panel Button */}
                <IconButton
                  color="inherit"
                  onClick={() => setTestingPanelOpen(true)}
                  title="크로스 디바이스 테스팅"
                  sx={{
                    ...touchFriendly.iconButton,
                    ml: 1,
                    backgroundColor: testingPanelOpen ? 'rgba(255,255,255,0.1)' : 'transparent',
                    '&:hover': {
                      backgroundColor: 'rgba(255,255,255,0.2)',
                    }
                  }}
                >
                  <TestingIcon />
                </IconButton>
              </Box>
            )}
          </Toolbar>
        </AppBar>

        {/* Mobile Navigation Drawer */}
        <Drawer
          anchor="left"
          open={mobileMenuOpen}
          onClose={() => setMobileMenuOpen(false)}
          sx={{
            display: { xs: 'block', md: 'none' },
            '& .MuiDrawer-paper': {
              width: 280,
            },
          }}
        >
          <Box sx={{ p: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <ParkingIcon sx={{ mr: 1, color: 'primary.main' }} />
              <Typography variant="h6" color="primary.main">
                {projectTitle}
              </Typography>
            </Box>
            <Divider />
          </Box>

          <List>
            {menuItems.map((item) => (
              <ListItemButton
                key={item.id}
                selected={location.pathname === item.path}
                onClick={() => handleMenuClick(item.path)}
                sx={{
                  '&.Mui-selected': {
                    backgroundColor: 'primary.light',
                    color: 'primary.contrastText',
                    '&:hover': {
                      backgroundColor: 'primary.main',
                    }
                  }
                }}
              >
                <ListItemIcon sx={{ color: location.pathname === item.path ? 'inherit' : 'action.active' }}>
                  {item.icon}
                </ListItemIcon>
                <ListItemText
                  primary={item.title}
                  primaryTypographyProps={{
                    fontSize: '0.9rem',
                    fontWeight: location.pathname === item.path ? 600 : 400
                  }}
                />
              </ListItemButton>
            ))}

            {/* Testing Panel Menu Item */}
            <Divider sx={{ my: 1 }} />
            <ListItemButton
              onClick={() => {
                setTestingPanelOpen(true);
                setMobileMenuOpen(false);
              }}
              sx={{
                '&:hover': {
                  backgroundColor: 'rgba(25, 118, 210, 0.1)',
                }
              }}
            >
              <ListItemIcon>
                <TestingIcon />
              </ListItemIcon>
              <ListItemText
                primary="크로스 디바이스 테스팅"
                primaryTypographyProps={{
                  fontSize: '0.9rem',
                  fontWeight: 400
                }}
              />
            </ListItemButton>
          </List>
        </Drawer>

        <Container
          component="main"
          maxWidth={false}
          sx={{
            flexGrow: 1,
            ...responsiveSpacing.pagePadding
          }}
        >
          {children}
        </Container>

        {/* Device Testing Panel */}
        <DeviceTestingPanel
          open={testingPanelOpen}
          onClose={() => setTestingPanelOpen(false)}
        />
      </Box>
    </ThemeProvider>
  );
};

export default LayoutView; 