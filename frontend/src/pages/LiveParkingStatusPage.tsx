import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Breadcrumbs,
  Link,
  Container,
  Alert,
  Snackbar,
  Card,
  CardContent,
  Button,
  Paper,
} from '@mui/material';
import {
  LiveTv as LiveIcon,
  Home as HomeIcon,
} from '@mui/icons-material';
import { useNavigate, useSearchParams, useParams } from 'react-router-dom';
import RealtimeParkingView from '../views/RealtimeParkingView';
import { Project } from '../models/Project';

const LiveParkingStatusPage: React.FC = () => {
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
          state: { message: '실시간 주차 현황을 보려면 먼저 프로젝트를 선택해주세요.' }
        });
      }, 3000);
    }
  }, [searchParams, navigate]);

  const handleBack = () => {
    navigate('/', {
      state: { returnPage: 'live-status' }
    });
  };

  if (!project) {
    return (
      <Container maxWidth="lg">
        <Box sx={{ mt: 4, textAlign: 'center' }}>
          <Alert severity="warning" sx={{ mb: 2 }}>
            실시간 주차 현황을 보려면 먼저 프로젝트를 선택해주세요.
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
            <LiveIcon sx={{ mr: 0.5, fontSize: { xs: 16, sm: 20 } }} />
            실시간 주차 현황
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
          <LiveIcon sx={{
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
            실시간 주차 현황
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
          실시간으로 주차면 상태를 모니터링하고 관리합니다
        </Typography>
      </Box>

      {/* Enhanced Realtime Parking View with Mobile Optimization */}
      <Box sx={{
        minHeight: 'calc(100vh - 200px)',
        '& .status-grid': {
          display: 'grid',
          gridTemplateColumns: {
            xs: 'repeat(2, 1fr)',
            sm: 'repeat(3, 1fr)',
            md: 'repeat(4, 1fr)',
            lg: 'repeat(6, 1fr)'
          },
          gap: { xs: 1, sm: 2 }
        },
        '& .status-card': {
          minHeight: { xs: 80, sm: 120 },
          transition: 'all 0.3s ease',
          cursor: 'pointer',
          '&:hover': {
            transform: { xs: 'none', md: 'scale(1.05)' }
          }
        },
        '& .status-indicator': {
          width: { xs: 12, sm: 16 },
          height: { xs: 12, sm: 16 },
          borderRadius: '50%',
          display: 'inline-block',
          mr: 1
        },
        '& .mobile-refresh': {
          position: 'fixed',
          bottom: { xs: 16, sm: 24 },
          right: { xs: 16, sm: 24 },
          display: { xs: 'flex', md: 'none' }
        },
        '& .live-controls': {
          flexDirection: { xs: 'column', sm: 'row' },
          gap: { xs: 1, sm: 2 },
          mb: 2
        },
        '& .status-summary': {
          display: 'grid',
          gridTemplateColumns: {
            xs: 'repeat(2, 1fr)',
            sm: 'repeat(4, 1fr)'
          },
          gap: { xs: 1, sm: 2 },
          mb: 3
        }
      }}>
        {/* Tutorial Steps */}
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
          {/* Step 1 */}
          <Card elevation={2}>
            <CardContent sx={{ p: 4 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                <Box
                  sx={{
                    width: 48,
                    height: 48,
                    borderRadius: '50%',
                    bgcolor: 'error.main',
                    color: 'white',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '1.5rem',
                    fontWeight: 'bold',
                    mr: 2,
                  }}
                >
                  1
                </Box>
                <Typography variant="h5" component="h2">
                  실시간 데이터 수집 및 처리
                </Typography>
              </Box>

              <Box sx={{ pl: 8 }}>
                <Typography variant="h6" gutterBottom color="error.main">
                  📊 이 단계에서 배울 내용
                </Typography>
                <Box sx={{ pl: 2, mb: 3 }}>
                  <Typography variant="body1" paragraph>
                    • CCTV로부터 실시간 영상 데이터 수집
                  </Typography>
                  <Typography variant="body1" paragraph>
                    • ROI 영역 기반 주차면 상태 감지
                  </Typography>
                  <Typography variant="body1" paragraph>
                    • 차량 유무 판별 알고리즘 실행
                  </Typography>
                  <Typography variant="body1" paragraph>
                    • 실시간 데이터베이스 업데이트
                  </Typography>
                </Box>

                <Alert severity="info" sx={{ mb: 2 }}>
                  <Typography variant="body2">
                    📡 <strong>실시간 처리</strong>: 시스템이 1초마다 모든 CCTV 영상을 분석하여 주차 상태를 업데이트합니다.
                  </Typography>
                </Alert>
              </Box>
            </CardContent>
          </Card>

          {/* Step 2 */}
          <Card elevation={2}>
            <CardContent sx={{ p: 4 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                <Box
                  sx={{
                    width: 48,
                    height: 48,
                    borderRadius: '50%',
                    bgcolor: 'warning.main',
                    color: 'white',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '1.5rem',
                    fontWeight: 'bold',
                    mr: 2,
                  }}
                >
                  2
                </Box>
                <Typography variant="h5" component="h2">
                  주차면 상태 시각화
                </Typography>
              </Box>

              <Box sx={{ pl: 8 }}>
                <Typography variant="h6" gutterBottom color="warning.main">
                  🎨 이 단계에서 배울 내용
                </Typography>
                <Box sx={{ pl: 2, mb: 3 }}>
                  <Typography variant="body1" paragraph>
                    • 주차면별 실시간 상태 표시 (비어있음/점유중)
                  </Typography>
                  <Typography variant="body1" paragraph>
                    • 색상 코딩으로 직관적인 상태 확인
                  </Typography>
                  <Typography variant="body1" paragraph>
                    • 구역별, 층별 그룹화된 뷰 제공
                  </Typography>
                  <Typography variant="body1" paragraph>
                    • 주차면 클릭으로 상세 정보 확인
                  </Typography>
                </Box>

                <Alert severity="warning" sx={{ mb: 2 }}>
                  <Typography variant="body2">
                    🔍 <strong>상태 표시</strong>: 빨간색(점유), 초록색(비어있음), 회색(감지 불가)으로 구분됩니다.
                  </Typography>
                </Alert>
              </Box>
            </CardContent>
          </Card>

          {/* Step 3 */}
          <Card elevation={2}>
            <CardContent sx={{ p: 4 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                <Box
                  sx={{
                    width: 48,
                    height: 48,
                    borderRadius: '50%',
                    bgcolor: 'success.main',
                    color: 'white',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '1.5rem',
                    fontWeight: 'bold',
                    mr: 2,
                  }}
                >
                  3
                </Box>
                <Typography variant="h5" component="h2">
                  통계 및 분석 대시보드
                </Typography>
              </Box>

              <Box sx={{ pl: 8 }}>
                <Typography variant="h6" gutterBottom color="success.main">
                  📈 이 단계에서 배울 내용
                </Typography>
                <Box sx={{ pl: 2, mb: 3 }}>
                  <Typography variant="body1" paragraph>
                    • 실시간 점유율 및 가용 주차면 수
                  </Typography>
                  <Typography variant="body1" paragraph>
                    • 시간대별 주차 패턴 분석
                  </Typography>
                  <Typography variant="body1" paragraph>
                    • 구역별 이용률 비교 차트
                  </Typography>
                  <Typography variant="body1" paragraph>
                    • 평균 주차 시간 및 회전율 데이터
                  </Typography>
                </Box>

                <Alert severity="success" sx={{ mb: 2 }}>
                  <Typography variant="body2">
                    📊 <strong>실시간 분석</strong>: 모든 데이터는 실시간으로 업데이트되며 히스토리 데이터도 확인 가능합니다.
                  </Typography>
                </Alert>
              </Box>
            </CardContent>
          </Card>

          {/* Navigation Actions */}
          <Paper sx={{ p: 3, backgroundColor: 'grey.50' }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 2 }}>
              <Typography variant="body1" color="text.secondary">
                튜토리얼을 완료하고 실시간 주차현황을 확인해보세요
              </Typography>
              <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                <Button
                  variant="outlined"
                  onClick={() => navigate(`/project/${projectId}`)}
                >
                  🏠 대시보드로
                </Button>
                <Button
                  variant="contained"
                  color="primary"
                  onClick={() => {
                    // Navigate to actual live status implementation
                    window.location.href = `/project/${projectId}/live-status-actual`;
                  }}
                >
                  실시간 현황 보기
                </Button>
              </Box>
            </Box>
          </Paper>
        </Box>
      </Box>
    </Container>
  );
};

export default LiveParkingStatusPage;