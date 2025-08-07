import React, { useState, useEffect, useMemo } from 'react';
import {
  Box,
  Button,
  Typography,
  Card,
  CardContent,
  TextField,
  Alert,
  CircularProgress,
  Chip,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Divider,
} from '@mui/material';
import {
  ArrowBack as BackIcon,
  PlayArrow as StartIcon,
  Visibility as ViewResultsIcon,
  ExpandMore as ExpandMoreIcon,
  CheckCircle as SuccessIcon,
  Refresh as RefreshIcon,
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
    learningResultsData: null,
    learningStatistics: null,
    showResults: false,
    error: null,
    selectedLearningPath: '',
    selectedTestPath: '',
    selectedRoiPath: '',
  });

  const viewModel = useMemo(() => new ParkingTestViewModel(project, state, setState), [project.id]);

  useEffect(() => {
    // 한 번만 호출
    viewModel.loadProjectStats();
  }, []); // 빈 배열로 한 번만 실행

  const handleStartLearning = async () => {
    await viewModel.startLearning(state);
    if (state.learningResult?.success) {
      await viewModel.loadLearningResults();
    }
  };

  const handleViewResults = () => {
    setState(prev => ({ ...prev, showResults: !prev.showResults }));
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

                {state.learningResult?.success && (
                  <Button
                    variant="outlined"
                    startIcon={<ViewResultsIcon />}
                    onClick={handleViewResults}
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
                
                {state.learningStatistics && (
                  <Box>
                    <Box sx={{ display: 'flex', justifyContent: 'space-around', mb: 2 }}>
                      <Box sx={{ textAlign: 'center' }}>
                        <Typography variant="h4" color="primary">
                          {state.learningStatistics.totalTests}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          테스트 이미지
                        </Typography>
                      </Box>
                      <Box sx={{ textAlign: 'center' }}>
                        <Typography variant="h4" color="secondary">
                          {state.learningStatistics.totalRois}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          ROI 체크 수
                        </Typography>
                      </Box>
                      <Box sx={{ textAlign: 'center' }}>
                        <Typography variant="h4" color="success.main">
                          {state.learningStatistics.totalVehicles}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          차량 유무 수
                        </Typography>
                      </Box>
                    </Box>

                    <Divider sx={{ my: 2 }} />

                    <Typography variant="subtitle2" gutterBottom>
                      CCTV별 상세 통계
                    </Typography>
                    <TableContainer component={Paper} variant="outlined">
                      <Table size="small">
                        <TableHead>
                          <TableRow>
                            <TableCell>CCTV ID</TableCell>
                            <TableCell align="right">ROI 수</TableCell>
                            <TableCell align="right">차량 수</TableCell>
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          {state.learningStatistics.cctvStats.map((stat) => (
                            <TableRow key={stat.cctvId}>
                              <TableCell>{stat.cctvId}</TableCell>
                              <TableCell align="right">{stat.roiCount}</TableCell>
                              <TableCell align="right">{stat.vehicleCount}</TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </TableContainer>
                  </Box>
                )}

                {!state.learningStatistics && (
                  <Typography variant="body2" color="text.secondary">
                    학습을 완료하면 통계가 표시됩니다.
                  </Typography>
                )}
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
        {state.learningResult?.success && (
          <Alert severity="success" sx={{ mt: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <SuccessIcon />
              <Typography>학습이 성공적으로 완료되었습니다.</Typography>
            </Box>
          </Alert>
        )}

        {/* 학습 결과 상세 보기 */}
        {state.showResults && state.learningResultsData && (
          <Card sx={{ mt: 3 }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                학습 결과 상세
              </Typography>
              
              {state.learningResultsData.results.map((result, index) => (
                <Accordion key={index} sx={{ mb: 1 }}>
                  <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, width: '100%' }}>
                      <Typography variant="subtitle1" sx={{ flexGrow: 1 }}>
                        {result.test_image_name}
                      </Typography>
                      <Chip 
                        label={result.cctv_id} 
                        size="small" 
                        color="primary" 
                        variant="outlined" 
                      />
                      <Typography variant="body2" color="text.secondary">
                        {result.roi_results.length}개 ROI
                      </Typography>
                    </Box>
                  </AccordionSummary>
                  <AccordionDetails>
                    <Box>
                      <Typography variant="subtitle2" gutterBottom>
                        ROI별 Foreground 비율
                      </Typography>
                      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                        {result.roi_results.map((roi, roiIndex) => (
                          <Card variant="outlined" key={roiIndex} sx={{ flex: '1 1 150px' }}>
                            <CardContent sx={{ py: 1, px: 2 }}>
                              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <Typography variant="body2">
                                  ROI {roi.roi_index}
                                </Typography>
                                <Chip 
                                  label={`${(roi.foreground_ratio * 100).toFixed(1)}%`}
                                  size="small"
                                  color={roi.foreground_ratio >= 0.4 ? 'success' : 'default'}
                                  variant={roi.foreground_ratio >= 0.4 ? 'filled' : 'outlined'}
                                />
                              </Box>
                            </CardContent>
                          </Card>
                        ))}
                      </Box>
                    </Box>
                  </AccordionDetails>
                </Accordion>
              ))}
            </CardContent>
          </Card>
        )}
      </Box>
    </Box>
  );
};

export default ParkingTestView; 