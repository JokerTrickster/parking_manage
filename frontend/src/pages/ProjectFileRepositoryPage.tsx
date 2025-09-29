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
  Folder as FolderIcon,
  Home as HomeIcon,
} from '@mui/icons-material';
import { useNavigate, useSearchParams, useParams } from 'react-router-dom';

const ProjectFileRepositoryPage: React.FC = () => {
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
          state: { message: '프로젝트 파일 보관함을 사용하려면 먼저 프로젝트를 선택해주세요.' }
        });
      }, 3000);
    }
  }, [searchParams, navigate]);

  if (!projectId) {
    return (
      <Container maxWidth="lg">
        <Box sx={{ mt: 4, textAlign: 'center' }}>
          <Alert severity="warning" sx={{ mb: 2 }}>
            프로젝트 파일 보관함을 사용하려면 먼저 프로젝트를 선택해주세요.
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
            <FolderIcon sx={{ mr: 0.5, fontSize: { xs: 16, sm: 20 } }} />
            파일 보관함 (튜토리얼)
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
          <FolderIcon sx={{
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
            프로젝트 파일 보관함 (튜토리얼)
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
          프로젝트의 모든 파일을 체계적으로 관리하고 팀과 공유하는 방법을 학습합니다
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
                파일 유형 및 구조 이해
              </Typography>
            </Box>

            <Box sx={{ pl: 8 }}>
              <Typography variant="h6" gutterBottom color="primary.main">
                📋 이 단계에서 배울 내용
              </Typography>
              <Box sx={{ pl: 2, mb: 3 }}>
                <Typography variant="body1" paragraph>
                  • ROI 설정 파일: JSON 형식의 관심영역 좌표 데이터
                </Typography>
                <Typography variant="body1" paragraph>
                  • 맵 데이터: 주차장 레이아웃 및 구조 정보 파일
                </Typography>
                <Typography variant="body1" paragraph>
                  • 학습 이미지: 머신러닝 모델 훈련용 CCTV 이미지 데이터셋
                </Typography>
                <Typography variant="body1" paragraph>
                  • 테스트 이미지: 알고리즘 검증 및 성능 측정용 이미지
                </Typography>
                <Typography variant="body1" paragraph>
                  • 처리 결과: 분석 결과, 로그, 보고서 등 출력 파일
                </Typography>
              </Box>

              <Alert severity="info" sx={{ mb: 2 }}>
                <Typography variant="body2">
                  💡 <strong>팁</strong>: 각 파일 유형별로 폴더 구조를 체계적으로 관리하면 협업 효율성이 크게 향상됩니다.
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
                파일 업로드 및 관리
              </Typography>
            </Box>

            <Box sx={{ pl: 8 }}>
              <Typography variant="h6" gutterBottom color="secondary.main">
                🎯 이 단계에서 배울 내용
              </Typography>
              <Box sx={{ pl: 2, mb: 3 }}>
                <Typography variant="body1" paragraph>
                  • 드래그 앤 드롭으로 간편한 파일 업로드
                </Typography>
                <Typography variant="body1" paragraph>
                  • 파일명 규칙: 프로젝트ID_날짜_버전.확장자 형식 준수
                </Typography>
                <Typography variant="body1" paragraph>
                  • 폴더별 자동 분류 및 중복 파일 관리
                </Typography>
                <Typography variant="body1" paragraph>
                  • 버전 히스토리 추적 및 롤백 기능
                </Typography>
                <Typography variant="body1" paragraph>
                  • 파일 검색, 필터링, 정렬 기능 활용
                </Typography>
              </Box>

              <Alert severity="warning" sx={{ mb: 2 }}>
                <Typography variant="body2">
                  ⚠️ <strong>주의</strong>: 대용량 파일 업로드 시 안정적인 네트워크 환경에서 진행하고, 업로드 진행상황을 확인하세요.
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
                파일 공유 및 백업
              </Typography>
            </Box>

            <Box sx={{ pl: 8 }}>
              <Typography variant="h6" gutterBottom color="success.main">
                ✅ 이 단계에서 배울 내용
              </Typography>
              <Box sx={{ pl: 2, mb: 3 }}>
                <Typography variant="body1" paragraph>
                  • 팀 멤버와 안전한 파일 공유 링크 생성
                </Typography>
                <Typography variant="body1" paragraph>
                  • 접근 권한 설정: 읽기 전용, 편집 가능, 관리자 권한
                </Typography>
                <Typography variant="body1" paragraph>
                  • 자동 백업 스케줄링 및 클라우드 동기화
                </Typography>
                <Typography variant="body1" paragraph>
                  • 파일 변경 히스토리 추적 및 알림 설정
                </Typography>
                <Typography variant="body1" paragraph>
                  • 데이터 무결성 검증 및 복구 프로세스
                </Typography>
              </Box>

              <Alert severity="success" sx={{ mb: 2 }}>
                <Typography variant="body2">
                  🎉 <strong>완료!</strong> 체계적인 파일 관리로 프로젝트 데이터가 안전하게 보관되고 효율적으로 활용됩니다.
                </Typography>
              </Alert>
            </Box>
          </CardContent>
        </Card>

        {/* Navigation Actions */}
        <Paper sx={{ p: 3, backgroundColor: 'grey.50' }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 2 }}>
            <Typography variant="body1" color="text.secondary">
              튜토리얼을 완료하고 프로젝트 파일 보관함을 사용해보세요
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
                  // Navigate to actual file repository implementation
                  window.location.href = `/project/${projectId}/file-repository-actual`;
                }}
              >
                파일 보관함 시작하기
              </Button>
            </Box>
          </Box>
        </Paper>
      </Box>
    </Container>
  );
};

export default ProjectFileRepositoryPage;