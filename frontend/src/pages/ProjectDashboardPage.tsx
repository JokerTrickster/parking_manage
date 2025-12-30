import React from 'react';
import {
  Box,
  Typography,
  Paper,
  Container,
  Card,
  CardContent,
  CardActions,
  Button,
  Avatar,
  Breadcrumbs,
  Link,
  Grid,
} from '@mui/material';
import {
  Map as MapIcon,
  Crop as RoiIcon,
  LiveTv as LiveIcon,
  Tune as TuneIcon,
  Folder as FolderIcon,
  Home as HomeIcon,
  Business as BusinessIcon,
  Rocket as RocketIcon,
  Storage as StorageIcon,
} from '@mui/icons-material';
import { useNavigate, useParams } from 'react-router-dom';

const ProjectDashboardPage: React.FC = () => {
  const navigate = useNavigate();
  const { projectId } = useParams<{ projectId: string }>();

  // 로컬 스토리지에서 선택된 프로젝트 정보 가져오기
  const selectedProject = localStorage.getItem('selectedProject');
  const projectData = selectedProject ? JSON.parse(selectedProject) : null;

  const features = [
    {
      id: 'map-editor',
      title: '맵 에디터',
      description: 'CAD 파일 업로드, 맵 오브젝트 추출, 속성 정의 및 관계 설정',
      icon: <MapIcon />,
      color: '#1976d2',
      path: `/project/${projectId}/map-editor`,
    },
    {
      id: 'roi-editor',
      title: 'ROI 편집기',
      description: '관심 영역(ROI)을 설정하고 편집합니다',
      icon: <RoiIcon />,
      color: '#f57c00',
      path: `/project/${projectId}/roi-editor`,
    },
    {
      id: 'live-status',
      title: '실시간 주차현황',
      description: '실시간으로 주차 상태를 모니터링합니다',
      icon: <LiveIcon />,
      color: '#d32f2f',
      path: `/project/${projectId}/live-status`,
    },
    {
      id: 'learning-data-management',
      title: '학습 데이터 관리',
      description: 'ROI 파일과 학습 이미지를 선택하여 차량 점유 상태를 표시합니다',
      icon: <StorageIcon />,
      color: '#388e3c',
      path: `/project/${projectId}/learning-data-management`,
    },
    {
      id: 'algorithm-tuning',
      title: '알고리즘 튜닝',
      description: '주차 감지 알고리즘을 조정하고 최적화합니다',
      icon: <TuneIcon />,
      color: '#7b1fa2',
      path: `/project/${projectId}/parking-validation`,
    },
    {
      id: 'file-repository',
      title: '프로젝트 파일 보관함',
      description: '5가지 파일 카테고리별 체계적 관리 시스템',
      icon: <FolderIcon />,
      color: '#455a64',
      path: `/project/${projectId}/file-repository`,
    },
  ];

  const handleFeatureSelect = (path: string) => {
    navigate(path);
  };

  return (
    <Container maxWidth="xl">
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
          <Typography color="text.primary" sx={{ display: 'flex', alignItems: 'center' }}>
            <BusinessIcon sx={{ mr: 0.5 }} fontSize="inherit" />
            {projectData?.name || `프로젝트 ${projectId}`}
          </Typography>
        </Breadcrumbs>
      </Box>

      {/* Project Header */}
      <Paper elevation={2} sx={{ p: 3, mb: 4, background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          <Avatar sx={{ bgcolor: 'rgba(255,255,255,0.2)', mr: 3, width: 64, height: 64 }}>
            <BusinessIcon sx={{ fontSize: 32, color: 'white' }} />
          </Avatar>
          <Box>
            <Typography variant="h4" component="h1" sx={{ color: 'white', fontWeight: 'bold' }}>
              {projectData?.name || `프로젝트 ${projectId}`}
            </Typography>
            <Typography variant="h6" sx={{ color: 'rgba(255,255,255,0.8)', mt: 1 }}>
              {projectData?.description || '주차 관리 시스템 프로젝트'}
            </Typography>
            {projectData?.location && (
              <Typography variant="body1" sx={{ color: 'rgba(255,255,255,0.7)', mt: 0.5 }}>
                📍 {projectData.location}
              </Typography>
            )}
          </Box>
        </Box>
      </Paper>

      {/* Features Grid */}
      <Typography variant="h5" component="h2" gutterBottom sx={{ mb: 3, fontWeight: 'bold' }}>
        🛠️ 프로젝트 관리 기능
      </Typography>

      <Box sx={{
        display: 'grid',
        gridTemplateColumns: {
          xs: '1fr',
          sm: 'repeat(2, 1fr)',
          md: 'repeat(3, 1fr)',
        },
        gap: 3,
      }}>
        {features.map((feature) => (
          <Card
            key={feature.id}
            sx={{
              height: '280px',
              display: 'flex',
              flexDirection: 'column',
              cursor: 'pointer',
              '&:hover': {
                boxShadow: 8,
                transform: 'translateY(-4px)',
                transition: 'all 0.3s ease-in-out',
              },
            }}
            onClick={() => handleFeatureSelect(feature.path)}
          >
            <CardContent sx={{ flexGrow: 1, textAlign: 'center', p: 3 }}>
              <Avatar
                sx={{
                  bgcolor: feature.color,
                  width: 72,
                  height: 72,
                  mx: 'auto',
                  mb: 2,
                }}
              >
                {React.cloneElement(feature.icon, { sx: { fontSize: 36 } })}
              </Avatar>

              <Typography variant="h6" component="h3" gutterBottom sx={{ fontWeight: 'bold' }}>
                {feature.title}
              </Typography>

              <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.6 }}>
                {feature.description}
              </Typography>
            </CardContent>

            <CardActions sx={{ justifyContent: 'center', pb: 3 }}>
              <Button
                variant="contained"
                size="large"
                sx={{
                  bgcolor: feature.color,
                  '&:hover': {
                    bgcolor: feature.color,
                    filter: 'brightness(0.9)',
                  },
                  px: 4,
                }}
              >
                시작하기
              </Button>
            </CardActions>
          </Card>
        ))}
      </Box>

      {/* Project Overview */}
      <Box sx={{ mt: 4 }}>
        <Typography variant="h5" gutterBottom sx={{ fontWeight: 'bold', mb: 3 }}>
          📊 프로젝트 개요
        </Typography>

        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', md: 'repeat(4, 1fr)' }, gap: 2, mb: 4 }}>
          <Card sx={{ p: 2, textAlign: 'center' }}>
            <Typography variant="h4" sx={{ mb: 1 }}>🟢</Typography>
            <Typography variant="h6" sx={{ fontWeight: 'bold' }}>운영 중</Typography>
            <Typography variant="body2" color="text.secondary">시스템 상태</Typography>
          </Card>

          <Card sx={{ p: 2, textAlign: 'center' }}>
            <Typography variant="h4" sx={{ mb: 1 }}>📅</Typography>
            <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
              {new Date().toLocaleDateString('ko-KR')}
            </Typography>
            <Typography variant="body2" color="text.secondary">오늘 날짜</Typography>
          </Card>

          <Card sx={{ p: 2, textAlign: 'center' }}>
            <Typography variant="h4" sx={{ mb: 1 }}>5</Typography>
            <Typography variant="h6" sx={{ fontWeight: 'bold' }}>관리 기능</Typography>
            <Typography variant="body2" color="text.secondary">사용 가능</Typography>
          </Card>

          <Card sx={{ p: 2, textAlign: 'center' }}>
            <Typography variant="h4" sx={{ mb: 1 }}>📈</Typography>
            <Typography variant="h6" sx={{ fontWeight: 'bold' }}>실시간</Typography>
            <Typography variant="body2" color="text.secondary">모니터링</Typography>
          </Card>
        </Box>

        {/* 모니터링 및 프로젝트 정보 */}
        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: 'repeat(2, 1fr)' }, gap: 2 }}>
          <Card sx={{ p: 3 }}>
            <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 2 }}>
              📊 모니터링 대시보드
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              Grafana 실시간 모니터링
            </Typography>
            <Button
              variant="contained"
              fullWidth
              onClick={() => window.open('https://banpo-grafana.luxrobo.org/d/m0arCBf72/aaaea1b?orgId=1&from=now-12h&to=now&timezone=browser&var-job=$__all&var-instance=$__all&var-vision_job=$__all&var-vision_service=$__all&var-vision_node=$__all&var-vision_container=$__all&var-host=$__all&var-container=$__all&refresh=1m', '_blank')}
            >
              모니터링 접속
            </Button>
          </Card>

          <Card sx={{ p: 3 }}>
            <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 2 }}>
              ℹ️ 프로젝트 정보
            </Typography>
            <Typography variant="body2" sx={{ mb: 1 }}>
              🔧 마지막 배포: {new Date(Date.now() - 24 * 60 * 60 * 1000).toLocaleDateString('ko-KR')}
            </Typography>
            <Typography variant="body2" sx={{ mb: 1 }}>
              👥 활성 사용자: 3명
            </Typography>
            <Typography variant="body2" sx={{ mb: 2 }}>
              📍 서버 위치: 한국 (Seoul)
            </Typography>
            <Button
              variant="outlined"
              fullWidth
              startIcon={<RocketIcon />}
              onClick={() => navigate(`/project/${projectId}/deployments`)}
              sx={{ mt: 1 }}
            >
              배포 결과 보기
            </Button>
          </Card>
        </Box>
      </Box>
    </Container>
  );
};

export default ProjectDashboardPage;