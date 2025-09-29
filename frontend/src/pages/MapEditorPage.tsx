import React from 'react';
import {
  Box,
  Typography,
  Paper,
  Container,
  Alert,
  Card,
  CardContent,
  Button,
  Breadcrumbs,
  Link,
} from '@mui/material';
import {
  Map as MapIcon,
  Home as HomeIcon,
} from '@mui/icons-material';
import { useNavigate, useParams } from 'react-router-dom';

const MapEditorPage: React.FC = () => {
  const navigate = useNavigate();
  const { projectId } = useParams<{ projectId: string }>();

  return (
    <Container maxWidth="lg">
      {/* Breadcrumb Navigation */}
      <Box sx={{ mb: 3 }}>
        <Breadcrumbs aria-label="breadcrumb">
          <Link
            color="inherit"
            onClick={() => navigate('/')}
            sx={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}
          >
            <HomeIcon sx={{ mr: 0.5 }} fontSize="inherit" />
            프로젝트 선택
          </Link>
          <Link
            color="inherit"
            onClick={() => navigate(`/project/${projectId}`)}
            sx={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}
          >
            프로젝트 {projectId}
          </Link>
          <Typography color="text.primary" sx={{ display: 'flex', alignItems: 'center' }}>
            <MapIcon sx={{ mr: 0.5 }} fontSize="inherit" />
            맵 에디터
          </Typography>
        </Breadcrumbs>
      </Box>

      {/* Tutorial Header */}
      <Paper elevation={3} sx={{ p: 4, mb: 4, background: 'linear-gradient(135deg, #1976d2 0%, #42a5f5 100%)' }}>
        <Box sx={{ textAlign: 'center' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', mb: 2 }}>
            <MapIcon sx={{ fontSize: 64, color: 'white', mr: 2 }} />
            <Typography variant="h3" component="h1" sx={{ color: 'white', fontWeight: 'bold' }}>
              맵 에디터 튜토리얼
            </Typography>
          </Box>
          <Typography variant="h5" sx={{ color: 'rgba(255,255,255,0.9)', mb: 2 }}>
            CAD 파일 업로드부터 맵 오브젝트 추출, 속성 정의, 관계 설정까지
          </Typography>
          <Typography variant="h6" sx={{ color: 'rgba(255,255,255,0.8)' }}>
            통합된 맵 에디터로 전문적인 주차장 맵을 완성하세요
          </Typography>
        </Box>
      </Paper>

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
                CAD 파일 준비 및 업로드
              </Typography>
            </Box>

            <Box sx={{ pl: 8 }}>
              <Typography variant="h6" gutterBottom color="primary.main">
                📋 이 단계에서 배울 내용
              </Typography>
              <Box sx={{ pl: 2, mb: 3 }}>
                <Typography variant="body1" paragraph>
                  • 지원되는 CAD 파일 형식 (DWG, DXF, PDF)
                </Typography>
                <Typography variant="body1" paragraph>
                  • 파일 크기 및 해상도 최적화 방법
                </Typography>
                <Typography variant="body1" paragraph>
                  • 업로드 과정에서 발생할 수 있는 문제 해결
                </Typography>
              </Box>

              <Alert severity="warning" sx={{ mb: 2 }}>
                <Typography variant="body2">
                  🚧 <strong>개발 중</strong>: 현재 CAD 파일 업로드 기능을 개발하고 있습니다.
                </Typography>
              </Alert>

              <Button
                variant="outlined"
                disabled
                sx={{ mt: 2 }}
              >
                파일 업로드 (준비 중)
              </Button>
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
                맵 오브젝트 추출 및 인식
              </Typography>
            </Box>

            <Box sx={{ pl: 8 }}>
              <Typography variant="h6" gutterBottom color="secondary.main">
                🎯 이 단계에서 배울 내용
              </Typography>
              <Box sx={{ pl: 2, mb: 3 }}>
                <Typography variant="body1" paragraph>
                  • CAD 파일에서 주차 라인, 벽, 기둥 등 오브젝트 자동 인식
                </Typography>
                <Typography variant="body1" paragraph>
                  • 레이어별 오브젝트 분류 및 정리
                </Typography>
                <Typography variant="body1" paragraph>
                  • 벡터 데이터를 실제 좌표계로 변환
                </Typography>
              </Box>

              <Button
                variant="outlined"
                disabled
                sx={{ mt: 2 }}
              >
                오브젝트 추출 (준비 중)
              </Button>
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
                3
              </Box>
              <Typography variant="h5" component="h2">
                오브젝트 속성 정의
              </Typography>
            </Box>

            <Box sx={{ pl: 8 }}>
              <Typography variant="h6" gutterBottom color="warning.main">
                ⚙️ 이 단계에서 배울 내용
              </Typography>
              <Box sx={{ pl: 2, mb: 3 }}>
                <Typography variant="body1" paragraph>
                  • 주차면별 고유 ID 및 번호 설정
                </Typography>
                <Typography variant="body1" paragraph>
                  • 일반/장애인/임직원/전기차 전용 구역 분류
                </Typography>
                <Typography variant="body1" paragraph>
                  • 크기, 방향, 접근성 등 물리적 속성 정의
                </Typography>
              </Box>

              <Button
                variant="outlined"
                disabled
                sx={{ mt: 2 }}
              >
                속성 정의 도구 (준비 중)
              </Button>
            </Box>
          </CardContent>
        </Card>

        {/* Step 4 */}
        <Card elevation={2}>
          <CardContent sx={{ p: 4 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
              <Box
                sx={{
                  width: 48,
                  height: 48,
                  borderRadius: '50%',
                  bgcolor: 'info.main',
                  color: 'white',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '1.5rem',
                  fontWeight: 'bold',
                  mr: 2,
                }}
              >
                4
              </Box>
              <Typography variant="h5" component="h2">
                관계 정의 및 규칙 설정
              </Typography>
            </Box>

            <Box sx={{ pl: 8 }}>
              <Typography variant="h6" gutterBottom color="info.main">
                🔗 이 단계에서 배울 내용
              </Typography>
              <Box sx={{ pl: 2, mb: 3 }}>
                <Typography variant="body1" paragraph>
                  • 주차면과 통로, 출입구 간의 접근 경로 정의
                </Typography>
                <Typography variant="body1" paragraph>
                  • 구역별 우선순위 및 사용 규칙 설정
                </Typography>
                <Typography variant="body1" paragraph>
                  • CCTV 커버리지와 주차면 매핑 관계 설정
                </Typography>
              </Box>

              <Button
                variant="outlined"
                disabled
                sx={{ mt: 2 }}
              >
                관계 설정 도구 (준비 중)
              </Button>
            </Box>
          </CardContent>
        </Card>

        {/* Step 5 */}
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
                5
              </Box>
              <Typography variant="h5" component="h2">
                맵 검증 및 완성
              </Typography>
            </Box>

            <Box sx={{ pl: 8 }}>
              <Typography variant="h6" gutterBottom color="success.main">
                ✅ 이 단계에서 배울 내용
              </Typography>
              <Box sx={{ pl: 2, mb: 3 }}>
                <Typography variant="body1" paragraph>
                  • 전체 맵 구조의 논리적 일관성 검증
                </Typography>
                <Typography variant="body1" paragraph>
                  • 3D 미리보기로 완성된 맵 시각화
                </Typography>
                <Typography variant="body1" paragraph>
                  • 맵 데이터 저장 및 시스템 연동 설정
                </Typography>
              </Box>

              <Button
                variant="outlined"
                disabled
                sx={{ mt: 2 }}
              >
                맵 검증 (준비 중)
              </Button>
            </Box>
          </CardContent>
        </Card>

        {/* Navigation Actions */}
        <Paper sx={{ p: 3, backgroundColor: 'grey.50' }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 2 }}>
            <Typography variant="body1" color="text.secondary">
              5단계 튜토리얼을 완료하고 통합 맵 에디터 기능을 사용해보세요
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
                onClick={() => navigate(`/project/${projectId}/map-editor-actual`)}
              >
                맵 에디터 시작하기
              </Button>
            </Box>
          </Box>
        </Paper>
      </Box>
    </Container>
  );
};

export default MapEditorPage;