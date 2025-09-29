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
  CheckCircle as ValidationIcon,
  Home as HomeIcon,
} from '@mui/icons-material';
import { useNavigate, useSearchParams, useParams } from 'react-router-dom';

const ParkingValidationPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { projectId: routeProjectId } = useParams<{ projectId: string }>();
  const [projectId, setProjectId] = useState<string>('');
  const [showAlert, setShowAlert] = useState(false);

  useEffect(() => {
    // Get project ID from URL params or localStorage
    const urlProjectId = searchParams.get('projectId') || routeProjectId;
    const storedProjectId = localStorage.getItem('selectedProjectId');

    if (urlProjectId) {
      setProjectId(urlProjectId);
      localStorage.setItem('selectedProjectId', urlProjectId);
    } else if (storedProjectId) {
      setProjectId(storedProjectId);
    } else {
      // No project selected, show alert and redirect
      setShowAlert(true);
      setTimeout(() => {
        navigate('/', {
          state: { message: '알고리즘 튜닝을 사용하려면 먼저 프로젝트를 선택해주세요.' }
        });
      }, 3000);
    }
  }, [searchParams, navigate]);


  if (!projectId) {
    return (
      <Container maxWidth="lg">
        <Box sx={{ mt: 4, textAlign: 'center' }}>
          <Alert severity="warning" sx={{ mb: 2 }}>
            알고리즘 튜닝을 사용하려면 먼저 프로젝트를 선택해주세요.
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
          <Typography
            color="text.primary"
            sx={{
              display: 'flex',
              alignItems: 'center',
              fontSize: { xs: '0.875rem', sm: '1rem' }
            }}
          >
            <ValidationIcon sx={{ mr: 0.5, fontSize: { xs: 16, sm: 20 } }} />
            알고리즘 튜닝
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
            알고리즘 튜닝 (튜토리얼)
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
          MOG2 알고리즘 파라미터를 조정하여 주차면 감지 정확도를 향상시킵니다
        </Typography>
      </Box>

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
                  bgcolor: 'primary.main',
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
                MOG2 알고리즘 이해
              </Typography>
            </Box>

            <Box sx={{ pl: 8 }}>
              <Typography variant="h6" gutterBottom color="primary.main">
                📋 이 단계에서 배울 내용
              </Typography>
              <Box sx={{ pl: 2, mb: 3 }}>
                <Typography variant="body1" paragraph>
                  • MOG2 배경 차분 알고리즘의 기본 원리
                </Typography>
                <Typography variant="body1" paragraph>
                  • 학습률(Learning Rate)과 민감도 설정의 영향
                </Typography>
                <Typography variant="body1" paragraph>
                  • 히스토리 프레임 수와 배경 모델 업데이트 방식
                </Typography>
                <Typography variant="body1" paragraph>
                  • 차량 감지 영역과 노이즈 제거 방법
                </Typography>
              </Box>

              <Alert severity="info" sx={{ mb: 2 }}>
                <Typography variant="body2">
                  💡 <strong>팁</strong>: MOG2는 동적 배경에서 움직이는 객체를 감지하는 가우시안 혼합 모델입니다. 주차장 환경의 조명 변화와 그림자를 고려해야 합니다.
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
                  bgcolor: 'secondary.main',
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
                파라미터 튜닝
              </Typography>
            </Box>

            <Box sx={{ pl: 8 }}>
              <Typography variant="h6" gutterBottom color="secondary.main">
                🎯 이 단계에서 배울 내용
              </Typography>
              <Box sx={{ pl: 2, mb: 3 }}>
                <Typography variant="body1" paragraph>
                  • 감지 민감도 조정으로 오탐지/미탐지 최소화
                </Typography>
                <Typography variant="body1" paragraph>
                  • 노이즈 제거 필터 강도 설정
                </Typography>
                <Typography variant="body1" paragraph>
                  • 임계값(Threshold) 조정을 통한 정확도 향상
                </Typography>
                <Typography variant="body1" paragraph>
                  • 실시간 피드백으로 파라미터 효과 확인
                </Typography>
              </Box>

              <Alert severity="warning" sx={{ mb: 2 }}>
                <Typography variant="body2">
                  ⚠️ <strong>주의</strong>: 파라미터 변경 시 다양한 조건(주간/야간, 날씨)에서 테스트하여 안정성을 확인하세요.
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
                검증 및 최적화
              </Typography>
            </Box>

            <Box sx={{ pl: 8 }}>
              <Typography variant="h6" gutterBottom color="success.main">
                ✅ 이 단계에서 배울 내용
              </Typography>
              <Box sx={{ pl: 2, mb: 3 }}>
                <Typography variant="body1" paragraph>
                  • 테스트 데이터셋으로 알고리즘 성능 측정
                </Typography>
                <Typography variant="body1" paragraph>
                  • 정확도, 재현율, F1-Score 등 성능 지표 분석
                </Typography>
                <Typography variant="body1" paragraph>
                  • A/B 테스트를 통한 파라미터 조합 비교
                </Typography>
                <Typography variant="body1" paragraph>
                  • 최적화된 설정 저장 및 배포 준비
                </Typography>
              </Box>

              <Alert severity="success" sx={{ mb: 2 }}>
                <Typography variant="body2">
                  🎉 <strong>완료!</strong> 튜닝된 알고리즘은 실시간 주차 감지 시스템에 자동으로 적용됩니다.
                </Typography>
              </Alert>
            </Box>
          </CardContent>
        </Card>

        {/* Navigation Actions */}
        <Paper sx={{ p: 3, backgroundColor: 'grey.50' }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 2 }}>
            <Typography variant="body1" color="text.secondary">
              튜토리얼을 완료하고 알고리즘 튜닝 기능을 사용해보세요
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
                  // Navigate to actual algorithm tuning implementation
                  window.location.href = `/project/${projectId}/parking-validation-actual`;
                }}
              >
                알고리즘 튜닝 시작하기
              </Button>
            </Box>
          </Box>
        </Paper>
      </Box>
    </Container>
  );
};

export default ParkingValidationPage;