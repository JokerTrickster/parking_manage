import React from 'react';
import {
  Box,
  Typography,
  Paper,
  Container,
  Card,
  CardContent,
  Button,
  Breadcrumbs,
  Link,
} from '@mui/material';
import {
  Folder as FolderIcon,
  Home as HomeIcon,
  Business as BusinessIcon,
} from '@mui/icons-material';
import { useNavigate, useParams } from 'react-router-dom';

const ProjectFileRepositoryTutorialPage: React.FC = () => {
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
            <BusinessIcon sx={{ mr: 0.5 }} fontSize="inherit" />
            프로젝트 {projectId}
          </Link>
          <Typography color="text.primary" sx={{ display: 'flex', alignItems: 'center' }}>
            <FolderIcon sx={{ mr: 0.5 }} fontSize="inherit" />
            프로젝트 파일 보관함 튜토리얼
          </Typography>
        </Breadcrumbs>
      </Box>

      {/* Tutorial Header */}
      <Paper elevation={3} sx={{ p: 4, mb: 4, background: 'linear-gradient(135deg, #455a64 0%, #607d8b 100%)' }}>
        <Box sx={{ textAlign: 'center' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', mb: 2 }}>
            <FolderIcon sx={{ fontSize: 64, color: 'white', mr: 2 }} />
            <Typography variant="h3" component="h1" sx={{ color: 'white', fontWeight: 'bold' }}>
              프로젝트 파일 보관함 튜토리얼
            </Typography>
          </Box>
          <Typography variant="h5" sx={{ color: 'rgba(255,255,255,0.9)', mb: 2 }}>
            5가지 파일 카테고리별 관리 시스템
          </Typography>
          <Typography variant="h6" sx={{ color: 'rgba(255,255,255,0.8)' }}>
            체계적인 파일 관리로 효율적인 프로젝트 운영을 실현하세요
          </Typography>
        </Box>
      </Paper>

      {/* Tutorial Steps */}
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
        {/* 학습 이미지 관리 */}
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
                📚
              </Box>
              <Typography variant="h5" component="h2">
                학습 이미지 관리
              </Typography>
            </Box>

            <Box sx={{ pl: 8 }}>
              <Typography variant="h6" gutterBottom color="primary.main">
                📋 이 카테고리의 용도
              </Typography>
              <Box sx={{ pl: 2, mb: 3 }}>
                <Typography variant="body1" paragraph>
                  • AI 모델 학습용 이미지 데이터셋 관리
                </Typography>
                <Typography variant="body1" paragraph>
                  • 다양한 주차 상황 (점유/비점유) 이미지 수집
                </Typography>
                <Typography variant="body1" paragraph>
                  • 학습 데이터 품질 관리 및 라벨링 상태 추적
                </Typography>
                <Typography variant="body1" paragraph>
                  • 저장 위치: shared/{projectId}/learningImages/
                </Typography>
              </Box>
            </Box>
          </CardContent>
        </Card>

        {/* 테스트 이미지 관리 */}
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
                🧪
              </Box>
              <Typography variant="h5" component="h2">
                테스트 이미지 관리
              </Typography>
            </Box>

            <Box sx={{ pl: 8 }}>
              <Typography variant="h6" gutterBottom color="secondary.main">
                🎯 이 카테고리의 용도
              </Typography>
              <Box sx={{ pl: 2, mb: 3 }}>
                <Typography variant="body1" paragraph>
                  • 알고리즘 성능 검증용 테스트 이미지 관리
                </Typography>
                <Typography variant="body1" paragraph>
                  • 정확도 측정 및 성능 벤치마킹 데이터
                </Typography>
                <Typography variant="body1" paragraph>
                  • 다양한 환경 조건 (조명, 날씨, 시간)별 테스트
                </Typography>
                <Typography variant="body1" paragraph>
                  • 저장 위치: shared/{projectId}/testImages/
                </Typography>
              </Box>
            </Box>
          </CardContent>
        </Card>

        {/* ROI 파일 관리 */}
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
                🎯
              </Box>
              <Typography variant="h5" component="h2">
                ROI 파일 관리
              </Typography>
            </Box>

            <Box sx={{ pl: 8 }}>
              <Typography variant="h6" gutterBottom color="warning.main">
                📐 이 카테고리의 용도
              </Typography>
              <Box sx={{ pl: 2, mb: 3 }}>
                <Typography variant="body1" paragraph>
                  • 관심 영역(Region of Interest) 설정 파일 관리
                </Typography>
                <Typography variant="body1" paragraph>
                  • 주차면별 좌표 정보 및 경계선 데이터
                </Typography>
                <Typography variant="body1" paragraph>
                  • ROI 편집기에서 생성한 설정 파일 보관
                </Typography>
                <Typography variant="body1" paragraph>
                  • 저장 위치: shared/{projectId}/roi/
                </Typography>
              </Box>
            </Box>
          </CardContent>
        </Card>

        {/* CAD 데이터 관리 */}
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
                📐
              </Box>
              <Typography variant="h5" component="h2">
                CAD 데이터 관리
              </Typography>
            </Box>

            <Box sx={{ pl: 8 }}>
              <Typography variant="h6" gutterBottom color="info.main">
                🏗️ 이 카테고리의 용도
              </Typography>
              <Box sx={{ pl: 2, mb: 3 }}>
                <Typography variant="body1" paragraph>
                  • 주차장 설계 도면 및 CAD 파일 관리
                </Typography>
                <Typography variant="body1" paragraph>
                  • DWG, DXF, PDF 형식의 건축 도면 보관
                </Typography>
                <Typography variant="body1" paragraph>
                  • 맵 에디터의 오브젝트 추출 소스 파일
                </Typography>
                <Typography variant="body1" paragraph>
                  • 저장 위치: shared/{projectId}/cad/
                </Typography>
              </Box>
            </Box>
          </CardContent>
        </Card>

        {/* Map 파일 관리 */}
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
                🗺️
              </Box>
              <Typography variant="h5" component="h2">
                Map 파일 관리
              </Typography>
            </Box>

            <Box sx={{ pl: 8 }}>
              <Typography variant="h6" gutterBottom color="success.main">
                🗺️ 이 카테고리의 용도
              </Typography>
              <Box sx={{ pl: 2, mb: 3 }}>
                <Typography variant="body1" paragraph>
                  • 완성된 주차장 맵 데이터 파일 관리
                </Typography>
                <Typography variant="body1" paragraph>
                  • 맵 에디터에서 생성한 오브젝트 정의 및 관계 설정
                </Typography>
                <Typography variant="body1" paragraph>
                  • JSON 형식의 맵 구조 및 메타데이터
                </Typography>
                <Typography variant="body1" paragraph>
                  • 저장 위치: shared/{projectId}/map/
                </Typography>
              </Box>
            </Box>
          </CardContent>
        </Card>

        {/* Navigation Actions */}
        <Paper sx={{ p: 3, backgroundColor: 'grey.50' }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 2 }}>
            <Typography variant="body1" color="text.secondary">
              5가지 파일 카테고리를 이해하고 체계적인 파일 관리를 시작해보세요
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
                onClick={() => navigate(`/project/${projectId}/file-repository-actual`)}
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

export default ProjectFileRepositoryTutorialPage;