import React, { useContext } from 'react';
import {
  Box,
  Typography,
  Container,
  Button,
  Avatar,
  Breadcrumbs,
  Link,
  useTheme,
  alpha,
  Paper,
  Divider,
  Chip,
  IconButton,
} from '@mui/material';
import { GRADIENTS, SHADOWS } from '../styles/theme';
import '../index.css';
import {
  Map as MapIcon,
  Crop as RoiIcon,
  LiveTv as LiveIcon,
  Tune as TuneIcon,
  Folder as FolderIcon,
  Home as HomeIcon,
  Business as BusinessIcon,
  Rocket as RocketIcon,
  Storage as StorageIcon,
  NavigateNext as NavigateNextIcon,
  ArrowForward as ArrowForwardIcon,
  Settings as SettingsIcon,
  BarChart as BarChartIcon,
  LightMode as LightModeIcon,
  DarkMode as DarkModeIcon,
} from '@mui/icons-material';
import { useNavigate, useParams } from 'react-router-dom';
import { ThemeContext } from '../App';

const ProjectDashboardPage: React.FC = () => {
  const navigate = useNavigate();
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';
  const { projectId } = useParams<{ projectId: string }>();
  const { mode, toggleTheme } = useContext(ThemeContext);

  // Local storage retrieval
  const selectedProject = localStorage.getItem('selectedProject');
  const projectData = selectedProject ? JSON.parse(selectedProject) : null;

  const tools = [
    {
      id: 'map-editor',
      title: '맵 에디터 (Map Editor)',
      description: '주차장 도면을 업로드하고 주차면과 오브젝트를 설정합니다.',
      icon: <MapIcon />,
      color: '#1a73e8', // Classic Blue
      path: `/project/${projectId}/map-editor`,
      status: '설정 완료'
    },
    {
      id: 'roi-editor',
      title: 'ROI 설정 (검지 영역)',
      description: 'CCTV 화면에서 차량을 감지할 영역(ROI)을 지정합니다.',
      icon: <RoiIcon />,
      color: '#e3742f', // Orange
      path: `/project/${projectId}/roi-editor`,
      status: '작업 필요'
    },
    {
      id: 'learning-data',
      title: '학습 데이터 관리',
      description: '차량 인식률 향상을 위한 이미지를 관리하고 라벨링합니다.',
      icon: <StorageIcon />,
      color: '#188038', // Green
      path: `/project/${projectId}/learning-data-management`,
      status: '데이터 120건'
    },
    {
      id: 'algorithm',
      title: '알고리즘 튜닝',
      description: '주차 판단 임계값 및 감지 파라미터를 미세 조정합니다.',
      icon: <TuneIcon />,
      color: '#9334e6', // Purple
      path: `/project/${projectId}/parking-validation`,
      status: '최적화 됨'
    },
    {
      id: 'file-repo',
      title: '파일 보관함',
      description: '도면, 설정 파일, 리포트 등 프로젝트 관련 파일을 관리합니다.',
      icon: <FolderIcon />,
      color: '#5f6368', // Grey
      path: `/project/${projectId}/file-repository`,
      status: '5개 파일'
    },
    {
      id: 'live-monitor',
      title: '실시간 관제',
      description: '설정이 완료된 주차장의 실시간 점유 상태를 모니터링합니다.',
      icon: <LiveIcon />,
      color: '#d93025', // Red
      path: `/project/${projectId}/live-status`,
      status: '운영 중'
    }
  ];

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: 'background.default', pb: 12 }}>

      {/* Top Navigation Bar */}
      <Paper elevation={0} sx={{
        borderBottom: '1px solid',
        borderColor: 'divider',
        px: 4, py: 1.5,
        bgcolor: 'background.paper',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between'
      }}>
        <Breadcrumbs separator={<NavigateNextIcon fontSize="small" />} aria-label="breadcrumb">
          <Link
            underline="hover"
            color="inherit"
            onClick={() => navigate('/')}
            sx={{ display: 'flex', alignItems: 'center', cursor: 'pointer', fontWeight: 500 }}
          >
            <HomeIcon sx={{ mr: 0.5 }} fontSize="inherit" />
            현장 목록
          </Link>
          <Typography color="text.primary" sx={{ display: 'flex', alignItems: 'center', fontWeight: 700 }}>
            <BusinessIcon sx={{ mr: 0.5 }} fontSize="inherit" />
            {projectData?.name || `프로젝트 ${projectId}`}
          </Typography>
        </Breadcrumbs>

        <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
          {/* Theme Toggle Button */}
          <IconButton
            onClick={toggleTheme}
            size="small"
            title={mode === 'dark' ? '라이트 모드로 전환' : '다크 모드로 전환'}
            sx={{
              color: 'text.secondary',
              '&:hover': {
                color: 'primary.main',
                bgcolor: alpha(theme.palette.primary.main, 0.1)
              }
            }}
          >
            {mode === 'dark' ? <LightModeIcon fontSize="small" /> : <DarkModeIcon fontSize="small" />}
          </IconButton>

          <Button
            variant="outlined"
            size="small"
            startIcon={<SettingsIcon />}
            sx={{ borderRadius: 2 }}
          >
            현장 설정
          </Button>
        </Box>
      </Paper>

      <Container maxWidth="xl" sx={{ mt: 3, mb: 6 }}>

        {/* Site Overview Dashboard */}
        <Box sx={{
          display: 'grid',
          gridTemplateColumns: { xs: '1fr', md: '3fr 1fr' },
          gap: 2.5,
          mb: 3
        }}>
          {/* Left: Info & Status */}
          <Paper elevation={0} className="glass-medium animate-fade-in" sx={{
            p: 3,
            borderRadius: 2.5,
            border: `1px solid ${isDark ? 'rgba(255, 255, 255, 0.06)' : 'rgba(0, 0, 0, 0.06)'}`,
            bgcolor: 'background.paper',
            boxShadow: isDark ? SHADOWS.dark.sm : SHADOWS.light.sm
          }}>
            <Box sx={{ display: 'flex', alignItems: 'start', mb: 2 }}>
              <Avatar variant="rounded" sx={{
                width: 56, height: 56, mr: 2.5,
                bgcolor: alpha(theme.palette.primary.main, 0.1),
                color: 'primary.main'
              }}>
                <BusinessIcon fontSize="medium" />
              </Avatar>
              <Box>
                <Typography variant="h5" sx={{ fontWeight: 800, mb: 0.5, color: 'text.primary' }}>
                  {projectData?.name || `프로젝트 ${projectId}`}
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 1.5 }}>
                  {projectData?.description || '설명이 없습니다.'}
                </Typography>
                <Box sx={{ display: 'flex', gap: 1.5 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', bgcolor: alpha(theme.palette.action.hover, 0.1), px: 1.5, py: 0.5, borderRadius: 1 }}>
                    <Typography variant="caption" sx={{ fontWeight: 600, color: 'text.secondary', fontSize: '0.7rem' }}>위치: {projectData?.location || '서울'}</Typography>
                  </Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', bgcolor: alpha(theme.palette.success.main, 0.1), px: 1.5, py: 0.5, borderRadius: 1 }}>
                    <Typography variant="caption" sx={{ fontWeight: 600, color: 'success.main', fontSize: '0.7rem' }}>상태: 정상 운영 중</Typography>
                  </Box>
                </Box>
              </Box>
            </Box>

            <Divider sx={{ my: 2 }} />

            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(3, 1fr)' }, gap: 2.5 }}>
              <Box>
                <Typography variant="caption" color="text.secondary" display="block" mb={0.5} sx={{ fontSize: '0.7rem' }}>서버 호스트</Typography>
                <Typography variant="body2" fontWeight="700">13.203.37.93</Typography>
              </Box>
              <Box>
                <Typography variant="caption" color="text.secondary" display="block" mb={0.5} sx={{ fontSize: '0.7rem' }}>카메라 연결</Typography>
                <Typography variant="body2" fontWeight="700">12대 / 12대</Typography>
              </Box>
              <Box>
                <Typography variant="caption" color="text.secondary" display="block" mb={0.5} sx={{ fontSize: '0.7rem' }}>최근 배포</Typography>
                <Typography variant="body2" fontWeight="700">2024-05-12 14:30</Typography>
              </Box>
            </Box>
          </Paper>

          {/* Right: Quick Actions */}
          <Paper elevation={0} sx={{ p: 2.5, borderRadius: 2.5, border: '1px solid', borderColor: 'divider', bgcolor: 'background.paper', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
            <Typography variant="subtitle2" fontWeight="800" mb={1.5}>바로가기</Typography>
            <Button
              variant="contained"
              fullWidth
              startIcon={<BarChartIcon />}
              sx={{ mb: 1, py: 1.25, borderRadius: 2, fontSize: '0.875rem' }}
              onClick={() => window.open('https://banpo-grafana.luxrobo.org/d/m0arCBf72/aaaea1b?orgId=1', '_blank')}
            >
              Grafana 모니터링
            </Button>
            <Button
              variant="outlined"
              fullWidth
              startIcon={<RocketIcon />}
              sx={{ py: 1.25, borderRadius: 2, fontSize: '0.875rem' }}
              onClick={() => navigate(`/project/${projectId}/deployments`)}
            >
              배포 관리
            </Button>
          </Paper>
        </Box>

        {/* Toolbox Grid */}
        <Typography variant="h6" sx={{ fontWeight: 800, mb: 2, color: 'text.primary' }}>
          작업 도구 (Toolkit)
        </Typography>

        <Box sx={{
          display: 'grid',
          gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', md: 'repeat(3, 1fr)' },
          gap: 2
        }}>
          {tools.map((tool, index) => (
            <Paper
              key={tool.id}
              elevation={0}
              onClick={() => navigate(tool.path)}
              className="hover-lift animate-fade-in-up"
              sx={{
                p: 2.5,
                borderRadius: 2.5,
                border: `1px solid ${isDark ? 'rgba(255, 255, 255, 0.06)' : 'rgba(0, 0, 0, 0.06)'}`,
                cursor: 'pointer',
                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                position: 'relative',
                overflow: 'hidden',
                bgcolor: 'background.paper',
                boxShadow: isDark ? SHADOWS.dark.sm : SHADOWS.light.sm,
                animationDelay: `${index * 0.1}s`,
                '&:hover': {
                  borderColor: tool.color,
                  boxShadow: `0 8px 30px ${alpha(tool.color, isDark ? 0.3 : 0.2)}`,
                  '& .tool-icon': {
                    transform: 'scale(1.1) rotate(5deg)',
                  }
                }
              }}
            >
              {/* Tool Icon & Header */}
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1.5 }}>
                <Avatar className="tool-icon" sx={{
                  bgcolor: alpha(tool.color, 0.1),
                  color: tool.color,
                  width: 48, height: 48,
                  borderRadius: 1.5,
                  transition: 'transform 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
                }}>
                  {React.cloneElement(tool.icon as React.ReactElement<any>, { fontSize: 'small' })}
                </Avatar>
                <Chip
                  label={tool.status}
                  size="small"
                  sx={{
                    bgcolor: isDark ? alpha(theme.palette.background.default, 0.8) : 'grey.100',
                    color: isDark ? 'text.secondary' : 'text.secondary',
                    fontWeight: 500,
                    fontSize: '0.7rem',
                    height: 22,
                    border: isDark ? `1px solid ${alpha(theme.palette.divider, 0.5)}` : 'none'
                  }}
                />
              </Box>

              <Typography variant="subtitle1" fontWeight="bold" gutterBottom sx={{ fontSize: '0.95rem' }}>
                {tool.title}
              </Typography>

              <Typography variant="body2" color="text.secondary" sx={{ mb: 2, fontSize: '0.8rem', lineHeight: 1.5 }}>
                {tool.description}
              </Typography>

              <Box sx={{ display: 'flex', alignItems: 'center', color: tool.color, fontWeight: 600 }}>
                <Typography variant="button" sx={{ mr: 1, fontSize: '0.75rem' }}>도구 열기</Typography>
                <ArrowForwardIcon sx={{ fontSize: 16 }} />
              </Box>
            </Paper>
          ))}
        </Box>

      </Container>
    </Box>
  );
};

export default ProjectDashboardPage;