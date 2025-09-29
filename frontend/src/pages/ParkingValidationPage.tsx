import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Breadcrumbs,
  Link,
  Container,
  Alert,
  Snackbar,
} from '@mui/material';
import {
  CheckCircle as ValidationIcon,
  Home as HomeIcon,
} from '@mui/icons-material';
import { useNavigate, useSearchParams, useParams } from 'react-router-dom';
import { ParkingTestView } from '../views/ParkingTestView';
import { Project } from '../models/Project';

const ParkingValidationPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { projectId } = useParams<{ projectId: string }>();
  const [project, setProject] = useState<Project | null>(null);
  const [showAlert, setShowAlert] = useState(false);

  useEffect(() => {
    // Get project from URL params or localStorage
    const urlProjectId = searchParams.get('projectId') || projectId;
    const storedProject = localStorage.getItem('selectedProject');

    if (urlProjectId && storedProject) {
      try {
        const parsedProject = JSON.parse(storedProject);
        if (parsedProject.id === urlProjectId) {
          setProject(parsedProject);
        }
      } catch (error) {
        console.error('Error parsing stored project:', error);
      }
    } else if (storedProject) {
      try {
        const parsedProject = JSON.parse(storedProject);
        setProject(parsedProject);
      } catch (error) {
        console.error('Error parsing stored project:', error);
      }
    } else {
      // No project selected, show alert and redirect
      setShowAlert(true);
      setTimeout(() => {
        navigate('/', {
          state: { message: '주차면 검증을 사용하려면 먼저 프로젝트를 선택해주세요.' }
        });
      }, 3000);
    }
  }, [searchParams, navigate]);

  const handleBack = () => {
    navigate('/', {
      state: { returnPage: 'parking-validation' }
    });
  };

  if (!project) {
    return (
      <Container maxWidth="lg">
        <Box sx={{ mt: 4, textAlign: 'center' }}>
          <Alert severity="warning" sx={{ mb: 2 }}>
            주차면 검증을 사용하려면 먼저 프로젝트를 선택해주세요.
          </Alert>
          <Typography variant="body1" color="text.secondary">
            3초 후 프로젝트 선택 페이지로 이동합니다...
          </Typography>
        </Box>
        <Snackbar
          open={showAlert}
          onClose={() => setShowAlert(false)}
          message="프로젝트를 선택해주세요"
        />
      </Container>
    );
  }

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
          {project && (
            <Link
              color="inherit"
              onClick={() => navigate(`/project/${project.id}`)}
              sx={{
                display: 'flex',
                alignItems: 'center',
                cursor: 'pointer',
                fontSize: { xs: '0.875rem', sm: '1rem' }
              }}
            >
              프로젝트 {project.id}
            </Link>
          )}
          <Typography
            color="text.primary"
            sx={{
              display: 'flex',
              alignItems: 'center',
              fontSize: { xs: '0.875rem', sm: '1rem' }
            }}
          >
            <ValidationIcon sx={{ mr: 0.5, fontSize: { xs: 16, sm: 20 } }} />
            주차면 검증
          </Typography>
        </Breadcrumbs>
      </Box>

      {/* Page Header - Mobile Optimized */}
      <Box sx={{ mb: 3, textAlign: { xs: 'left', sm: 'center' } }}>
        <Box sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: { xs: 'flex-start', sm: 'center' },
          mb: 1
        }}>
          <ValidationIcon sx={{
            fontSize: { xs: 32, sm: 40, md: 48 },
            color: 'primary.main',
            mr: 1.5
          }} />
          <Typography
            variant="h4"
            component="h1"
            color="primary.main"
            sx={{
              fontSize: { xs: '1.5rem', sm: '2rem', md: '2.5rem' }
            }}
          >
            주차면 검증
          </Typography>
        </Box>
        <Typography
          variant="body1"
          color="text.secondary"
          sx={{
            fontSize: { xs: '0.875rem', sm: '1rem' },
            display: { xs: 'none', sm: 'block' }
          }}
        >
          학습 데이터와 테스트 이미지를 사용하여 주차면 감지 성능을 검증합니다
        </Typography>
      </Box>

      {/* Enhanced Parking Test View with Mobile Optimization */}
      <Box sx={{
        minHeight: 'calc(100vh - 200px)',
        '& .validation-controls': {
          flexDirection: { xs: 'column', md: 'row' },
          gap: { xs: 1, md: 2 }
        },
        '& .validation-results': {
          overflowX: 'auto'
        },
        '& .image-gallery': {
          display: 'grid',
          gridTemplateColumns: {
            xs: '1fr',
            sm: 'repeat(2, 1fr)',
            md: 'repeat(3, 1fr)',
            lg: 'repeat(4, 1fr)'
          },
          gap: 2
        },
        '& .validation-card': {
          minHeight: { xs: 200, sm: 250 },
          '& img': {
            width: '100%',
            height: 'auto',
            objectFit: 'cover'
          }
        },
        '& .mobile-fab': {
          position: 'fixed',
          bottom: 16,
          right: 16,
          display: { xs: 'flex', md: 'none' }
        }
      }}>
        <ParkingTestView
          project={project}
          onBack={handleBack}
        />
      </Box>
    </Container>
  );
};

export default ParkingValidationPage;