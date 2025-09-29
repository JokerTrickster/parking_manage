import React from 'react';
import {
  Box,
  Typography,
  Breadcrumbs,
  Link,
  Container,
  Alert,
  IconButton,
} from '@mui/material';
import {
  Map as MapIcon,
  Home as HomeIcon,
  ArrowBack as ArrowBackIcon,
  Fullscreen as FullscreenIcon,
} from '@mui/icons-material';
import { useNavigate, useParams } from 'react-router-dom';

const MapEditorActualPage: React.FC = () => {
  const navigate = useNavigate();
  const { projectId } = useParams<{ projectId: string }>();

  const handleBack = () => {
    navigate(`/project/${projectId}/map-editor`);
  };

  return (
    <Container maxWidth="xl" sx={{ px: { xs: 1, sm: 2, md: 3 } }}>
      {/* Mobile-optimized Breadcrumb Navigation */}
      <Box sx={{ mb: 2 }}>
        <Breadcrumbs
          aria-label="breadcrumb"
          sx={{
            '& .MuiBreadcrumbs-separator': {
              mx: { xs: 0.5, sm: 1 }
            }
          }}
        >
          <Link
            color="inherit"
            onClick={() => navigate('/')}
            sx={{
              display: 'flex',
              alignItems: 'center',
              cursor: 'pointer',
              fontSize: { xs: '0.875rem', sm: '1rem' }
            }}
          >
            <HomeIcon sx={{ mr: 0.5, fontSize: { xs: 16, sm: 20 } }} />
            <Box sx={{ display: { xs: 'none', sm: 'block' } }}>프로젝트 선택</Box>
            <Box sx={{ display: { xs: 'block', sm: 'none' } }}>홈</Box>
          </Link>
          <Link
            color="inherit"
            onClick={() => navigate(`/project/${projectId}`)}
            sx={{
              display: 'flex',
              alignItems: 'center',
              cursor: 'pointer',
              fontSize: { xs: '0.875rem', sm: '1rem' }
            }}
          >
            프로젝트 {projectId}
          </Link>
          <Link
            color="inherit"
            onClick={() => navigate(`/project/${projectId}/map-editor`)}
            sx={{
              display: 'flex',
              alignItems: 'center',
              cursor: 'pointer',
              fontSize: { xs: '0.875rem', sm: '1rem' }
            }}
          >
            맵 에디터
          </Link>
          <Typography
            color="text.primary"
            sx={{
              display: 'flex',
              alignItems: 'center',
              fontSize: { xs: '0.875rem', sm: '1rem' }
            }}
          >
            <MapIcon sx={{ mr: 0.5, fontSize: { xs: 16, sm: 20 } }} />
            맵 에디터 (실행 중)
          </Typography>
        </Breadcrumbs>
      </Box>

      {/* Header with Back Button */}
      <Box sx={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        mb: 2,
        p: 2,
        bgcolor: 'primary.main',
        color: 'white',
        borderRadius: 1
      }}>
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <IconButton
            color="inherit"
            onClick={handleBack}
            sx={{ mr: 2 }}
          >
            <ArrowBackIcon />
          </IconButton>
          <MapIcon sx={{ mr: 1, fontSize: { xs: 24, sm: 32 } }} />
          <Typography variant="h5" component="h1" sx={{ fontSize: { xs: '1.25rem', sm: '1.5rem' } }}>
            맵 에디터 - 프로젝트 {projectId}
          </Typography>
        </Box>
        <IconButton
          color="inherit"
          onClick={() => {
            const iframe = document.querySelector('iframe');
            if (iframe && iframe.requestFullscreen) {
              iframe.requestFullscreen();
            }
          }}
          sx={{ display: { xs: 'none', md: 'flex' } }}
        >
          <FullscreenIcon />
        </IconButton>
      </Box>

      {/* Info Alert */}
      <Alert severity="info" sx={{ mb: 2 }}>
        <Typography variant="body2">
          🗺️ <strong>맵 에디터</strong>: localhost:3000에서 실행 중인 맵 에디터입니다.
          parkingLotId=1로 설정되어 있으며, 추후 postMessage로 동적 ID 전달이 가능합니다.
        </Typography>
      </Alert>

      {/* Full Page iframe */}
      <Box sx={{
        width: '100%',
        height: 'calc(100vh - 200px)',
        minHeight: '600px',
        border: '1px solid #ddd',
        borderRadius: 1,
        overflow: 'hidden'
      }}>
        <iframe
          src="http://localhost:3000/editor?parkingLotId=1"
          style={{
            width: '100%',
            height: '100%',
            border: 'none',
          }}
          title="맵 에디터"
          sandbox="allow-same-origin allow-scripts allow-forms allow-popups"
        />
      </Box>

      {/* Mobile Help */}
      <Box sx={{
        mt: 2,
        p: 1,
        bgcolor: 'grey.50',
        borderRadius: 1,
        display: { xs: 'block', md: 'none' }
      }}>
        <Typography variant="caption" color="text.secondary">
          💡 모바일에서는 가로 모드를 권장합니다. 더 넓은 화면에서 편집하세요.
        </Typography>
      </Box>
    </Container>
  );
};

export default MapEditorActualPage;