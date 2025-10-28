/**
 * Project File Repository Page (Wrapper)
 *
 * Wraps ProjectFileRepositoryView with route parameter handling
 * Integrates with existing routing structure
 */

import React, { useEffect, useState } from 'react';
import { useParams, useSearchParams, useNavigate } from 'react-router-dom';
import { Container, Box, Alert, Typography, CircularProgress } from '@mui/material';
import { ProjectFileRepositoryView } from '../views/ProjectFileRepositoryView';

/**
 * ProjectFileRepositoryPage Component
 *
 * Handles:
 * - Project ID extraction from URL params
 * - Project name retrieval (from localStorage or API)
 * - Loading states
 * - Error handling (no project selected)
 */
const ProjectFileRepositoryPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { projectId: routeProjectId } = useParams<{ projectId: string }>();

  const [projectId, setProjectId] = useState<string>('');
  const [projectName, setProjectName] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Get project ID from URL params or localStorage
    const urlProjectId = searchParams.get('projectId') || routeProjectId;
    const storedProjectId = localStorage.getItem('selectedProjectId');

    if (urlProjectId) {
      setProjectId(urlProjectId);
      localStorage.setItem('selectedProjectId', urlProjectId);

      // Get project name (from localStorage or use ID as name)
      const storedProjectName = localStorage.getItem('selectedProjectName');
      setProjectName(storedProjectName || urlProjectId);

      setIsLoading(false);
    } else if (storedProjectId) {
      setProjectId(storedProjectId);

      // Get project name
      const storedProjectName = localStorage.getItem('selectedProjectName');
      setProjectName(storedProjectName || storedProjectId);

      setIsLoading(false);
    } else {
      // No project selected
      setError('프로젝트를 선택해주세요.');

      // Redirect to project selection after 3 seconds
      setTimeout(() => {
        navigate('/', {
          state: { message: '프로젝트 파일 보관함을 사용하려면 먼저 프로젝트를 선택해주세요.' }
        });
      }, 3000);
    }
  }, [searchParams, routeProjectId, navigate]);

  // Loading state
  if (isLoading) {
    return (
      <Container maxWidth="lg">
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
          <CircularProgress />
          <Typography sx={{ ml: 2 }}>로딩 중...</Typography>
        </Box>
      </Container>
    );
  }

  // Error state
  if (error || !projectId) {
    return (
      <Container maxWidth="lg">
        <Box sx={{ mt: 4, textAlign: 'center' }}>
          <Alert severity="warning" sx={{ mb: 2 }}>
            {error || '프로젝트 파일 보관함을 사용하려면 먼저 프로젝트를 선택해주세요.'}
          </Alert>
          <Typography variant="body1" color="text.secondary">
            3초 후 프로젝트 선택 페이지로 이동합니다...
          </Typography>
        </Box>
      </Container>
    );
  }

  // Render actual file repository view
  return (
    <ProjectFileRepositoryView
      projectId={projectId}
      projectName={projectName}
    />
  );
};

export default ProjectFileRepositoryPage;
