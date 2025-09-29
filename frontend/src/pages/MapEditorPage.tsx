import React, { useState } from 'react';
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
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
} from '@mui/material';
import {
  Map as MapIcon,
  Home as HomeIcon,
  Close as CloseIcon,
  Fullscreen as FullscreenIcon,
} from '@mui/icons-material';
import { useNavigate, useParams } from 'react-router-dom';

const MapEditorPage: React.FC = () => {
  const navigate = useNavigate();
  const { projectId } = useParams<{ projectId: string }>();
  const [showEditor, setShowEditor] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);

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
            CAD 도면을 기반으로 주차장 맵을 생성하고 편집하는 방법을 학습합니다
          </Typography>
          <Typography variant="h6" sx={{ color: 'rgba(255,255,255,0.8)' }}>
            단계별 가이드를 따라 전문적인 주차장 맵을 만들어보세요
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
                주차 공간 영역 설정
              </Typography>
            </Box>

            <Box sx={{ pl: 8 }}>
              <Typography variant="h6" gutterBottom color="secondary.main">
                🎯 이 단계에서 배울 내용
              </Typography>
              <Box sx={{ pl: 2, mb: 3 }}>
                <Typography variant="body1" paragraph>
                  • 드래그 앤 드롭으로 주차 구역 그리기
                </Typography>
                <Typography variant="body1" paragraph>
                  • 주차면 번호 자동 생성 및 수동 설정
                </Typography>
                <Typography variant="body1" paragraph>
                  • 일반/장애인/임직원 전용 구역 설정
                </Typography>
              </Box>

              <Button
                variant="outlined"
                disabled
                sx={{ mt: 2 }}
              >
                영역 설정 도구 (준비 중)
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
                맵 검증 및 완성
              </Typography>
            </Box>

            <Box sx={{ pl: 8 }}>
              <Typography variant="h6" gutterBottom color="success.main">
                ✅ 이 단계에서 배울 내용
              </Typography>
              <Box sx={{ pl: 2, mb: 3 }}>
                <Typography variant="body1" paragraph>
                  • 설정된 주차 공간 검증 및 오류 확인
                </Typography>
                <Typography variant="body1" paragraph>
                  • 미리보기 모드로 완성된 맵 확인
                </Typography>
                <Typography variant="body1" paragraph>
                  • 맵 데이터 저장 및 다른 시스템과 연동
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
              튜토리얼을 완료하고 맵 에디터 기능을 사용해보세요
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
                onClick={() => setShowEditor(true)}
              >
                맵 에디터 시작하기
              </Button>
            </Box>
          </Box>
        </Paper>
      </Box>

      {/* Map Editor Dialog with iframe */}
      <Dialog
        open={showEditor}
        onClose={() => setShowEditor(false)}
        fullScreen={isFullscreen}
        maxWidth="xl"
        fullWidth
        sx={{
          '& .MuiDialog-paper': {
            height: isFullscreen ? '100vh' : '90vh',
            width: isFullscreen ? '100vw' : '95vw',
          }
        }}
      >
        <DialogTitle sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          bgcolor: 'primary.main',
          color: 'white'
        }}>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <MapIcon sx={{ mr: 1 }} />
            맵 에디터 - 프로젝트 {projectId}
          </Box>
          <Box>
            <IconButton
              color="inherit"
              onClick={() => setIsFullscreen(!isFullscreen)}
              sx={{ mr: 1 }}
            >
              <FullscreenIcon />
            </IconButton>
            <IconButton
              color="inherit"
              onClick={() => setShowEditor(false)}
            >
              <CloseIcon />
            </IconButton>
          </Box>
        </DialogTitle>

        <DialogContent sx={{ p: 0, height: '100%' }}>
          <Box sx={{
            width: '100%',
            height: '100%',
            display: 'flex',
            flexDirection: 'column'
          }}>
            <Alert severity="info" sx={{ m: 2, mb: 1 }}>
              <Typography variant="body2">
                🗺️ <strong>맵 에디터</strong>: localhost:3000에서 실행 중인 맵 에디터를 임베딩했습니다.
                parkingLotId=1로 설정되어 있으며, 추후 postMessage로 동적 ID 전달이 가능합니다.
              </Typography>
            </Alert>

            <Box sx={{ flexGrow: 1, m: 2, mt: 1 }}>
              <iframe
                src="http://localhost:3000/editor?parkingLotId=1"
                style={{
                  width: '100%',
                  height: '100%',
                  border: '1px solid #ddd',
                  borderRadius: '8px',
                }}
                title="맵 에디터"
                sandbox="allow-same-origin allow-scripts allow-forms allow-popups"
              />
            </Box>
          </Box>
        </DialogContent>

        <DialogActions sx={{ p: 2, bgcolor: 'grey.50' }}>
          <Typography variant="body2" color="text.secondary" sx={{ flexGrow: 1 }}>
            💡 팁: 전체화면 모드에서 더 넓은 작업 공간을 사용할 수 있습니다.
          </Typography>
          <Button
            onClick={() => setIsFullscreen(!isFullscreen)}
            startIcon={<FullscreenIcon />}
          >
            {isFullscreen ? '창 모드' : '전체화면'}
          </Button>
          <Button
            onClick={() => setShowEditor(false)}
            variant="contained"
          >
            닫기
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default MapEditorPage;