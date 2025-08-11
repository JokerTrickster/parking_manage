import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  Box,
  Button,
  Typography,
  Card,
  CardContent,
  TextField,
  Alert,
  CircularProgress,
} from '@mui/material';
import {
  ArrowBack as BackIcon,
  PlayArrow as StartIcon,
  Visibility as ViewResultsIcon,
  CheckCircle as SuccessIcon,
  Refresh as RefreshIcon,
} from '@mui/icons-material';
import { Project } from '../models/Project';
import { ParkingTestViewModel, ParkingTestState } from '../viewmodels/ParkingTestViewModel';
import FileUploadView from './FileUploadView';

interface ParkingTestViewProps {
  project: Project;
  onBack: () => void;
  onShowLearningResults?: (projectId: string, folderPath: string, cctvList: any[], timestamp: string) => void;
}

const ParkingTestView: React.FC<ParkingTestViewProps> = ({ project, onBack, onShowLearningResults }) => {
  const [state, setState] = useState<ParkingTestState>({
    loading: false,
    stats: null,
    varThreshold: 50.0,
    learningRate: 0.001,
    iterations: 1000,
    testResult: null,
    learningResult: null,
    learningResultsData: null,
    showResults: false,
    error: null,
    selectedLearningPath: '',
    selectedTestPath: '',
    selectedRoiPath: '',
    lastLearningFolderPath: null,
  });

  const viewModel = useMemo(() => new ParkingTestViewModel(project, state, setState), [project.id]);

  const loadStats = useCallback(() => {
    viewModel.loadProjectStats();
  }, [viewModel]);

  useEffect(() => {
    // 한 번만 호출
    loadStats();
  }, [loadStats]); // loadStats 의존성 추가

  const handleStartLearning = async () => {
    await viewModel.startLearning(state);
  };

  const handleViewResults = async () => {
    console.log('학습 결과 보기 버튼 클릭됨');
    
    if (state.lastLearningFolderPath) {
      try {
        // 결과 데이터 로드 (이미 있으면 재사용)
        const resultsData = state.learningResultsData || await viewModel.loadLearningResults(state.lastLearningFolderPath);
        
        if (resultsData && onShowLearningResults) {
          console.log('새로운 페이지로 이동:', resultsData);
          onShowLearningResults(
            project.id,
            state.lastLearningFolderPath,
            resultsData.cctv_list,
            resultsData.timestamp
          );
        } else {
          console.log('결과 데이터가 없거나 onShowLearningResults가 없음');
        }
      } catch (error) {
        console.error('학습 결과 로드 실패:', error);
      }
    } else {
      console.log('lastLearningFolderPath가 없음');
    }
  };

  const handleRefreshStats = () => {
    viewModel.loadProjectStats();
  };

  return (
    <Box>
      {/* 헤더 */}
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 4 }}>
        <Button
          startIcon={<BackIcon />}
          onClick={onBack}
          sx={{ mr: 2 }}
        >
          대시보드로
        </Button>
        <Typography variant="h4" component="h1">
          주차면 테스트 - {project.name}
        </Typography>
      </Box>

      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
        {/* 파일 업로드 섹션 */}
        <Box>
          <Typography variant="h5" gutterBottom>
            데이터 업로드
          </Typography>
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 3 }}>
            <Box sx={{ flex: '1 1 400px', minWidth: 0 }}>
              <FileUploadView
                projectId={project.id}
                fileType="learning"
                onUploadSuccess={(filePath: string) => {
                  console.log('학습 이미지 업로드 성공:', filePath);
                  viewModel.setSelectedLearningPath(filePath);
                }}
              />
            </Box>
            <Box sx={{ flex: '1 1 400px', minWidth: 0 }}>
              <FileUploadView
                projectId={project.id}
                fileType="test"
                onUploadSuccess={(folderPath: string) => {
                  console.log('테스트 이미지 폴더 선택 성공:', folderPath);
                  viewModel.setSelectedTestPath(folderPath);
                }}
              />
            </Box>
            <Box sx={{ flex: '1 1 400px', minWidth: 0 }}>
              <FileUploadView
                projectId={project.id}
                fileType="roi"
                onUploadSuccess={(filePath: string) => {
                  console.log('ROI 파일 업로드 성공:', filePath);
                  viewModel.setSelectedRoiPath(filePath);
                }}
              />
            </Box>
          </Box>
        </Box>

        {/* 설정 및 통계 패널 */}
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 3 }}>
          {/* 설정 패널 */}
          <Box sx={{ flex: '1 1 400px', minWidth: 0 }}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  테스트 설정
                </Typography>
                
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                  <TextField
                    fullWidth
                    label="Var Threshold"
                    type="number"
                    value={state.varThreshold}
                    onChange={(e) => setState(prev => ({ ...prev, varThreshold: parseFloat(e.target.value) }))}
                    helperText="배경 제거 민감도 (기본값: 50.0)"
                  />
                  <TextField
                    fullWidth
                    label="Learning Rate"
                    type="number"
                    value={state.learningRate}
                    onChange={(e) => setState(prev => ({ ...prev, learningRate: parseFloat(e.target.value) }))}
                    helperText="학습률 (기본값: 0.001)"
                  />
                  <TextField
                    fullWidth
                    label="반복 횟수"
                    type="number"
                    value={state.iterations}
                    onChange={(e) => setState(prev => ({ ...prev, iterations: parseInt(e.target.value) }))}
                    helperText="학습 반복 횟수 (기본값: 1000)"
                  />
                </Box>

                <Typography variant="body2" color="text.secondary" sx={{ mt: 2, mb: 2 }}>
                  학습 데이터, 테스트 이미지, ROI 파일을 업로드한 후 학습을 시작하세요.
                </Typography>

                <Button
                  variant="contained"
                  startIcon={state.loading ? <CircularProgress size={20} /> : <StartIcon />}
                  onClick={handleStartLearning}
                  disabled={state.loading}
                  fullWidth
                >
                  {state.loading ? '학습 중...' : '학습 시작'}
                </Button>

                {state.learningResult?.folder_path && (
                  <Button
                    variant="outlined"
                    startIcon={<ViewResultsIcon />}
                    onClick={() => {
                      console.log('버튼 클릭됨!');
                      handleViewResults();
                    }}
                    sx={{ mt: 2 }}
                    fullWidth
                  >
                    학습 결과 보기
                  </Button>
                )}
              </CardContent>
            </Card>
          </Box>

          {/* 통계 패널 */}
          <Box sx={{ flex: '1 1 400px', minWidth: 0 }}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                  <Typography variant="h6">
                    데이터 통계
                  </Typography>
                  <Button
                    startIcon={<RefreshIcon />}
                    onClick={handleRefreshStats}
                    size="small"
                    variant="outlined"
                  >
                    새로고침
                  </Button>
                </Box>
                
                <Typography variant="body2" color="text.secondary">
                  학습을 완료하면 결과를 확인할 수 있습니다.
                </Typography>
              </CardContent>
            </Card>
          </Box>
        </Box>

        {/* 오류 메시지 */}
        {state.error && (
          <Alert severity="error" sx={{ mt: 2 }}>
            {state.error}
          </Alert>
        )}

        {/* 학습 완료 메시지 */}
        {state.learningResult?.folder_path && (
          <Alert severity="success" sx={{ mt: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <SuccessIcon />
              <Typography>학습이 성공적으로 완료되었습니다.</Typography>
            </Box>
          </Alert>
        )}


      </Box>
    </Box>
  );
};

export default ParkingTestView; 