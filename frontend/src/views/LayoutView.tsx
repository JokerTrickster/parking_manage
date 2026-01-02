import React, { useState, useContext } from 'react';
import {
  AppBar,
  Toolbar,
  Typography,
  Container,
  Box,
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
  Storage as StorageIcon,
  LightMode as LightModeIcon,
  DarkMode as DarkModeIcon,
} from '@mui/icons-material';
import { useNavigate, useLocation, useParams } from 'react-router-dom';
import { ThemeContext } from '../App';
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
  const { mode, toggleTheme } = useContext(ThemeContext);

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [testingPanelOpen, setTestingPanelOpen] = useState(false);

  const menuItems = [
    { id: 'home', title: '프로젝트 선택', path: '/', icon: <HomeIcon /> },
    { id: 'map-editor', title: '맵 에디터', path: `/project/${projectId}/map-editor`, icon: <MapIcon /> },
    { id: 'map-properties', title: '맵 속성 편집기', path: `/project/${projectId}/map-properties`, icon: <SettingsIcon /> },
    { id: 'roi-editor', title: 'ROI 편집기', path: `/project/${projectId}/roi-editor`, icon: <RoiIcon /> },
    { id: 'learning-data-management', title: '학습 데이터 관리', path: `/project/${projectId}/learning-data-management`, icon: <StorageIcon /> },
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
      <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
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

            {/* Theme Toggle Menu Item */}
            <ListItemButton
              onClick={() => {
                toggleTheme();
                setMobileMenuOpen(false);
              }}
              sx={{
                '&:hover': {
                  backgroundColor: 'rgba(25, 118, 210, 0.1)',
                }
              }}
            >
              <ListItemIcon>
                {mode === 'dark' ? <LightModeIcon /> : <DarkModeIcon />}
              </ListItemIcon>
              <ListItemText
                primary={mode === 'dark' ? '라이트 모드' : '다크 모드'}
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
  );
};

export default LayoutView; 