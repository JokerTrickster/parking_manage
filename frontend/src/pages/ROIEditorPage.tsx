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
  Crop as RoiIcon,
  Home as HomeIcon,
} from '@mui/icons-material';
import { useNavigate, useSearchParams, useParams } from 'react-router-dom';
import { RoiWorkView } from '../views/RoiWorkView';

const ROIEditorPage: React.FC = () => {
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
      // No project selected, show alert and redirect after delay
      setShowAlert(true);
      setTimeout(() => {
        navigate('/', {
          state: { message: 'ROI 편집기를 사용하려면 먼저 프로젝트를 선택해주세요.' }
        });
      }, 3000);
    }
  }, [searchParams, navigate]);

  const handleBack = () => {
    navigate('/', {
      state: { returnPage: 'roi-editor' }
    });
  };

  if (!projectId) {
    return (
      <Container maxWidth="lg">
        <Box sx={{ mt: 4, textAlign: 'center' }}>
          <Alert severity="warning" sx={{ mb: 2 }}>
            ROI 편집기를 사용하려면 먼저 프로젝트를 선택해주세요.
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
            <RoiIcon sx={{ mr: 0.5, fontSize: { xs: 16, sm: 20 } }} />
            ROI 편집기
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
          <RoiIcon sx={{
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
            ROI 편집기
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
          관심 영역(ROI)을 설정하고 컴퓨터 비전 성능을 최적화합니다
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
                테스트 이미지 준비 및 선택
              </Typography>
            </Box>

            <Box sx={{ pl: 8 }}>
              <Typography variant="h6" gutterBottom color="primary.main">
                📋 이 단계에서 배울 내용
              </Typography>
              <Box sx={{ pl: 2, mb: 3 }}>
                <Typography variant="body1" paragraph>
                  • 테스트 폴더에서 CCTV 이미지 선택 방법
                </Typography>
                <Typography variant="body1" paragraph>
                  • 이미지 파일명 규칙: P1_B2_3_1.jpg (구역_블록_카메라번호_순번)
                </Typography>
                <Typography variant="body1" paragraph>
                  • 각 CCTV별 테스트 이미지 관리 및 분류
                </Typography>
              </Box>

              <Alert severity="info" sx={{ mb: 2 }}>
                <Typography variant="body2">
                  💡 <strong>팁</strong>: 명확한 주차 상황이 담긴 이미지를 선택하면 더 정확한 ROI 설정이 가능합니다.
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
                ROI(관심 영역) 편집
              </Typography>
            </Box>

            <Box sx={{ pl: 8 }}>
              <Typography variant="h6" gutterBottom color="secondary.main">
                🎯 이 단계에서 배울 내용
              </Typography>
              <Box sx={{ pl: 2, mb: 3 }}>
                <Typography variant="body1" paragraph>
                  • 마우스 드래그로 주차면 영역 지정
                </Typography>
                <Typography variant="body1" paragraph>
                  • 각 주차면별 ROI 좌표 설정 및 조정
                </Typography>
                <Typography variant="body1" paragraph>
                  • 실시간 미리보기로 ROI 영역 확인
                </Typography>
                <Typography variant="body1" paragraph>
                  • 여러 주차면을 하나의 CCTV에서 관리
                </Typography>
              </Box>

              <Alert severity="warning" sx={{ mb: 2 }}>
                <Typography variant="body2">
                  ⚠️ <strong>주의</strong>: ROI 영역이 겹치지 않도록 주의하고, 차량이 완전히 들어갈 수 있는 크기로 설정하세요.
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
                ROI 파일 저장 및 관리
              </Typography>
            </Box>

            <Box sx={{ pl: 8 }}>
              <Typography variant="h6" gutterBottom color="success.main">
                ✅ 이 단계에서 배울 내용
              </Typography>
              <Box sx={{ pl: 2, mb: 3 }}>
                <Typography variant="body1" paragraph>
                  • ROI 좌표 데이터를 JSON 파일로 저장
                </Typography>
                <Typography variant="body1" paragraph>
                  • CCTV별 ROI 파일 관리 및 버전 관리
                </Typography>
                <Typography variant="body1" paragraph>
                  • 저장된 ROI 파일 불러오기 및 수정
                </Typography>
                <Typography variant="body1" paragraph>
                  • ROI 설정 검증 및 테스트
                </Typography>
              </Box>

              <Alert severity="success" sx={{ mb: 2 }}>
                <Typography variant="body2">
                  🎉 <strong>완료!</strong> 설정된 ROI는 실시간 주차 감지 시스템에서 자동으로 사용됩니다.
                </Typography>
              </Alert>
            </Box>
          </CardContent>
        </Card>

        {/* Navigation Actions */}
        <Paper sx={{ p: 3, backgroundColor: 'grey.50' }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 2 }}>
            <Typography variant="body1" color="text.secondary">
              튜토리얼을 완료하고 ROI 편집 기능을 사용해보세요
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
                  // Navigate to actual ROI editor implementation
                  window.location.href = `/project/${projectId}/roi-editor-actual`;
                }}
              >
                ROI 편집기 시작하기
              </Button>
            </Box>
          </Box>
        </Paper>
      </Box>
    </Container>
  );
};

export default ROIEditorPage;