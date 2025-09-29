import React from 'react';
import {
  Box,
  Typography,
  Container,
  Alert,
  Card,
  CardContent,
  Button,
  Breadcrumbs,
  Link,
  Chip,
  Grid,
} from '@mui/material';
import {
  Settings as SettingsIcon,
  Home as HomeIcon,
  Map as MapIcon,
  Videocam as CameraIcon,
  Router as NetworkIcon,
  Tag as TagIcon,
} from '@mui/icons-material';
import { useNavigate, useParams } from 'react-router-dom';

const MapPropertiesPage: React.FC = () => {
  const navigate = useNavigate();
  const { projectId } = useParams<{ projectId: string }>();

  const propertyCategories = [
    {
      title: 'IP 주소 관리',
      icon: <NetworkIcon />,
      description: 'CCTV 카메라 및 네트워크 장비의 IP 주소를 설정합니다',
      status: '개발 예정',
      color: 'primary',
    },
    {
      title: '라벨 시스템',
      icon: <TagIcon />,
      description: '주차면, 차선, 구역별 라벨 및 태그를 관리합니다',
      status: '개발 예정',
      color: 'secondary',
    },
    {
      title: 'CCTV 연결',
      icon: <CameraIcon />,
      description: '각 카메라와 담당 구역을 매핑하고 설정합니다',
      status: '개발 예정',
      color: 'success',
    },
  ];

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
            <SettingsIcon sx={{ mr: 0.5 }} fontSize="inherit" />
            맵 속성-관계 편집기
          </Typography>
        </Breadcrumbs>
      </Box>

      {/* Page Header */}
      <Box sx={{ mb: 4, textAlign: 'center' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', mb: 2 }}>
          <SettingsIcon sx={{ fontSize: 48, color: 'primary.main', mr: 2 }} />
          <Typography variant="h3" component="h1" color="primary.main">
            맵 속성-관계 편집기
          </Typography>
        </Box>
        <Typography variant="h6" color="text.secondary">
          주차장 맵의 객체 속성과 관계를 정의하고 관리합니다
        </Typography>
      </Box>

      {/* Main Content */}
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
        <Alert severity="info" sx={{ mb: 2 }}>
          <Typography variant="body1" sx={{ fontWeight: 'medium' }}>
            🔧 개발 예정 기능
          </Typography>
          <Typography variant="body2" sx={{ mt: 1 }}>
            이 페이지는 맵 객체의 속성 및 관계를 정의하는 고급 기능이 추가될 예정입니다.
          </Typography>
        </Alert>

        {/* Property Categories */}
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 3, mb: 3 }}>
          {propertyCategories.map((category, index) => (
            <Box key={index} sx={{ flex: '1 1 300px', minWidth: 0 }}>
              <Card
                elevation={2}
                sx={{
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  transition: 'all 0.3s',
                  '&:hover': {
                    transform: 'translateY(-4px)',
                    boxShadow: 4,
                  }
                }}
              >
                <CardContent sx={{ flexGrow: 1, textAlign: 'center', p: 3 }}>
                  <Box sx={{ color: category.color, mb: 2, fontSize: 48, display: 'flex', justifyContent: 'center' }}>
                    {category.icon}
                  </Box>
                  <Typography variant="h6" component="h3" gutterBottom>
                    {category.title}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" paragraph>
                    {category.description}
                  </Typography>
                  <Chip
                    label={category.status}
                    color="default"
                    variant="outlined"
                    size="small"
                  />
                </CardContent>
              </Card>
            </Box>
          ))}
        </Box>

        {/* Features Overview */}
        <Card elevation={2}>
          <CardContent sx={{ p: 4 }}>
            <Typography variant="h5" component="h2" gutterBottom>
              📋 계획된 기능 상세
            </Typography>

            <Box sx={{ mt: 3 }}>
              <Typography variant="h6" gutterBottom color="primary.main">
                1. IP 주소 관리 시스템
              </Typography>
              <Box sx={{ pl: 2, mb: 3 }}>
                <Typography variant="body1" paragraph>
                  • 네트워크 장비별 IP 주소 할당 및 관리
                </Typography>
                <Typography variant="body1" paragraph>
                  • DHCP/Static IP 설정 지원
                </Typography>
                <Typography variant="body1" paragraph>
                  • 네트워크 연결 상태 모니터링
                </Typography>
                <Typography variant="body1" paragraph>
                  • IP 충돌 감지 및 해결 도구
                </Typography>
              </Box>

              <Typography variant="h6" gutterBottom color="secondary.main">
                2. 라벨 및 태그 시스템
              </Typography>
              <Box sx={{ pl: 2, mb: 3 }}>
                <Typography variant="body1" paragraph>
                  • 주차면별 고유 라벨 생성 및 관리
                </Typography>
                <Typography variant="body1" paragraph>
                  • 구역별 분류 및 그룹핑 기능
                </Typography>
                <Typography variant="body1" paragraph>
                  • 커스텀 태그 시스템 (VIP, 장애인 전용 등)
                </Typography>
                <Typography variant="body1" paragraph>
                  • 라벨 기반 검색 및 필터링
                </Typography>
              </Box>

              <Typography variant="h6" gutterBottom color="success.main">
                3. CCTV 연결 관리
              </Typography>
              <Box sx={{ pl: 2 }}>
                <Typography variant="body1" paragraph>
                  • 카메라와 담당 구역 매핑
                </Typography>
                <Typography variant="body1" paragraph>
                  • 실시간 영상 피드 연결 설정
                </Typography>
                <Typography variant="body1" paragraph>
                  • 카메라 각도 및 범위 시각화
                </Typography>
                <Typography variant="body1" paragraph>
                  • 영상 품질 및 연결 상태 모니터링
                </Typography>
              </Box>
            </Box>
          </CardContent>
        </Card>

        {/* Navigation Actions */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 2, mt: 3 }}>
          <Typography variant="body1" color="text.secondary">
            관련 기능을 둘러보세요
          </Typography>
          <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
            <Button
              variant="outlined"
              onClick={() => navigate('/map-editor')}
            >
              맵 에디터로
            </Button>
            <Button
              variant="contained"
              color="primary"
              onClick={() => navigate('/roi-editor')}
            >
              ROI 편집기로
            </Button>
          </Box>
        </Box>
      </Box>
    </Container>
  );
};

export default MapPropertiesPage;