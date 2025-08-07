import React, { useState, useEffect, useMemo } from 'react';
import {
  Box,
  Typography,
  Button,
  Card,
  CardContent,
  TextField,
  Alert,
  CircularProgress,
  Paper,
} from '@mui/material';
import {
  PlayArrow as StartIcon,
  ArrowBack as BackIcon,
  CheckCircle as SuccessIcon,
  Error as ErrorIcon,
} from '@mui/icons-material';
import { Project } from '../models/Project';
import { ParkingTestViewModel, ParkingTestState } from '../viewmodels/ParkingTestViewModel';
import FileUploadView from './FileUploadView';

interface ParkingTestViewProps {
  project: Project;
  onBack: () => void;
}

const ParkingTestView: React.FC<ParkingTestViewProps> = ({ project, onBack }) => {
  const [state, setState] = useState<ParkingTestState>({
    loading: false,
    stats: null,
    varThreshold: 50.0,
    learningRate: 0.001,
    iterations: 1000,
    testResult: null,
    learningResult: null,
    error: null,
    selectedLearningPath: '',
    selectedTestPath: '',
    selectedRoiPath: '',
  });

  const viewModel = useMemo(() => new ParkingTestViewModel(project, state, setState), [project, state, setState]);

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    viewModel.loadProjectStats();
  }, []); // 빈 의존성 배열로 컴포넌트 마운트 시에만 실행

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
                onUploadSuccess={(filePath) => {
                  console.log('학습 이미지 업로드 성공:', filePath);
                  viewModel.setSelectedLearningPath(filePath);
                }}
              />
            </Box>
            <Box sx={{ flex: '1 1 400px', minWidth: 0 }}>
              <FileUploadView
                projectId={project.id}
                fileType="test"
                onUploadSuccess={(filePath) => {
                  console.log('테스트 이미지 업로드 성공:', filePath);
                  viewModel.setSelectedTestPath(filePath);
                }}
              />
            </Box>
            <Box sx={{ flex: '1 1 400px', minWidth: 0 }}>
              <FileUploadView
                projectId={project.id}
                fileType="roi"
                onUploadSuccess={(filePath) => {
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
                    value={viewModel.varThreshold}
                    onChange={(e) => viewModel.setVarThreshold(parseFloat(e.target.value))}
                    helperText="배경 제거 민감도 (기본값: 50.0)"
                  />
                  <TextField
                    fullWidth
                    label="Learning Rate"
                    type="number"
                    value={viewModel.learningRate}
                    onChange={(e) => viewModel.setLearningRate(parseFloat(e.target.value))}
                    helperText="학습률 (기본값: 0.001)"
                  />
                  <TextField
                    fullWidth
                    label="반복 횟수"
                    type="number"
                    value={viewModel.iterations}
                    onChange={(e) => viewModel.setIterations(parseInt(e.target.value))}
                    helperText="학습 반복 횟수 (기본값: 1000)"
                  />
                </Box>

                <Typography variant="body2" color="text.secondary" sx={{ mt: 2, mb: 2 }}>
                  학습 데이터, 테스트 이미지, ROI 파일을 업로드한 후 학습을 시작하세요.
                </Typography>

                <Button
                  variant="contained"
                  startIcon={viewModel.loading ? <CircularProgress size={20} /> : <StartIcon />}
                  onClick={() => viewModel.startLearning()}
                  disabled={viewModel.loading}
                  fullWidth
                  size="large"
                >
                  {viewModel.loading ? '학습 실행 중...' : '학습 시작'}
                </Button>
              </CardContent>
            </Card>
          </Box>

          {/* 통계 패널 */}
          <Box sx={{ flex: '1 1 400px', minWidth: 0 }}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  데이터 통계
                </Typography>
                
                {viewModel.stats ? (
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
                    <Box sx={{ flex: '1 1 120px', minWidth: 0 }}>
                      <Paper sx={{ p: 2, textAlign: 'center' }}>
                        <Typography variant="h4" color="primary">
                          {viewModel.stats.learning_images_count}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          학습 이미지
                        </Typography>
                      </Paper>
                    </Box>
                    <Box sx={{ flex: '1 1 120px', minWidth: 0 }}>
                      <Paper sx={{ p: 2, textAlign: 'center' }}>
                        <Typography variant="h4" color="secondary">
                          {viewModel.stats.test_images_count}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          테스트 이미지
                        </Typography>
                      </Paper>
                    </Box>
                    <Box sx={{ flex: '1 1 100%', minWidth: 0 }}>
                      <Paper sx={{ p: 2, textAlign: 'center', bgcolor: 'success.light' }}>
                        <Typography variant="h4" color="white">
                          {viewModel.stats.matched_count}
                        </Typography>
                        <Typography variant="body2" color="white">
                          매칭된 이미지
                        </Typography>
                      </Paper>
                    </Box>
                  </Box>
                ) : (
                  <CircularProgress />
                )}
              </CardContent>
            </Card>
          </Box>
        </Box>

        {/* 학습 결과 패널 */}
        {viewModel.learningResult && (
          <Box>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <SuccessIcon color="success" sx={{ mr: 1 }} />
                  <Typography variant="h6">
                    학습 완료
                  </Typography>
                </Box>
                
                <Alert severity="success" sx={{ mb: 2 }}>
                  주차 감지 학습이 성공적으로 완료되었습니다.
                </Alert>
                
                <Typography variant="body2" color="text.secondary">
                  {viewModel.learningResult.message}
                </Typography>
              </CardContent>
            </Card>
          </Box>
        )}

        {/* 테스트 결과 패널 */}
        {viewModel.testResult && (
          <Box>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <SuccessIcon color="success" sx={{ mr: 1 }} />
                  <Typography variant="h6">
                    테스트 완료
                  </Typography>
                </Box>
                
                <Alert severity="success" sx={{ mb: 2 }}>
                  주차 감지 테스트가 성공적으로 완료되었습니다.
                </Alert>
                
                <Typography variant="body2" color="text.secondary">
                  결과 파일: {viewModel.testResult.data?.result_path}
                </Typography>
              </CardContent>
            </Card>
          </Box>
        )}

        {/* 오류 패널 */}
        {viewModel.error && (
          <Box>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <ErrorIcon color="error" sx={{ mr: 1 }} />
                  <Typography variant="h6" color="error">
                    실행 실패
                  </Typography>
                </Box>
                
                <Alert severity="error">
                  {viewModel.error}
                </Alert>
              </CardContent>
            </Card>
          </Box>
        )}
      </Box>
    </Box>
  );
};

export default ParkingTestView; 