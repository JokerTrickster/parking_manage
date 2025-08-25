import React, { useState, useEffect, useRef } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  TextField,
  Button,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Alert,
  Snackbar,
  CircularProgress,
  Switch,
  FormControlLabel,
  Modal,
  IconButton
} from '@mui/material';
import { PlayArrow, Stop, ArrowBack as BackIcon, ZoomIn as ZoomInIcon, Close as CloseIcon } from '@mui/icons-material';
import { RealtimeParkingViewModel } from '../viewmodels/RealtimeParkingViewModel';
import LearningResultsView from './LearningResultsView';
import { Project } from '../models/Project';

interface RealtimeParkingViewProps {
  project: Project;
  onBack?: () => void;
}

const RealtimeParkingView: React.FC<RealtimeParkingViewProps> = ({ project, onBack }) => {
  
  
  // UI 상태
  const [isRunning, setIsRunning] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [imageSavingEnabled, setImageSavingEnabled] = useState(true); // 실시간 이미지 저장 On/Off
  
  // 실시간 설정
  const [settings, setSettings] = useState({
    learningImageFolder: '',
    roiFile: '',
    varThreshold: 50,
    learningRate: 0.001,
    iterations: 1
  });
  
  // 폴더 목록
  const [availableFolders, setAvailableFolders] = useState({
    learning: [] as string[],
    roi: [] as string[]
  });
  
  // 실시간 결과
  const [realtimeResults, setRealtimeResults] = useState<any>(null);
  const [cctvList, setCctvList] = useState<string[]>([]);
  const [selectedCctv, setSelectedCctv] = useState<string>('');
  const [selectedCctvImages, setSelectedCctvImages] = useState<any>(null);
  const [loadingCctvImages, setLoadingCctvImages] = useState(false);
  const [cctvImageError, setCctvImageError] = useState<string | null>(null);
  const [modalImage, setModalImage] = useState<{ src: string; title: string; alt: string } | null>(null);
  
  // 타이머 참조
  const batchIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const learningIntervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    loadAvailableFolders();
    
    // 컴포넌트 언마운트 시 모든 타이머 정리
    return () => {
      if (batchIntervalRef.current) {
        clearInterval(batchIntervalRef.current);
      }
      if (learningIntervalRef.current) {
        clearInterval(learningIntervalRef.current);
      }
    };
  }, [project.id]);

  const loadAvailableFolders = async () => {
    try {
      const folders = await RealtimeParkingViewModel.loadAvailableFolders(project.id);
      setAvailableFolders(folders);
    } catch (error) {
      console.error('폴더 목록 로드 실패:', error);
    }
  };

  const handleSettingChange = (field: string, value: any) => {
    setSettings(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleStartRealtime = async () => {
    try {
      setLoading(true);
      setError(null);
      setIsRunning(true);

      // 배치 이미지 저장 시작 (30초마다) - 이미지 저장이 활성화된 경우에만
      if (imageSavingEnabled) {
        batchIntervalRef.current = setInterval(async () => {
          try {
            await RealtimeParkingViewModel.batchImageDownload(project.id);
            console.log('배치 이미지 저장 완료');
          } catch (error) {
            console.error('배치 이미지 저장 실패:', error);
          }
        }, 30000); // 30초 = 30,000ms
      }

      // 실시간 학습 시작 (40초마다)
      learningIntervalRef.current = setInterval(async () => {
        try {
          const result = await RealtimeParkingViewModel.startRealtimeLearning(project.id, settings);
          setRealtimeResults(result);
          
          // CCTV 리스트 업데이트
          let targetCctv = selectedCctv;
          if (result && result.cctvs) {
            setCctvList(result.cctvs);
            // 현재 선택된 CCTV가 없거나 새로운 리스트에 없는 경우에만 첫 번째로 변경
            if (result.cctvs.length > 0 && (!selectedCctv || !result.cctvs.includes(selectedCctv))) {
              targetCctv = result.cctvs[0];
              setSelectedCctv(targetCctv);
            }
          }
          
          // 선택된 CCTV의 이미지만 업데이트 (CCTV 선택은 유지)
          if (targetCctv) {
            try {
              const images = await RealtimeParkingViewModel.getRealtimeCctvImages(project.id, targetCctv);
              setSelectedCctvImages(images);
              setCctvImageError(null);
            } catch (error: any) {
              console.error('현재 CCTV 이미지 업데이트 실패:', error);
              setCctvImageError(error.message || 'CCTV 이미지 업데이트 중 오류가 발생했습니다.');
            }
          }
          
          console.log('실시간 학습 완료:', result);
        } catch (error) {
          console.error('실시간 학습 실패:', error);
          setError('실시간 학습 중 오류가 발생했습니다.');
        }
      }, 40000); // 40초 = 40,000ms

      // 첫 번째 실행
      if (imageSavingEnabled) {
        await RealtimeParkingViewModel.batchImageDownload(project.id);
      }
      const initialResult = await RealtimeParkingViewModel.startRealtimeLearning(project.id, settings);
      setRealtimeResults(initialResult);
      
      // CCTV 리스트 설정
      if (initialResult && initialResult.cctvs) {
        setCctvList(initialResult.cctvs);
        if (initialResult.cctvs.length > 0) {
          // 현재 선택된 CCTV가 있고 리스트에 포함되어 있으면 유지, 없으면 첫 번째 CCTV 선택
          let targetCctv = selectedCctv;
          if (!selectedCctv || !initialResult.cctvs.includes(selectedCctv)) {
            targetCctv = initialResult.cctvs[0];
            setSelectedCctv(targetCctv);
          }
          
          // 선택된 CCTV의 이미지를 로드
          try {
            const images = await RealtimeParkingViewModel.getRealtimeCctvImages(project.id, targetCctv);
            setSelectedCctvImages(images);
            setCctvImageError(null);
          } catch (error: any) {
            console.error('CCTV 이미지 로드 실패:', error);
            setCctvImageError(error.message || 'CCTV 이미지 로드 중 오류가 발생했습니다.');
          }
        }
      }

    } catch (error: any) {
      setError(error.message || '실시간 주차면 시작 중 오류가 발생했습니다.');
      setIsRunning(false);
    } finally {
      setLoading(false);
    }
  };

  const handleStopRealtime = () => {
    // 모든 타이머 정리
    if (batchIntervalRef.current) {
      clearInterval(batchIntervalRef.current);
      batchIntervalRef.current = null;
    }
    if (learningIntervalRef.current) {
      clearInterval(learningIntervalRef.current);
      learningIntervalRef.current = null;
    }
    
    setIsRunning(false);
    setRealtimeResults(null);
    setCctvList([]);
    setSelectedCctv('');
    console.log('실시간 주차면 중단됨');
  };

  const handleImageSavingToggle = (enabled: boolean) => {
    setImageSavingEnabled(enabled);
    
    if (isRunning) {
      // 기존 배치 타이머 정리
      if (batchIntervalRef.current) {
        clearInterval(batchIntervalRef.current);
        batchIntervalRef.current = null;
      }
      
      // 이미지 저장이 활성화된 경우 새로운 타이머 시작
      if (enabled) {
        batchIntervalRef.current = setInterval(async () => {
          try {
            await RealtimeParkingViewModel.batchImageDownload(project.id);
            console.log('배치 이미지 저장 완료');
          } catch (error) {
            console.error('배치 이미지 저장 실패:', error);
          }
        }, 30000); // 30초마다
      }
    }
  };

  const handleCctvSelect = async (cctvId: string) => {
    setSelectedCctv(cctvId);
    setLoadingCctvImages(true);
    setCctvImageError(null);
    
    try {
      const images = await RealtimeParkingViewModel.getRealtimeCctvImages(project.id, cctvId);
      setSelectedCctvImages(images);
    } catch (error: any) {
      console.error('CCTV 이미지 로드 실패:', error);
      setSelectedCctvImages(null);
      setCctvImageError(error.message || 'CCTV 이미지 로드 중 오류가 발생했습니다.');
    } finally {
      setLoadingCctvImages(false);
    }
  };

  const handleImageClick = (src: string, title: string, alt: string) => {
    setModalImage({ src, title, alt });
  };

  const handleCloseModal = () => {
    setModalImage(null);
  };

  return (
    <Box sx={{ p: 2 }}>
      {/* 헤더 */}
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
        {onBack && (
          <Button
            startIcon={<BackIcon />}
            onClick={onBack}
            sx={{ mr: 2 }}
          >
            대시보드로
          </Button>
        )}
        <Typography variant="h4" component="h1">
          실시간 주차면
        </Typography>
      </Box>

      {/* 데이터 선택 및 실시간 설정 */}
      <Card sx={{ mb: 2 }}>
        <CardContent sx={{ pb: 2 }}>
          <Typography variant="h6" gutterBottom>
            데이터 선택 및 설정
          </Typography>
          
          {/* 데이터 선택 */}
          <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', mb: 2 }}>
            <FormControl sx={{ flex: '1 1 200px', minWidth: 200 }} disabled={isRunning}>
              <InputLabel>학습 이미지 폴더</InputLabel>
              <Select
                value={settings.learningImageFolder}
                label="학습 이미지 폴더"
                onChange={(e) => handleSettingChange('learningImageFolder', e.target.value)}
                disabled={isRunning}
              >
                {availableFolders.learning.map((folder) => (
                  <MenuItem key={folder} value={folder}>
                    {folder}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <FormControl sx={{ flex: '1 1 200px', minWidth: 200 }} disabled={isRunning}>
              <InputLabel>ROI 파일</InputLabel>
              <Select
                value={settings.roiFile}
                label="ROI 파일"
                onChange={(e) => handleSettingChange('roiFile', e.target.value)}
                disabled={isRunning}
              >
                {availableFolders.roi.map((file) => (
                  <MenuItem key={file} value={file}>
                    {file}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Box>

          {/* 실시간 설정 */}
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
            <TextField
              label="Var Threshold"
              type="number"
              value={settings.varThreshold}
              onChange={(e) => handleSettingChange('varThreshold', parseInt(e.target.value))}
              sx={{ flex: '1 1 150px', minWidth: 150 }}
              inputProps={{ min: 1, max: 1000 }}
              disabled={isRunning}
            />
            <TextField
              label="Learning Rate"
              type="number"
              value={settings.learningRate}
              onChange={(e) => handleSettingChange('learningRate', parseFloat(e.target.value))}
              sx={{ flex: '1 1 150px', minWidth: 150 }}
              inputProps={{ step: 0.0001, min: 0.001, max: 1 }}
              disabled={isRunning}
            />
            <TextField
              label="Iterations"
              type="number"
              value={settings.iterations}
              onChange={(e) => handleSettingChange('iterations', parseInt(e.target.value))}
              sx={{ flex: '1 1 150px', minWidth: 150 }}
              inputProps={{ min: 1, max: 10 }}
              disabled={isRunning}
            />
          </Box>
        </CardContent>
      </Card>

      {/* 실시간 제어 */}
      <Card sx={{ mb: 2 }}>
        <CardContent sx={{ py: 2 }}>
          <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', flexWrap: 'wrap' }}>
            {!isRunning ? (
              <Button
                variant="contained"
                startIcon={loading ? <CircularProgress size={20} /> : <PlayArrow />}
                onClick={handleStartRealtime}
                disabled={loading || !settings.learningImageFolder || !settings.roiFile}
              >
                {loading ? '시작 중...' : '실시간 영상 보기'}
              </Button>
            ) : (
              <Button
                variant="contained"
                color="error"
                startIcon={<Stop />}
                onClick={handleStopRealtime}
              >
                실시간 영상 보기 중단
              </Button>
            )}
            
            {isRunning && (
              <>
                <FormControlLabel
                  control={
                    <Switch
                      checked={imageSavingEnabled}
                      onChange={(e) => handleImageSavingToggle(e.target.checked)}
                      color="primary"
                    />
                  }
                  label="실시간 이미지 저장"
                />
                
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <CircularProgress size={16} />
                  <Typography variant="body2" color="primary">
                    실시간 모니터링 중... 
                    {imageSavingEnabled ? ' (배치: 30초마다, 학습: 40초마다)' : ' (학습: 40초마다)'}
                  </Typography>
                </Box>
              </>
            )}
          </Box>
        </CardContent>
      </Card>

      {/* 실시간 결과 */}
      {realtimeResults && cctvList.length > 0 && (
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              실시간 결과
            </Typography>
            
            <Box sx={{ display: 'flex', gap: 3, minHeight: '400px' }}>
              {/* 왼쪽: CCTV 목록 */}
              <Box sx={{ flex: '0 0 300px', borderRight: '1px solid #e0e0e0', pr: 2 }}>
                <Typography variant="subtitle1" gutterBottom>
                  CCTV 목록 ({cctvList.length}개)
                </Typography>
                <Box sx={{ maxHeight: '350px', overflowY: 'auto' }}>
                  {cctvList.map((cctvId) => (
                    <Box
                      key={cctvId}
                      sx={{
                        p: 2,
                        mb: 1,
                        border: selectedCctv === cctvId ? '2px solid #1976d2' : '1px solid #e0e0e0',
                        borderRadius: 1,
                        backgroundColor: selectedCctv === cctvId ? '#f3f8ff' : 'transparent',
                        cursor: 'pointer',
                        transition: 'all 0.2s',
                        '&:hover': {
                          backgroundColor: selectedCctv === cctvId ? '#f3f8ff' : '#f5f5f5',
                          borderColor: '#1976d2'
                        }
                      }}
                      onClick={() => handleCctvSelect(cctvId)}
                    >
                      <Typography variant="subtitle2" fontWeight="medium">
                        {cctvId}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        실시간 모니터링 중
                      </Typography>
                    </Box>
                  ))}
                </Box>
              </Box>
              
              {/* 오른쪽: 선택된 CCTV 이미지 */}
              <Box sx={{ flex: 1 }}>
                {selectedCctv ? (
                  <Box>
                    <Typography variant="h5" gutterBottom color="primary">
                      {selectedCctv}
                    </Typography>
                    
                    {loadingCctvImages ? (
                      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '300px' }}>
                        <CircularProgress size={60} />
                        <Typography variant="body1" sx={{ ml: 2 }}>
                          이미지 로딩 중...
                        </Typography>
                      </Box>
                    ) : cctvImageError ? (
                      <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', height: '300px', justifyContent: 'center' }}>
                        <Alert severity="error" sx={{ mb: 2, maxWidth: 600 }}>
                          <Typography variant="body2">
                            {cctvImageError}
                          </Typography>
                        </Alert>
                        <Button 
                          variant="outlined" 
                          onClick={() => handleCctvSelect(selectedCctv)}
                          sx={{ mt: 1 }}
                        >
                          다시 시도
                        </Button>
                      </Box>
                    ) : selectedCctvImages ? (
                                              <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                          {/* ROI 결과 이미지 */}
                          <Box sx={{ flex: '1 1 300px', minWidth: 300 }}>
                            <Typography variant="subtitle2" gutterBottom>
                              ROI 결과
                            </Typography>
                            <Box sx={{ 
                              border: '1px solid #e0e0e0', 
                              borderRadius: 1, 
                              p: 1,
                              backgroundColor: '#fafafa',
                              position: 'relative',
                              cursor: 'pointer'
                            }}
                            onClick={() => handleImageClick(
                              selectedCctvImages.roiResultImage,
                              `ROI Result - ${selectedCctv}`,
                              `${selectedCctv} - ROI 결과`
                            )}>
                              <img
                                src={selectedCctvImages.roiResultImage}
                                alt={`ROI Result - ${selectedCctv}`}
                                style={{
                                  width: '100%',
                                  height: 'auto',
                                  maxHeight: '250px',
                                  objectFit: 'contain',
                                  transition: 'opacity 0.2s'
                                }}
                                onError={(e) => {
                                  console.error(`ROI 이미지 로드 실패: ${selectedCctv}`);
                                  e.currentTarget.style.display = 'none';
                                }}
                                onMouseEnter={(e) => e.currentTarget.style.opacity = '0.8'}
                                onMouseLeave={(e) => e.currentTarget.style.opacity = '1'}
                              />
                              <ZoomInIcon 
                                sx={{ 
                                  position: 'absolute', 
                                  top: 8, 
                                  right: 8, 
                                  color: 'white', 
                                  backgroundColor: 'rgba(0,0,0,0.5)', 
                                  borderRadius: '50%', 
                                  padding: '4px',
                                  fontSize: '20px'
                                }} 
                              />
                            </Box>
                          </Box>
                          
                          {/* Foreground 마스크 이미지 */}
                          <Box sx={{ flex: '1 1 300px', minWidth: 300 }}>
                            <Typography variant="subtitle2" gutterBottom>
                              Foreground 마스크
                            </Typography>
                            <Box sx={{ 
                              border: '1px solid #e0e0e0', 
                              borderRadius: 1, 
                              p: 1,
                              backgroundColor: '#fafafa',
                              position: 'relative',
                              cursor: 'pointer'
                            }}
                            onClick={() => handleImageClick(
                              selectedCctvImages.fgMaskImage,
                              `Foreground Mask - ${selectedCctv}`,
                              `${selectedCctv} - Foreground 마스크`
                            )}>
                              <img
                                src={selectedCctvImages.fgMaskImage}
                                alt={`Foreground Mask - ${selectedCctv}`}
                                style={{
                                  width: '100%',
                                  height: 'auto',
                                  maxHeight: '250px',
                                  objectFit: 'contain',
                                  transition: 'opacity 0.2s'
                                }}
                                onError={(e) => {
                                  console.error(`Foreground 마스크 이미지 로드 실패: ${selectedCctv}`);
                                  e.currentTarget.style.display = 'none';
                                }}
                                onMouseEnter={(e) => e.currentTarget.style.opacity = '0.8'}
                                onMouseLeave={(e) => e.currentTarget.style.opacity = '1'}
                              />
                              <ZoomInIcon 
                                sx={{ 
                                  position: 'absolute', 
                                  top: 8, 
                                  right: 8, 
                                  color: 'white', 
                                  backgroundColor: 'rgba(0,0,0,0.5)', 
                                  borderRadius: '50%', 
                                  padding: '4px',
                                  fontSize: '20px'
                                }} 
                              />
                            </Box>
                          </Box>
                        </Box>
                    ) : (
                      <Box sx={{ 
                        display: 'flex', 
                        justifyContent: 'center', 
                        alignItems: 'center', 
                        height: '300px',
                        border: '1px dashed #e0e0e0',
                        borderRadius: 1
                      }}>
                        <Typography variant="body1" color="text.secondary">
                          이미지를 선택하면 여기에 표시됩니다
                        </Typography>
                      </Box>
                    )}
                  </Box>
                ) : (
                  <Box sx={{ 
                    display: 'flex', 
                    justifyContent: 'center', 
                    alignItems: 'center', 
                    height: '350px',
                    border: '1px dashed #e0e0e0',
                    borderRadius: 1
                  }}>
                    <Typography variant="body1" color="text.secondary">
                      왼쪽에서 CCTV를 선택하세요
                    </Typography>
                  </Box>
                )}
              </Box>
            </Box>
          </CardContent>
        </Card>
      )}

      <Snackbar
        open={!!error}
        autoHideDuration={6000}
        onClose={() => setError(null)}
      >
        <Alert onClose={() => setError(null)} severity="error" sx={{ width: '100%' }}>
          {error}
        </Alert>
      </Snackbar>

      {/* 이미지 확대 Modal */}
      <Modal
        open={!!modalImage}
        onClose={handleCloseModal}
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Box
          sx={{
            position: 'relative',
            maxWidth: '90vw',
            maxHeight: '90vh',
            bgcolor: 'background.paper',
            boxShadow: 24,
            borderRadius: 2,
            outline: 'none',
          }}
        >
          {modalImage && (
            <>
              <Box sx={{ p: 2, borderBottom: '1px solid #e0e0e0' }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Typography variant="h6" component="h2">
                    {modalImage.title}
                  </Typography>
                  <IconButton onClick={handleCloseModal} size="small">
                    <CloseIcon />
                  </IconButton>
                </Box>
              </Box>
              <Box sx={{ p: 2, display: 'flex', justifyContent: 'center' }}>
                <img
                  src={modalImage.src}
                  alt={modalImage.alt}
                  style={{
                    maxWidth: '100%',
                    maxHeight: '70vh',
                    objectFit: 'contain',
                  }}
                />
              </Box>
            </>
          )}
        </Box>
      </Modal>
    </Box>
  );
};

export default RealtimeParkingView;
