import React, { useState, useEffect, useMemo } from 'react';
import {
  Card,
  CardContent,
  CardActions,
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
} from '@mui/material';
import {
  LocationOn as LocationIcon,
  Business as BusinessIcon,
  NavigateNext as NextIcon,
  NavigateBefore as PrevIcon,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { Project } from '../models/Project';
import { ProjectSelectionViewModel, ProjectSelectionState } from '../viewmodels/ProjectSelectionViewModel';

interface ProjectSelectionViewProps {
  onProjectSelect?: (project: Project) => void;
}

const ProjectSelectionView: React.FC<ProjectSelectionViewProps> = ({ onProjectSelect }) => {
  const navigate = useNavigate();
  const [state, setState] = useState<ProjectSelectionState>({
    projects: [],
    loading: true,
    error: null,
    currentPage: 0,
    itemsPerPage: 4,
  });

  const viewModel = useMemo(() => new ProjectSelectionViewModel(state, setState), [state, setState]);


  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    viewModel.loadProjects();
  }, []); // 빈 의존성 배열로 컴포넌트 마운트 시에만 실행

  const handleProjectSelect = (project: Project) => {
    // Store selected project for other pages
    localStorage.setItem('selectedProject', JSON.stringify(project));
    localStorage.setItem('selectedProjectId', project.id);

    // Navigate to project dashboard
    navigate(`/project/${project.id}`);

    // Call legacy callback if provided
    if (onProjectSelect) {
      onProjectSelect(project);
    }
  };


  if (viewModel.loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '400px' }}>
        <CircularProgress />
        <Typography variant="h6" sx={{ ml: 2 }}>
          프로젝트 목록을 불러오는 중...
        </Typography>
      </Box>
    );
  }

  if (viewModel.error) {
    return (
      <Box sx={{ textAlign: 'center', py: 4 }}>
        <Alert severity="error" sx={{ mb: 2 }}>
          {viewModel.error}
        </Alert>
        <Button variant="contained" onClick={() => viewModel.loadProjects()}>
          다시 시도
        </Button>
      </Box>
    );
  }

  return (
    <Container maxWidth="xl">
      <Typography variant="h4" component="h1" gutterBottom align="center">
        주차 관리 시스템
      </Typography>
      <Typography variant="body1" color="text.secondary" align="center" sx={{ mb: 4 }}>
        프로젝트를 선택하고 관리 기능을 이용하세요
      </Typography>

      {/* 프로젝트 선택 섹션 */}
      <Paper elevation={2} sx={{ p: 3, mb: 4 }}>
        <Typography variant="h5" component="h2" gutterBottom>
          📁 프로젝트 선택
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
          관리할 주차장 프로젝트를 선택해주세요
        </Typography>

        <Box sx={{
          display: 'grid',
          gridTemplateColumns: {
            xs: '1fr',          // 모바일: 1열
            sm: 'repeat(2, 1fr)', // 태블릿 이상: 2열
          },
          gap: 3,
          mb: 3,
          maxWidth: '800px',
          mx: 'auto'
        }}>
          {viewModel.projects.map((project) => (
            <Box key={project.id}>
              <Card
                sx={{
                  height: '220px',
                  display: 'flex',
                  flexDirection: 'column',
                  cursor: 'pointer',
                  '&:hover': {
                    boxShadow: 6,
                    transform: 'translateY(-2px)',
                    transition: 'all 0.2s ease-in-out',
                  },
                }}
                onClick={() => handleProjectSelect(project)}
              >
                <CardContent sx={{ flexGrow: 1 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <Avatar sx={{ bgcolor: 'primary.main', mr: 2 }}>
                      <BusinessIcon />
                    </Avatar>
                    <Typography variant="h6" component="h3">
                      {project.name}
                    </Typography>
                  </Box>

                  <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                    {project.description}
                  </Typography>

                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <LocationIcon sx={{ fontSize: 16, mr: 0.5, color: 'text.secondary' }} />
                    <Typography variant="caption" color="text.secondary">
                      {project.location}
                    </Typography>
                  </Box>
                </CardContent>

                <CardActions>
                  <Button size="small" color="primary" fullWidth>
                    선택
                  </Button>
                </CardActions>
              </Card>
            </Box>
          ))}
        </Box>

        {/* 페이징 컨트롤 */}
        {viewModel.totalPages > 1 && (
          <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 2, mt: 3 }}>
            <IconButton
              onClick={() => viewModel.prevPage()}
              disabled={viewModel.currentPage === 0}
              sx={{ color: 'primary.main' }}
            >
              <PrevIcon />
            </IconButton>

            <Pagination
              count={viewModel.totalPages}
              page={viewModel.currentPage + 1}
              onChange={(_, page) => viewModel.goToPage(page - 1)}
              size="small"
              color="primary"
            />

            <IconButton
              onClick={() => viewModel.nextPage()}
              disabled={viewModel.currentPage === viewModel.totalPages - 1}
              sx={{ color: 'primary.main' }}
            >
              <NextIcon />
            </IconButton>
          </Box>
        )}
      </Paper>

    </Container>
  );
};

export default ProjectSelectionView; 