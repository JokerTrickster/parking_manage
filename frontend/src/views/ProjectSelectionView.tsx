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
} from '@mui/material';
import {
  LocationOn as LocationIcon,
  Business as BusinessIcon,
  NavigateNext as NextIcon,
  NavigateBefore as PrevIcon,
} from '@mui/icons-material';
import { Project } from '../models/Project';
import { ProjectSelectionViewModel, ProjectSelectionState } from '../viewmodels/ProjectSelectionViewModel';

interface ProjectSelectionViewProps {
  onProjectSelect: (project: Project) => void;
}

const ProjectSelectionView: React.FC<ProjectSelectionViewProps> = ({ onProjectSelect }) => {
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
    <Box>
      <Typography variant="h4" component="h1" gutterBottom align="center">
        프로젝트 선택
      </Typography>
      <Typography variant="body1" color="text.secondary" align="center" sx={{ mb: 4 }}>
        관리할 주차장 프로젝트를 선택해주세요
      </Typography>
      
      {/* 프로젝트 그리드 */}
      <Box sx={{ mb: 4 }}>
        <Box sx={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(2, 1fr)', 
          gap: 3,
          mb: 3
        }}>
          {viewModel.projects.map((project) => (
            <Card 
              key={project.id}
              sx={{ 
                height: '200px', 
                display: 'flex', 
                flexDirection: 'column',
                cursor: 'pointer',
                '&:hover': {
                  boxShadow: 6,
                  transform: 'translateY(-2px)',
                  transition: 'all 0.2s ease-in-out',
                },
              }}
              onClick={() => onProjectSelect(project)}
            >
              <CardContent sx={{ flexGrow: 1 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <Avatar sx={{ bgcolor: 'primary.main', mr: 2 }}>
                    <BusinessIcon />
                  </Avatar>
                  <Typography variant="h6" component="h2">
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
          ))}
        </Box>
      </Box>

      {/* 페이징 컨트롤 */}
      {viewModel.totalPages > 1 && (
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 2 }}>
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
    </Box>
  );
};

export default ProjectSelectionView; 