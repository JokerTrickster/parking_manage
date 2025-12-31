import React, { useState, useEffect, useMemo, useContext } from 'react';
import {
  Typography,
  Button,
  Box,
  Avatar,
  Alert,
  CircularProgress,
  IconButton,
  Pagination,
  Container,
  Paper,
  Chip,
  Stack,
  InputBase,
  useTheme,
  alpha
} from '@mui/material';
import {
  LocationOn as LocationIcon,
  Business as BusinessIcon,
  ArrowForward as ArrowForwardIcon,
  Search as SearchIcon,
  Add as AddIcon,
  GridView as GridViewIcon,
  List as ListViewIcon,
  FilterList as FilterIcon,
  LightMode as LightModeIcon,
  DarkMode as DarkModeIcon
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { Project } from '../models/Project';
import { ProjectSelectionViewModel, ProjectSelectionState } from '../viewmodels/ProjectSelectionViewModel';
import { ThemeContext } from '../App';
import { GRADIENTS, SHADOWS } from '../styles/theme';
import '../index.css';

interface ProjectSelectionViewProps {
  onProjectSelect?: (project: Project) => void;
}

const ProjectSelectionView: React.FC<ProjectSelectionViewProps> = ({ onProjectSelect }) => {
  const navigate = useNavigate();
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';
  const { mode, toggleTheme } = useContext(ThemeContext);
  const [state, setState] = useState<ProjectSelectionState>({
    projects: [],
    loading: true,
    error: null,
    currentPage: 0,
    itemsPerPage: 9,
  });

  // 뷰모델 초기화
  const viewModel = useMemo(() => new ProjectSelectionViewModel(state, setState), [state, setState]);

  useEffect(() => {
    viewModel.loadProjects();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleProjectSelect = (project: Project) => {
    localStorage.setItem('selectedProject', JSON.stringify(project));
    localStorage.setItem('selectedProjectId', project.id);
    navigate(`/project/${project.id}`);
    if (onProjectSelect) {
      onProjectSelect(project);
    }
  };

  return (
    <Box sx={{
      minHeight: '100vh',
      bgcolor: 'background.default',
      pb: 8
    }}>
      {/* Admin Header */}
      <Box sx={{
        bgcolor: 'background.paper',
        borderBottom: '1px solid',
        borderColor: 'divider',
        py: 2,
        px: 3,
        mb: 4
      }}>
        <Container maxWidth="xl">
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Box sx={{
                width: 40, height: 40,
                background: GRADIENTS.primary,
                borderRadius: 2,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                color: '#fff'
              }}>
                <BusinessIcon />
              </Box>
              <Typography variant="h6" sx={{ fontWeight: 700, color: 'text.primary', letterSpacing: '-0.01em' }}>
                주차 관제 시스템
              </Typography>
              <Chip
                label="관리자 모드"
                size="small"
                sx={{
                  bgcolor: alpha(theme.palette.primary.main, 0.1),
                  color: 'primary.main',
                  border: `1px solid ${alpha(theme.palette.primary.main, 0.3)}`
                }}
              />
            </Box>

            <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
              <IconButton
                onClick={toggleTheme}
                size="small"
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
                startIcon={<AddIcon />}
                size="small"
                sx={{
                  borderColor: theme.palette.divider,
                  color: 'text.secondary',
                  '&:hover': {
                    borderColor: 'primary.main',
                    bgcolor: alpha(theme.palette.primary.main, 0.05)
                  }
                }}
              >
                시스템 설정
              </Button>
              <Avatar sx={{
                width: 32,
                height: 32,
                bgcolor: alpha(theme.palette.action.hover, 0.5),
                color: 'text.secondary'
              }} />
            </Box>
          </Box>
        </Container>
      </Box>

      <Container maxWidth="xl">
        {/* Main Content Header */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'end', mb: 4 }}>
          <Box>
            <Typography variant="h4" sx={{ fontWeight: 800, color: 'text.primary', mb: 1, letterSpacing: '-0.02em' }}>
              현장 관리 (Sites)
            </Typography>
            <Typography variant="body1" color="text.secondary" sx={{ fontSize: '14px' }}>
              등록된 주차장 현장 목록입니다. 관리할 현장을 선택하세요.
            </Typography>
          </Box>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            sx={{
              px: 3,
              py: 1.25,
              borderRadius: 2,
              background: GRADIENTS.primary,
              boxShadow: `0 4px 12px ${alpha(theme.palette.primary.main, 0.3)}`,
              '&:hover': {
                background: `linear-gradient(135deg, ${theme.palette.primary.dark} 0%, ${theme.palette.primary.main} 100%)`,
                boxShadow: `0 6px 16px ${alpha(theme.palette.primary.main, 0.4)}`
              }
            }}
          >
            신규 현장 등록
          </Button>
        </Box>

        {/* Filters & Search Toolbar */}
        <Paper
          elevation={0}
          className="glass-medium animate-fade-in-down"
          sx={{
            p: 2.5,
            mb: 4,
            borderRadius: 2,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: 2,
            backdropFilter: 'blur(10px)',
            backgroundColor: theme.palette.glass.medium
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flex: 1, minWidth: '300px' }}>
            <Box sx={{
              display: 'flex',
              alignItems: 'center',
              bgcolor: 'rgba(255, 255, 255, 0.02)',
              borderRadius: 2,
              px: 2,
              py: 1.25,
              width: '100%',
              maxWidth: '400px',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              transition: 'all 0.2s',
              '&:focus-within': {
                borderColor: 'primary.main',
                bgcolor: 'rgba(59, 130, 246, 0.05)'
              }
            }}>
              <SearchIcon sx={{ color: 'text.tertiary', mr: 1, fontSize: 20 }} />
              <InputBase
                placeholder="현장명 또는 지역 검색..."
                fullWidth
                sx={{
                  color: 'text.primary',
                  fontSize: '14px',
                  '& ::placeholder': { color: 'text.tertiary' }
                }}
              />
            </Box>
            <Button
              startIcon={<FilterIcon />}
              sx={{
                color: 'text.secondary',
                borderColor: 'rgba(255, 255, 255, 0.1)',
                '&:hover': { borderColor: 'rgba(255, 255, 255, 0.2)' }
              }}
            >
              필터
            </Button>
          </Box>

          <Box sx={{ display: 'flex', gap: 1 }}>
            <IconButton
              sx={{
                color: 'primary.main',
                bgcolor: 'rgba(59, 130, 246, 0.1)',
                '&:hover': { bgcolor: 'rgba(59, 130, 246, 0.15)' }
              }}
            >
              <GridViewIcon />
            </IconButton>
            <IconButton
              sx={{
                color: 'text.tertiary',
                '&:hover': { color: 'text.secondary', bgcolor: 'rgba(255, 255, 255, 0.05)' }
              }}
            >
              <ListViewIcon />
            </IconButton>
          </Box>
        </Paper>

        {/* Project Grid (Using CSS Grid via Box instead of MUI Grid to avoid version conflicts) */}
        {viewModel.loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 10 }}>
            <CircularProgress />
          </Box>
        ) : viewModel.error ? (
          <Alert severity="error">{viewModel.error}</Alert>
        ) : (
          <Box sx={{
            display: 'grid',
            gridTemplateColumns: {
              xs: '1fr',
              sm: 'repeat(2, 1fr)',
              md: 'repeat(3, 1fr)',
              lg: 'repeat(3, 1fr)'
            },
            gap: 2.5
          }}>
            {viewModel.projects.map((project, index) => (
              <Paper
                key={project.id}
                elevation={0}
                onClick={() => handleProjectSelect(project)}
                className="hover-lift animate-fade-in-up"
                sx={{
                  p: 0,
                  overflow: 'hidden',
                  cursor: 'pointer',
                  display: 'flex',
                  flexDirection: 'column',
                  bgcolor: 'background.paper',
                  border: `1px solid ${isDark ? 'rgba(255, 255, 255, 0.06)' : 'rgba(0, 0, 0, 0.06)'}`,
                  boxShadow: isDark ? SHADOWS.dark.sm : SHADOWS.light.sm,
                  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                  animationDelay: `${index * 0.1}s`,
                  '&:hover': {
                    borderColor: theme.palette.primary.main,
                    boxShadow: isDark ? SHADOWS.dark.xl : SHADOWS.light.xl,
                  }
                }}
              >
                {/* Gradient Top Accent */}
                <Box className="gradient-primary" sx={{
                  height: 3,
                  opacity: isDark ? 1 : 0.8
                }} />

                <Box sx={{ p: 3, flexGrow: 1 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', mb: 2 }}>
                    <Chip
                      label="운영중"
                      size="small"
                      className="status-badge status-success animate-pulse-glow"
                      sx={{
                        height: 22,
                        fontSize: '11px',
                        fontWeight: 600
                      }}
                    />
                    <IconButton
                      size="small"
                      sx={{
                        color: 'text.tertiary',
                        mt: -0.5,
                        mr: -0.5,
                        '&:hover': { color: 'primary.main', bgcolor: 'rgba(59, 130, 246, 0.1)' }
                      }}
                    >
                      <ArrowForwardIcon fontSize="small" />
                    </IconButton>
                  </Box>

                  <Typography
                    variant="h6"
                    sx={{
                      fontWeight: 600,
                      fontSize: '18px',
                      mb: 1,
                      color: 'text.primary',
                      letterSpacing: '-0.01em',
                      lineHeight: 1.4
                    }}
                  >
                    {project.name}
                  </Typography>
                  <Typography
                    variant="body2"
                    sx={{
                      color: 'text.secondary',
                      mb: 3,
                      minHeight: '40px',
                      fontSize: '14px',
                      lineHeight: 1.6
                    }}
                  >
                    {project.description || '설명이 없습니다.'}
                  </Typography>

                  <Stack direction="row" spacing={2} alignItems="center">
                    <Box sx={{ display: 'flex', alignItems: 'center', color: 'text.tertiary' }}>
                      <LocationIcon sx={{ fontSize: 14, mr: 0.5 }} />
                      <Typography variant="caption" sx={{ fontSize: '12px' }}>
                        {project.location}
                      </Typography>
                    </Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', color: 'text.tertiary' }}>
                      <BusinessIcon sx={{ fontSize: 14, mr: 0.5 }} />
                      <Typography variant="caption" sx={{ fontSize: '12px' }}>
                        ID: {project.id}
                      </Typography>
                    </Box>
                  </Stack>
                </Box>

                <Box sx={{
                  px: 3,
                  py: 2,
                  bgcolor: 'rgba(255, 255, 255, 0.02)',
                  borderTop: '1px solid rgba(255, 255, 255, 0.06)',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center'
                }}>
                  <Typography variant="caption" sx={{ color: 'text.tertiary', fontSize: '12px' }}>
                    마지막 업데이트: 2024-05-10
                  </Typography>
                  <Typography
                    variant="caption"
                    sx={{
                      color: 'primary.main',
                      fontWeight: 600,
                      fontSize: '12px',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 0.5
                    }}
                  >
                    세부 정보 →
                  </Typography>
                </Box>
              </Paper>
            ))}
          </Box>
        )}

        {/* Pagination placeholder if needed */}
        {viewModel.totalPages > 1 && (
          <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
            <Pagination
              count={viewModel.totalPages}
              page={viewModel.currentPage + 1}
              onChange={(_, p) => viewModel.goToPage(p - 1)}
              color="primary"
            />
          </Box>
        )}

      </Container>
    </Box>
  );
};

export default ProjectSelectionView;