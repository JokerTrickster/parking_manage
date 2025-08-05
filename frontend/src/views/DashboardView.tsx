import React from 'react';
import {
  Box,
  Card,
  CardContent,
  CardActions,
  Typography,
  Button,
  Avatar,
  Chip,
} from '@mui/material';
import {
  PlayArrow as TestIcon,
  Crop as RoiIcon,
  LiveTv as LiveIcon,
  School as LearningIcon,
  ArrowBack as BackIcon,
  CheckCircle as ActiveIcon,
  Cancel as InactiveIcon,
} from '@mui/icons-material';
import { Project } from '../models/Project';

interface DashboardViewProps {
  project: Project;
  onBack: () => void;
  onNavigate: (page: string) => void;
}

const DashboardView: React.FC<DashboardViewProps> = ({ project, onBack, onNavigate }) => {
  const menuItems = [
    {
      id: 'parking-test',
      title: '주차면 테스트',
      description: '학습 데이터와 테스트 이미지를 사용하여 주차면 감지 테스트를 수행합니다.',
      icon: <TestIcon />,
      color: '#1976d2',
    },
    {
      id: 'roi-work',
      title: 'ROI 작업',
      description: '관심 영역(ROI)을 설정하고 관리합니다.',
      icon: <RoiIcon />,
      color: '#388e3c',
    },
    {
      id: 'live-parking',
      title: '실시간 주차면',
      description: '실시간으로 주차면 상태를 모니터링합니다.',
      icon: <LiveIcon />,
      color: '#f57c00',
    },
    {
      id: 'learning-data',
      title: '학습 데이터 등록',
      description: '알고리즘 학습을 위한 데이터를 등록하고 관리합니다.',
      icon: <LearningIcon />,
      color: '#7b1fa2',
    },
  ];

  return (
    <Box>
      {/* 헤더 */}
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 4 }}>
        <Button
          startIcon={<BackIcon />}
          onClick={onBack}
          sx={{ mr: 2 }}
        >
          프로젝트 선택으로
        </Button>
        <Box sx={{ flexGrow: 1 }}>
          <Typography variant="h4" component="h1" gutterBottom>
            {project.name} 관리 시스템
          </Typography>
          <Typography variant="body1" color="text.secondary">
            {project.description} - {project.location}
          </Typography>
        </Box>
      </Box>

      {/* 메뉴 그리드 */}
      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 3, mb: 4 }}>
        {menuItems.map((item) => (
          <Box key={item.id} sx={{ flex: '1 1 300px', minWidth: 0 }}>
            <Card
              sx={{
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                cursor: 'pointer',
                '&:hover': {
                  boxShadow: 6,
                  transform: 'translateY(-2px)',
                  transition: 'all 0.2s ease-in-out',
                },
              }}
              onClick={() => onNavigate(item.id)}
            >
              <CardContent sx={{ flexGrow: 1, textAlign: 'center' }}>
                <Avatar
                  sx={{
                    width: 64,
                    height: 64,
                    mx: 'auto',
                    mb: 2,
                    bgcolor: item.color,
                  }}
                >
                  {item.icon}
                </Avatar>
                
                <Typography variant="h6" component="h2" gutterBottom>
                  {item.title}
                </Typography>
                
                <Typography variant="body2" color="text.secondary">
                  {item.description}
                </Typography>
              </CardContent>
              
              <CardActions>
                <Button
                  size="small"
                  color="primary"
                  fullWidth
                  onClick={() => onNavigate(item.id)}
                >
                  시작
                </Button>
              </CardActions>
            </Card>
          </Box>
        ))}
      </Box>

      {/* 프로젝트 정보 */}
      <Box sx={{ mt: 4 }}>
        <Typography variant="h6" gutterBottom>
          프로젝트 정보
        </Typography>
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
          <Box sx={{ flex: '1 1 200px', minWidth: 0 }}>
            <Card sx={{ height: '100px', display: 'flex', flexDirection: 'column' }}>
              <CardContent sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                <Typography variant="body2" color="text.secondary">
                  프로젝트 ID
                </Typography>
                <Typography variant="h6" sx={{ textAlign: 'center' }}>
                  {project.id}
                </Typography>
              </CardContent>
            </Card>
          </Box>
          <Box sx={{ flex: '1 1 200px', minWidth: 0 }}>
            <Card sx={{ height: '100px', display: 'flex', flexDirection: 'column' }}>
              <CardContent sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                <Typography variant="body2" color="text.secondary">
                  위치
                </Typography>
                <Typography variant="h6" sx={{ textAlign: 'center' }}>
                  {project.location}
                </Typography>
              </CardContent>
            </Card>
          </Box>
          <Box sx={{ flex: '1 1 200px', minWidth: 0 }}>
            <Card sx={{ height: '100px', display: 'flex', flexDirection: 'column' }}>
              <CardContent sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                <Typography variant="body2" color="text.secondary">
                  상태
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, justifyContent: 'center' }}>
                  <Typography variant="h6" sx={{ 
                    color: project.status === 'active' ? '#2e7d32' : '#c62828',
                    fontWeight: 600
                  }}>
                    {project.status === 'active' ? '활성' : '비활성'}
                  </Typography>
                  {project.status === 'active' ? (
                    <ActiveIcon sx={{ color: 'success.main', fontSize: 20 }} />
                  ) : (
                    <InactiveIcon sx={{ color: 'error.main', fontSize: 20 }} />
                  )}
                </Box>
              </CardContent>
            </Card>
          </Box>
          <Box sx={{ flex: '1 1 200px', minWidth: 0 }}>
            <Card sx={{ height: '100px', display: 'flex', flexDirection: 'column' }}>
              <CardContent sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                <Typography variant="body2" color="text.secondary">
                  마지막 업데이트
                </Typography>
                <Typography variant="h6" sx={{ textAlign: 'center' }}>
                  {new Date().toLocaleDateString()}
                </Typography>
              </CardContent>
            </Card>
          </Box>
        </Box>
      </Box>
    </Box>
  );
};

export default DashboardView; 