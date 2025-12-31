import React, { useState, useEffect, useRef, useContext } from 'react';
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
  IconButton,
  useMediaQuery,
  useTheme,
  Collapse,
  Container,
  Tabs,
  Tab,
  Badge,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Grid,
  Paper,
  alpha,
  AppBar,
  Toolbar,
  List,
  ListItemButton,
  ListItemText,
  ListItemIcon,
  Divider
} from '@mui/material';
import {
  PlayArrow,
  Stop,
  ArrowBack as BackIcon,
  ZoomIn as ZoomInIcon,
  Close as CloseIcon,
  ExpandMore as ExpandMoreIcon,
  Settings as SettingsIcon,
  Videocam as VideocamIcon,
  Image as ImageIcon,
  Refresh as RefreshIcon,
  Fullscreen as FullscreenIcon,
  ViewList as ViewListIcon,
  Circle as CircleIcon,
  LightMode as LightModeIcon,
  DarkMode as DarkModeIcon,
  Dashboard as DashboardIcon,
  LiveTv as LiveTvIcon
} from '@mui/icons-material';
import { RealtimeParkingViewModel } from '../viewmodels/RealtimeParkingViewModel';
import LearningResultsView from './LearningResultsView';
import { Project } from '../models/Project';
import { touchFriendly, responsiveSpacing, responsiveGrid } from '../styles/responsive';
import { CctvTemplate, CctvConfig } from '../models/CctvTemplate';
import { ThemeContext } from '../App';
import { GRADIENTS, SHADOWS } from '../styles/theme';
import { useNavigate } from 'react-router-dom';
import '../index.css';

interface RealtimeParkingViewProps {
  project: Project;
  onBack?: () => void;
}

const RealtimeParkingView: React.FC<RealtimeParkingViewProps> = ({ project, onBack }) => {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';
  const { mode, toggleTheme } = useContext(ThemeContext);
  const navigate = useNavigate();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const isSmallMobile = useMediaQuery(theme.breakpoints.down('sm'));

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
  const [imageUpdateKey, setImageUpdateKey] = useState(0); // 이미지 강제 업데이트를 위한 키
  const [modalImage, setModalImage] = useState<{ src: string; title: string; alt: string } | null>(null);

  // 템플릿 기반 CCTV
  const [cctvTemplate, setCctvTemplate] = useState<CctvTemplate | null>(null);
  const [templateBasedMode, setTemplateBasedMode] = useState(false);
  const [selectedImageType, setSelectedImageType] = useState<string>('roi_result');

  // 자동 새로고침 타이머
  const [remainingTime, setRemainingTime] = useState(60); // 60초

  // Mobile UI states
  const [settingsExpanded, setSettingsExpanded] = useState(!isMobile);
  const [activeTab, setActiveTab] = useState(0);
  const [settingsDialogOpen, setSettingsDialogOpen] = useState(false);
  const [cctvDialogOpen, setCctvDialogOpen] = useState(false);

  // 타이머 참조
  const batchIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const learningIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const imageRefreshIntervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    loadAvailableFolders();
    loadCctvTemplate();

    // 컴포넌트 언마운트 시 모든 타이머 정리
    return () => {
      if (batchIntervalRef.current) {
        clearInterval(batchIntervalRef.current);
      }
      if (learningIntervalRef.current) {
        clearInterval(learningIntervalRef.current);
      }
      if (imageRefreshIntervalRef.current) {
        clearInterval(imageRefreshIntervalRef.current);
      }
    };
  }, [project.id]);

  const loadCctvTemplate = async () => {
    try {
      const template = RealtimeParkingViewModel.getCctvTemplate(project.id);
      if (template) {
        setCctvTemplate(template);
        setTemplateBasedMode(true);
        console.log('CCTV 템플릿 로드 완료:', template);

        // 첫 번째 CCTV 자동 선택
        if (template.cctvList.length > 0) {
          const firstCctv = template.cctvList[0].cctvId;
          setSelectedCctv(firstCctv);

          // 첫 번째 CCTV 이미지 URL 생성 (JSON에서 바로 읽음)
          try {
            const images = RealtimeParkingViewModel.getTemplateBasedCctvImages(project.id, firstCctv);
            setSelectedCctvImages(images);
            setImageUpdateKey(prev => prev + 1);
            setCctvImageError(null);
          } catch (error: any) {
            console.error('첫 번째 CCTV 이미지 로드 실패:', error);
            setCctvImageError(error.message || 'CCTV 이미지 로드 중 오류가 발생했습니다.');
          }
        }
      } else {
        console.warn(`프로젝트 "${project.id}"의 CCTV 템플릿이 없습니다.`);
        setTemplateBasedMode(false);
      }
    } catch (error) {
      console.error('CCTV 템플릿 로드 실패:', error);
      setTemplateBasedMode(false);
    }
  };

  // 템플릿 모드에서 선택된 CCTV 이미지 1분마다 자동 새로고침
  useEffect(() => {
    if (templateBasedMode && selectedCctv && cctvTemplate) {
      // 초기 이미지 로드
      const refreshImages = () => {
        try {
          const images = RealtimeParkingViewModel.getTemplateBasedCctvImages(project.id, selectedCctv);
          setSelectedCctvImages(images);
          setImageUpdateKey(prev => prev + 1);
          setCctvImageError(null);
          setRemainingTime(60); // 타이머 리셋
          console.log('이미지 새로고침:', selectedCctv);
        } catch (error: any) {
          console.error('이미지 새로고침 실패:', error);
          setCctvImageError(error.message || 'CCTV 이미지 로드 중 오류가 발생했습니다.');
        }
      };

      // 1분(60초)마다 이미지 새로고침
      imageRefreshIntervalRef.current = setInterval(refreshImages, 60000);

      // 1초마다 남은 시간 업데이트
      const countdownInterval = setInterval(() => {
        setRemainingTime(prev => {
          if (prev <= 1) {
            return 60;
          }
          return prev - 1;
        });
      }, 1000);

      return () => {
        if (imageRefreshIntervalRef.current) {
          clearInterval(imageRefreshIntervalRef.current);
        }
        clearInterval(countdownInterval);
      };
    }
  }, [templateBasedMode, selectedCctv, cctvTemplate, project.id]);

  // selectedCctv가 변경될 때마다 이미지 업데이트 (API 기반 모드)
  useEffect(() => {
    if (selectedCctv && isRunning && !templateBasedMode) {
      const updateCctvImages = async () => {
        try {
          const images = await RealtimeParkingViewModel.getRealtimeCctvImages(project.id, selectedCctv);
          setSelectedCctvImages(images);
          setImageUpdateKey(prev => prev + 1);
          setCctvImageError(null);
        } catch (error: any) {
          console.error('CCTV 이미지 업데이트 실패:', error);
          setCctvImageError(error.message || 'CCTV 이미지 업데이트 중 오류가 발생했습니다.');
        }
      };

      updateCctvImages();
    }
  }, [selectedCctv, isRunning, templateBasedMode, project.id]);

  // 실시간 학습 완료 후 이미지 업데이트를 위한 상태
  const [lastLearningTime, setLastLearningTime] = useState<number>(0);

  // 실시간 학습 완료 후 이미지 업데이트
  useEffect(() => {
    if (selectedCctv && isRunning && lastLearningTime > 0) {
      const updateCctvImages = async () => {
        try {
          const images = await RealtimeParkingViewModel.getRealtimeCctvImages(project.id, selectedCctv);
          setSelectedCctvImages(images);
          setImageUpdateKey(prev => prev + 1);
          setCctvImageError(null);
        } catch (error: any) {
          console.error('실시간 학습 후 CCTV 이미지 업데이트 실패:', error);
          setCctvImageError(error.message || 'CCTV 이미지 업데이트 중 오류가 발생했습니다.');
        }
      };
      
      updateCctvImages();
    }
  }, [lastLearningTime, selectedCctv, isRunning, project.id]);

  // Modal 이미지 실시간 업데이트
  useEffect(() => {
    if (modalImage && selectedCctvImages) {
      // Modal이 열려있을 때 현재 선택된 CCTV의 이미지로 Modal 이미지 업데이트
      if (modalImage.title.includes('ROI Result')) {
        setModalImage(prev => prev ? {
          ...prev,
          src: selectedCctvImages.roiResultImage
        } : null);
      } else if (modalImage.title.includes('Foreground Mask')) {
        setModalImage(prev => prev ? {
          ...prev,
          src: selectedCctvImages.fgMaskImage
        } : null);
      }
    }
  }, [selectedCctvImages, modalImage]);

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

      // 템플릿 기반 모드: 템플릿에서 CCTV 목록 가져오기
      if (templateBasedMode && cctvTemplate) {
        const templateCctvs = cctvTemplate.cctvList.map(cctv => cctv.cctvId);
        setCctvList(templateCctvs);
        if (templateCctvs.length > 0 && !selectedCctv) {
          setSelectedCctv(templateCctvs[0]);
          // 첫 번째 CCTV 이미지 로드
          await handleCctvSelect(templateCctvs[0]);
        }
        console.log('템플릿 기반 CCTV 목록 로드:', templateCctvs);
      } else {
        // 기존 API 기반 모드
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

            // CCTV 리스트 업데이트 (선택된 CCTV는 유지)
            if (result && result.cctvs) {
              setCctvList(result.cctvs);
              // 현재 선택된 CCTV가 새로운 리스트에 없는 경우에만 첫 번째로 변경
              if (result.cctvs.length > 0 && selectedCctv && !result.cctvs.includes(selectedCctv)) {
                setSelectedCctv(result.cctvs[0]);
              }
            }

            // 실시간 학습 완료 시간 업데이트 (이미지 업데이트 트리거)
            setLastLearningTime(Date.now());

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
        setLastLearningTime(Date.now()); // 초기 실행 완료 시간 설정

        // CCTV 리스트 설정 (초기 실행 시에만 첫 번째 CCTV 선택)
        if (initialResult && initialResult.cctvs) {
          setCctvList(initialResult.cctvs);
          if (initialResult.cctvs.length > 0 && !selectedCctv) {
            // 초기 실행 시에만 첫 번째 CCTV 선택
            setSelectedCctv(initialResult.cctvs[0]);
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

  const handleCctvSelect = (cctvId: string) => {
    setSelectedCctv(cctvId);
    setRemainingTime(60); // 새로운 CCTV 선택 시 타이머 리셋

    // 템플릿 기반 모드에서는 JSON에서 바로 URL 생성
    if (templateBasedMode && cctvTemplate) {
      try {
        const images = RealtimeParkingViewModel.getTemplateBasedCctvImages(project.id, cctvId);
        setSelectedCctvImages(images);
        setImageUpdateKey(prev => prev + 1);
        setCctvImageError(null);
      } catch (error: any) {
        console.error('템플릿 기반 CCTV 이미지 로드 실패:', error);
        setCctvImageError(error.message || 'CCTV 이미지 로드 중 오류가 발생했습니다.');
      }
    }
    // 기존 API 기반 모드는 useEffect에서 자동으로 이미지 업데이트됨
  };

  const handleManualRefresh = () => {
    if (templateBasedMode && cctvTemplate && selectedCctv) {
      try {
        const images = RealtimeParkingViewModel.getTemplateBasedCctvImages(project.id, selectedCctv);
        setSelectedCctvImages(images);
        setImageUpdateKey(prev => prev + 1);
        setCctvImageError(null);
        setRemainingTime(60); // 타이머 리셋
        console.log('수동 새로고침:', selectedCctv);
      } catch (error: any) {
        console.error('수동 새로고침 실패:', error);
        setCctvImageError(error.message || 'CCTV 이미지 로드 중 오류가 발생했습니다.');
      }
    }
  };

  const handleImageClick = (src: string, title: string, alt: string) => {
    setModalImage({ src, title, alt });
  };

  const handleCloseModal = () => {
    setModalImage(null);
  };



  return (
    <Box sx={{ minHeight: '100vh', bgcolor: 'background.default', pb: 4 }}>
      {/* Header */}
      <AppBar
        position="sticky"
        className="glass-medium"
        sx={{
          bgcolor: isDark ? alpha(theme.palette.background.paper, 0.8) : alpha(theme.palette.background.paper, 0.95),
          borderBottom: '1px solid',
          borderColor: 'divider',
          backdropFilter: 'blur(10px)'
        }}
        elevation={0}
      >
        <Toolbar>
          <IconButton
            edge="start"
            onClick={() => navigate(`/project/${project.id}`)}
            sx={{
              mr: 2,
              color: 'text.secondary',
              '&:hover': {
                color: 'primary.main',
                bgcolor: alpha(theme.palette.primary.main, 0.1)
              }
            }}
          >
            <BackIcon />
          </IconButton>

          <LiveTvIcon sx={{ mr: 1, color: 'primary.main' }} />

          <Typography variant="h6" sx={{
            flexGrow: 1,
            color: 'text.primary',
            fontWeight: 600,
            letterSpacing: '-0.01em',
            fontSize: { xs: '1.1rem', sm: '1.25rem' }
          }}>
            실시간 주차 관제
          </Typography>

          {isRunning && (
            <Chip
              label="LIVE"
              size="small"
              icon={<CircleIcon sx={{ fontSize: '0.7rem' }} />}
              className="status-badge status-success animate-pulse-glow"
              sx={{ mr: 2 }}
            />
          )}

          <IconButton
            onClick={toggleTheme}
            size="small"
            sx={{
              color: 'text.secondary',
              '&:hover': {
                color: 'primary.main',
                bgcolor: alpha(theme.palette.primary.main, 0.1)
              }
            }}
          >
            {mode === 'dark' ? <LightModeIcon /> : <DarkModeIcon />}
          </IconButton>

          {/* Mobile control buttons */}
          {isMobile && (
            <Box sx={{ display: 'flex', gap: 1, ml: 1 }}>
              <IconButton
                onClick={() => setSettingsDialogOpen(true)}
                sx={{
                  ...touchFriendly.iconButton,
                  color: 'text.secondary'
                }}
                disabled={isRunning}
              >
                <SettingsIcon />
              </IconButton>
              {isRunning && cctvList.length > 0 && (
                <Badge badgeContent={cctvList.length} color="primary">
                  <IconButton
                    onClick={() => setCctvDialogOpen(true)}
                    sx={{
                      ...touchFriendly.iconButton,
                      color: 'text.secondary'
                    }}
                  >
                    <VideocamIcon />
                  </IconButton>
                </Badge>
              )}
            </Box>
          )}
        </Toolbar>
      </AppBar>

      <Container maxWidth="xl" sx={{ ...responsiveSpacing.pagePadding }}>

        {/* 데이터 선택 및 실시간 설정 - Desktop only, 템플릿 모드가 아닐 때만 표시 */}
        {!isMobile && !templateBasedMode && (
          <Paper
            elevation={0}
            className="glass-medium animate-fade-in"
            sx={{
              mb: 3,
              mt: 3,
              borderRadius: 2,
              border: `1px solid ${isDark ? 'rgba(255, 255, 255, 0.06)' : 'rgba(0, 0, 0, 0.06)'}`,
              boxShadow: isDark ? SHADOWS.dark.sm : SHADOWS.light.sm,
              overflow: 'hidden'
            }}
          >
            <Box sx={{
              p: 2.5,
              borderBottom: settingsExpanded ? '1px solid' : 'none',
              borderColor: 'divider',
              display: 'flex',
              alignItems: 'center',
              bgcolor: isDark ? alpha(theme.palette.primary.main, 0.05) : alpha(theme.palette.primary.main, 0.02)
            }}>
              <SettingsIcon sx={{ mr: 1.5, color: 'primary.main' }} />
              <Typography variant="h6" sx={{
                flexGrow: 1,
                fontSize: { xs: '1rem', sm: '1.25rem' },
                fontWeight: 700,
                color: 'text.primary',
                letterSpacing: '-0.01em'
              }}>
                데이터 선택 및 설정
              </Typography>
              <IconButton
                onClick={() => setSettingsExpanded(!settingsExpanded)}
                sx={{
                  ...touchFriendly.iconButton,
                  color: 'text.secondary',
                  '&:hover': {
                    color: 'primary.main',
                    bgcolor: alpha(theme.palette.primary.main, 0.1)
                  }
                }}
              >
                <ExpandMoreIcon
                  sx={{
                    transform: settingsExpanded ? 'rotate(180deg)' : 'rotate(0deg)',
                    transition: 'transform 0.3s'
                  }}
                />
              </IconButton>
            </Box>

            <Collapse in={settingsExpanded}>
              <Box sx={{ p: 2.5 }}>
              {/* 데이터 선택 */}
              <Box sx={{
                display: 'grid',
                gap: { xs: 2, sm: 3 },
                gridTemplateColumns: {
                  xs: '1fr',
                  sm: 'repeat(2, 1fr)'
                },
                mb: 3
              }}>
                <FormControl fullWidth size={isMobile ? "small" : "medium"} disabled={isRunning}>
                  <InputLabel>학습 이미지 폴더</InputLabel>
                  <Select
                    value={settings.learningImageFolder}
                    label="학습 이미지 폴더"
                    onChange={(e) => handleSettingChange('learningImageFolder', e.target.value)}
                    disabled={isRunning}
                    sx={{ minHeight: { xs: 44, sm: 56 } }}
                  >
                    {availableFolders.learning.map((folder) => (
                      <MenuItem key={folder} value={folder}>
                        {folder}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>

                <FormControl fullWidth size={isMobile ? "small" : "medium"} disabled={isRunning}>
                  <InputLabel>ROI 파일</InputLabel>
                  <Select
                    value={settings.roiFile}
                    label="ROI 파일"
                    onChange={(e) => handleSettingChange('roiFile', e.target.value)}
                    disabled={isRunning}
                    sx={{ minHeight: { xs: 44, sm: 56 } }}
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
              <Box sx={{
                display: 'grid',
                gap: { xs: 2, sm: 3 },
                gridTemplateColumns: {
                  xs: '1fr',
                  sm: 'repeat(2, 1fr)',
                  md: 'repeat(3, 1fr)'
                }
              }}>
                <TextField
                  label="Var Threshold"
                  type="number"
                  value={settings.varThreshold}
                  onChange={(e) => handleSettingChange('varThreshold', parseInt(e.target.value))}
                  fullWidth
                  size={isMobile ? "small" : "medium"}
                  inputProps={{ min: 1, max: 1000 }}
                  disabled={isRunning}
                  sx={{ minHeight: { xs: 44, sm: 56 } }}
                />
                <TextField
                  label="Learning Rate"
                  type="number"
                  value={settings.learningRate}
                  onChange={(e) => handleSettingChange('learningRate', parseFloat(e.target.value))}
                  fullWidth
                  size={isMobile ? "small" : "medium"}
                  inputProps={{ step: 0.0001, min: 0.001, max: 1 }}
                  disabled={isRunning}
                  sx={{ minHeight: { xs: 44, sm: 56 } }}
                />
                <TextField
                  label="Iterations"
                  type="number"
                  value={settings.iterations}
                  onChange={(e) => handleSettingChange('iterations', parseInt(e.target.value))}
                  fullWidth
                  size={isMobile ? "small" : "medium"}
                  inputProps={{ min: 1, max: 10 }}
                  disabled={isRunning}
                  sx={{ minHeight: { xs: 44, sm: 56 } }}
                />
              </Box>
              </Box>
            </Collapse>
        </Paper>
      )}

      {/* 템플릿 모드가 아닐 때만 실시간 제어 버튼 표시 */}
      {!templateBasedMode && (
        <Card sx={{ mb: 2 }}>
          <CardContent sx={{ ...responsiveSpacing.cardPadding }}>
            <Box sx={{
              display: 'flex',
              flexDirection: { xs: 'column', sm: 'row' },
              gap: { xs: 2, sm: 3 },
              alignItems: { xs: 'stretch', sm: 'center' }
            }}>
              {!isRunning ? (
                <Button
                  variant="contained"
                  startIcon={loading ? <CircularProgress size={20} /> : <PlayArrow />}
                  onClick={handleStartRealtime}
                  disabled={loading || (!settings.learningImageFolder || !settings.roiFile)}
                  fullWidth={isMobile}
                  sx={{
                    ...touchFriendly.button,
                    fontSize: { xs: '1rem', sm: '1.125rem' },
                    py: { xs: 2, sm: 1.5 }
                  }}
                >
                  {loading ? '시작 중...' : isMobile ? '실시간 모니터링 시작' : '실시간 영상 보기'}
                </Button>
              ) : (
                <Button
                  variant="contained"
                  color="error"
                  startIcon={<Stop />}
                  onClick={handleStopRealtime}
                  fullWidth={isMobile}
                  sx={{
                    ...touchFriendly.button,
                    fontSize: { xs: '1rem', sm: '1.125rem' },
                    py: { xs: 2, sm: 1.5 }
                  }}
                >
                  {isMobile ? '모니터링 중단' : '실시간 영상 보기 중단'}
                </Button>
              )}
            
            {isRunning && (
              <Box sx={{
                display: 'flex',
                flexDirection: { xs: 'column', sm: 'row' },
                gap: { xs: 2, sm: 3 },
                alignItems: { xs: 'stretch', sm: 'center' },
                width: { xs: '100%', sm: 'auto' }
              }}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={imageSavingEnabled}
                      onChange={(e) => handleImageSavingToggle(e.target.checked)}
                      color="primary"
                    />
                  }
                  label="실시간 이미지 저장"
                  sx={{
                    fontSize: { xs: '0.875rem', sm: '1rem' },
                    '& .MuiFormControlLabel-label': {
                      fontSize: { xs: '0.875rem', sm: '1rem' }
                    }
                  }}
                />

                <Box sx={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 1,
                  justifyContent: { xs: 'center', sm: 'flex-start' },
                  p: { xs: 1, sm: 0 },
                  borderRadius: { xs: 1, sm: 0 },
                  bgcolor: { xs: 'primary.light', sm: 'transparent' },
                  backgroundOpacity: { xs: 0.05, sm: 1 }
                }}>
                  <CircularProgress size={isMobile ? 20 : 16} />
                  <Typography variant="body2" color="primary" sx={{
                    fontSize: { xs: '0.875rem', sm: '1rem' },
                    textAlign: { xs: 'center', sm: 'left' }
                  }}>
                    {isMobile
                      ? '모니터링 중...'
                      : `실시간 모니터링 중... ${imageSavingEnabled ? '(배치: 30초마다, 학습: 40초마다)' : '(학습: 40초마다)'}`
                    }
                  </Typography>
                </Box>

                {isMobile && (
                  <Typography variant="caption" color="text.secondary" sx={{
                    textAlign: 'center',
                    fontSize: '0.75rem'
                  }}>
                    {imageSavingEnabled ? '배치 저장: 30초 | 학습: 40초' : '학습 주기: 40초'}
                  </Typography>
                )}
              </Box>
            )}
          </Box>
        </CardContent>
      </Card>
      )}

      {/* 템플릿 모드: 왼쪽 사이드 패널 + 이미지 표시 */}
      {templateBasedMode && cctvTemplate && (
        <Card>
          <CardContent sx={{ ...responsiveSpacing.cardPadding, p: 0 }}>
            <Box sx={{ display: 'flex', height: '800px' }}>
              {/* 왼쪽 사이드 패널: CCTV 목록 */}
              <Box sx={{
                width: '250px',
                borderRight: '1px solid #e0e0e0',
                overflowY: 'auto',
                backgroundColor: '#fafafa',
                maxHeight: '800px'
              }}>
                <Box sx={{ p: 2, borderBottom: '1px solid #e0e0e0', backgroundColor: '#fff', position: 'sticky', top: 0, zIndex: 1 }}>
                  <Typography variant="h6" sx={{ fontWeight: 600 }}>
                    CCTV 목록
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {cctvTemplate.cctvList.length}개 카메라
                  </Typography>
                </Box>

                <Box sx={{ p: 1 }}>
                  {cctvTemplate.cctvList.map((cctv) => (
                    <Box
                      key={cctv.cctvId}
                      onClick={() => handleCctvSelect(cctv.cctvId)}
                      sx={{
                        p: 1,
                        mb: 0.5,
                        borderRadius: 1,
                        cursor: 'pointer',
                        backgroundColor: selectedCctv === cctv.cctvId ? theme.palette.primary.main : 'transparent',
                        color: selectedCctv === cctv.cctvId ? '#fff' : 'text.primary',
                        transition: 'all 0.2s',
                        '&:hover': {
                          backgroundColor: selectedCctv === cctv.cctvId ? theme.palette.primary.dark : alpha(theme.palette.primary.main, 0.08),
                        }
                      }}
                    >
                      <Typography variant="body2" sx={{ fontWeight: 500, fontSize: '0.875rem', color: 'inherit' }}>
                        {cctv.cctvId}
                      </Typography>
                    </Box>
                  ))}
                </Box>
              </Box>

              {/* 오른쪽: 선택된 CCTV 이미지 표시 */}
              <Box sx={{ flex: 1, p: 3 }}>
                {selectedCctv && selectedCctvImages && (
                  <Box>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                      <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                        {cctvTemplate.cctvList.find(c => c.cctvId === selectedCctv)?.displayName}
                      </Typography>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                        <Chip
                          icon={<RefreshIcon sx={{ fontSize: '1rem' }} />}
                          label={`${remainingTime}초 후 새로고침`}
                          size="small"
                          color="primary"
                          variant="outlined"
                        />
                        <Button
                          variant="outlined"
                          size="small"
                          startIcon={<RefreshIcon />}
                          onClick={handleManualRefresh}
                          sx={{ minWidth: '100px' }}
                        >
                          새로고침
                        </Button>
                      </Box>
                    </Box>

                    {loadingCctvImages ? (
                      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '400px' }}>
                        <CircularProgress size={60} />
                      </Box>
                    ) : cctvImageError ? (
                      <Alert severity="error">{cctvImageError}</Alert>
                    ) : (
                      <Box sx={{
                        display: 'grid',
                        gap: 3,
                        gridTemplateColumns: {
                          xs: '1fr',
                          md: 'repeat(2, 1fr)'
                        }
                      }}>
                        {cctvTemplate.cctvList
                          .find(c => c.cctvId === selectedCctv)
                          ?.images.map((imageConfig) => (
                            <Box key={imageConfig.type}>
                              <Typography variant="subtitle2" gutterBottom sx={{ fontWeight: 600, mb: 1 }}>
                                {imageConfig.displayName}
                              </Typography>
                              <Box
                                sx={{
                                  border: '2px solid #e0e0e0',
                                  borderRadius: 2,
                                  overflow: 'hidden',
                                  backgroundColor: '#000',
                                  cursor: 'pointer',
                                  transition: 'all 0.3s',
                                  '&:hover': {
                                    borderColor: '#1976d2',
                                    boxShadow: '0 4px 12px rgba(0,0,0,0.15)'
                                  }
                                }}
                                onClick={() => selectedCctvImages[imageConfig.type] && handleImageClick(
                                  selectedCctvImages[imageConfig.type],
                                  `${imageConfig.displayName} - ${selectedCctv}`,
                                  `${selectedCctv} - ${imageConfig.type}`
                                )}
                              >
                                {selectedCctvImages[imageConfig.type] ? (
                                  <img
                                    key={`${imageConfig.type}-${imageUpdateKey}`}
                                    src={selectedCctvImages[imageConfig.type]}
                                    alt={`${imageConfig.type} - ${selectedCctv}`}
                                    style={{
                                      width: '100%',
                                      height: 'auto',
                                      display: 'block'
                                    }}
                                    onError={(e) => {
                                      console.error(`이미지 로드 실패: ${selectedCctv} - ${imageConfig.type}`, e.currentTarget.src);
                                    }}
                                  />
                                ) : (
                                  <Box sx={{
                                    height: '400px',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    backgroundColor: '#f5f5f5'
                                  }}>
                                    <Typography variant="body2" color="text.secondary">
                                      이미지를 불러올 수 없습니다.
                                    </Typography>
                                  </Box>
                                )}
                              </Box>
                            </Box>
                          ))
                        }
                      </Box>
                    )}
                  </Box>
                )}
              </Box>
            </Box>
          </CardContent>
        </Card>
      )}

      {/* 기존 API 기반 실시간 결과 */}
      {!templateBasedMode && realtimeResults && cctvList.length > 0 && (
        <Card>
          <CardContent sx={{ ...responsiveSpacing.cardPadding }}>
            <Box sx={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              mb: 2
            }}>
              <Typography variant="h6">
                실시간 결과
              </Typography>
              {isMobile && (
                <Button
                  variant="outlined"
                  size="small"
                  onClick={() => setCctvDialogOpen(true)}
                  startIcon={<ViewListIcon />}
                  sx={{
                    ...touchFriendly.button,
                    fontSize: '0.875rem'
                  }}
                >
                  CCTV 선택
                </Button>
              )}
            </Box>

            <Box sx={{
              display: 'flex',
              flexDirection: { xs: 'column', lg: 'row' },
              gap: { xs: 2, lg: 3 },
              minHeight: { xs: 'auto', lg: '400px' }
            }}>
              {/* 데스크톱: CCTV 목록 */}
              {!isMobile && (
                <Box sx={{ flex: '0 0 250px', borderRight: `1px solid ${theme.palette.divider}`, pr: 2 }}>
                  <Typography variant="subtitle1" gutterBottom>
                    CCTV 목록 ({cctvList.length}개)
                  </Typography>
                  <Box sx={{ maxHeight: '450px', overflowY: 'auto' }}>
                    {cctvList.map((cctvId) => {
                      const cctvConfig = templateBasedMode && cctvTemplate
                        ? cctvTemplate.cctvList.find(c => c.cctvId === cctvId)
                        : null;

                      return (
                        <Box
                          key={cctvId}
                          sx={{
                            p: 1,
                            mb: 0.5,
                            border: selectedCctv === cctvId ? `2px solid ${theme.palette.primary.main}` : `1px solid ${theme.palette.divider}`,
                            borderRadius: 1,
                            backgroundColor: selectedCctv === cctvId ? alpha(theme.palette.primary.main, 0.08) : 'transparent',
                            cursor: 'pointer',
                            transition: 'all 0.2s',
                            '&:hover': {
                              backgroundColor: selectedCctv === cctvId ? alpha(theme.palette.primary.main, 0.12) : alpha(theme.palette.action.hover, 0.08),
                              borderColor: theme.palette.primary.main
                            }
                          }}
                          onClick={() => handleCctvSelect(cctvId)}
                        >
                          <Typography variant="body2" fontWeight="medium" sx={{ fontSize: '0.875rem', color: 'text.primary' }}>
                            {cctvId}
                          </Typography>
                        </Box>
                      );
                    })}
                  </Box>
                </Box>
              )}

              {/* 선택된 CCTV 이미지 */}
              <Box sx={{ flex: 1, minWidth: 0 }}>
                {selectedCctv ? (
                  <Box>
                    <Box sx={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      mb: { xs: 2, sm: 3 },
                      flexWrap: 'wrap',
                      gap: 1
                    }}>
                      <Box>
                        <Typography
                          variant={isMobile ? "h6" : "h5"}
                          color="primary"
                          sx={{ fontSize: { xs: '1.125rem', sm: '1.5rem' } }}
                        >
                          {templateBasedMode && cctvTemplate
                            ? cctvTemplate.cctvList.find(c => c.cctvId === selectedCctv)?.displayName || selectedCctv
                            : selectedCctv
                          }
                        </Typography>
                        {templateBasedMode && cctvTemplate && (
                          <Typography variant="caption" color="text.secondary">
                            {cctvTemplate.cctvList.find(c => c.cctvId === selectedCctv)?.description}
                          </Typography>
                        )}
                      </Box>
                      {isMobile && (
                        <Chip
                          label={templateBasedMode ? "템플릿" : "실시간"}
                          color={templateBasedMode ? "primary" : "success"}
                          variant="outlined"
                          size="small"
                          icon={<CircleIcon sx={{ fontSize: 12 }} />}
                        />
                      )}
                    </Box>

                    
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
                      templateBasedMode ? (
                        /* 템플릿 기반 모드: 2개 이미지를 나란히 표시 */
                        <Box sx={{
                          display: 'grid',
                          gap: { xs: 2, sm: 3 },
                          gridTemplateColumns: {
                            xs: '1fr',
                            md: 'repeat(2, 1fr)'
                          }
                        }}>
                          {cctvTemplate?.cctvList
                            .find(c => c.cctvId === selectedCctv)
                            ?.images.map((imageConfig) => (
                              <Box key={imageConfig.type}>
                                <Typography variant="subtitle2" gutterBottom sx={{
                                  fontSize: { xs: '0.875rem', sm: '1rem' },
                                  fontWeight: 600
                                }}>
                                  {imageConfig.displayName}
                                </Typography>
                                <Box sx={{
                                  border: '1px solid #e0e0e0',
                                  borderRadius: 1,
                                  p: 1,
                                  backgroundColor: '#fafafa',
                                  position: 'relative',
                                  cursor: 'pointer'
                                }}
                                onClick={() => selectedCctvImages[imageConfig.type] && handleImageClick(
                                  selectedCctvImages[imageConfig.type],
                                  `${imageConfig.displayName} - ${selectedCctv}`,
                                  `${selectedCctv} - ${imageConfig.type}`
                                )}>
                                  {selectedCctvImages[imageConfig.type] ? (
                                    <>
                                      <img
                                        key={`${imageConfig.type}-${imageUpdateKey}`}
                                        src={selectedCctvImages[imageConfig.type]}
                                        alt={`${imageConfig.type} - ${selectedCctv}`}
                                        style={{
                                          width: '100%',
                                          height: 'auto',
                                          maxHeight: isMobile ? '300px' : '450px',
                                          objectFit: 'contain',
                                          transition: 'opacity 0.2s'
                                        }}
                                        onError={(e) => {
                                          console.error(`이미지 로드 실패: ${selectedCctv} - ${imageConfig.type}`, e.currentTarget.src);
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
                                          padding: { xs: '6px', sm: '4px' },
                                          fontSize: { xs: '16px', sm: '20px' }
                                        }}
                                      />
                                    </>
                                  ) : (
                                    <Box sx={{
                                      height: { xs: '200px', sm: '300px' },
                                      display: 'flex',
                                      alignItems: 'center',
                                      justifyContent: 'center'
                                    }}>
                                      <Typography variant="body2" color="text.secondary">
                                        이미지를 불러올 수 없습니다.
                                      </Typography>
                                    </Box>
                                  )}
                                </Box>
                              </Box>
                            ))
                          }
                        </Box>
                      ) : (
                        /* 기존 API 기반 모드: 모든 이미지 표시 */
                        <Box sx={{
                          display: 'grid',
                          gap: { xs: 2, sm: 3 },
                          gridTemplateColumns: {
                            xs: '1fr',
                            sm: 'repeat(auto-fit, minmax(300px, 1fr))'
                          }
                        }}>
                          {/* ROI 결과 이미지 */}
                          <Box>
                            <Typography variant="subtitle2" gutterBottom sx={{
                              fontSize: { xs: '0.875rem', sm: '1rem' }
                            }}>
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
                                key={`roi-${imageUpdateKey}`}
                                src={selectedCctvImages.roiResultImage}
                                alt={`ROI Result - ${selectedCctv}`}
                                style={{
                                  width: '100%',
                                  height: 'auto',
                                  maxHeight: isMobile ? '200px' : '250px',
                                  objectFit: 'contain',
                                  transition: 'opacity 0.2s'
                                }}
                                onError={(e) => {
                                  console.error(`ROI 이미지 로드 실패: ${selectedCctv}`, e.currentTarget.src);
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
                                  padding: { xs: '6px', sm: '4px' },
                                  fontSize: { xs: '16px', sm: '20px' }
                                }}
                              />
                            </Box>
                          </Box>

                          {/* Foreground 마스크 이미지 */}
                          <Box>
                            <Typography variant="subtitle2" gutterBottom sx={{
                              fontSize: { xs: '0.875rem', sm: '1rem' }
                            }}>
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
                                key={`fgmask-${imageUpdateKey}`}
                                src={selectedCctvImages.fgMaskImage}
                                alt={`Foreground Mask - ${selectedCctv}`}
                                style={{
                                  width: '100%',
                                  height: 'auto',
                                  maxHeight: isMobile ? '200px' : '250px',
                                  objectFit: 'contain',
                                  transition: 'opacity 0.2s'
                                }}
                                onError={(e) => {
                                  console.error(`Foreground 마스크 이미지 로드 실패: ${selectedCctv}`, e.currentTarget.src);
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
                                  padding: { xs: '6px', sm: '4px' },
                                  fontSize: { xs: '16px', sm: '20px' }
                                }}
                              />
                            </Box>
                          </Box>
                        </Box>
                      )
                    ) : (
                      <Box sx={{
                        display: 'flex',
                        justifyContent: 'center',
                        alignItems: 'center',
                        height: { xs: '200px', sm: '300px' },
                        border: '1px dashed #e0e0e0',
                        borderRadius: 1
                      }}>
                        <Typography variant="body1" color="text.secondary" sx={{
                          textAlign: 'center',
                          px: 2,
                          fontSize: { xs: '0.875rem', sm: '1rem' }
                        }}>
                          {isMobile ? '이미지 선택 후 표시' : '이미지를 선택하면 여기에 표시됩니다'}
                        </Typography>
                      </Box>
                    )}
                  </Box>
                ) : (
                  <Box sx={{
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'center',
                    alignItems: 'center',
                    height: { xs: '250px', sm: '350px' },
                    border: '1px dashed #e0e0e0',
                    borderRadius: 1,
                    gap: 2
                  }}>
                    <Typography variant="body1" color="text.secondary" sx={{
                      textAlign: 'center',
                      px: 2,
                      fontSize: { xs: '0.875rem', sm: '1rem' }
                    }}>
                      {isMobile ? 'CCTV를 선택하세요' : '왼쪽에서 CCTV를 선택하세요'}
                    </Typography>
                    {isMobile && (
                      <Button
                        variant="outlined"
                        onClick={() => setCctvDialogOpen(true)}
                        startIcon={<ViewListIcon />}
                        sx={{ ...touchFriendly.button }}
                      >
                        CCTV 목록 보기
                      </Button>
                    )}
                  </Box>
                )}
              </Box>
            </Box>
          </CardContent>
        </Card>
      )}

      {/* 모바일 설정 다이얼로그 */}
      <Dialog
        open={settingsDialogOpen}
        onClose={() => setSettingsDialogOpen(false)}
        fullScreen={isMobile}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <Typography variant="h6">실시간 모니터링 설정</Typography>
          <IconButton onClick={() => setSettingsDialogOpen(false)}>
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent>
          {/* 파일 경로 설정 */}
          <Box sx={{ mb: 3 }}>
            <Typography variant="subtitle1" gutterBottom>
              파일 경로 설정
            </Typography>
            <Box sx={{
              display: 'grid',
              gap: 2,
              gridTemplateColumns: '1fr'
            }}>
              <FormControl fullWidth size="small" disabled={isRunning}>
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

              <FormControl fullWidth size="small" disabled={isRunning}>
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
          </Box>

          {/* 실시간 설정 */}
          <Box sx={{ mb: 2 }}>
            <Typography variant="subtitle1" gutterBottom>
              실시간 설정
            </Typography>
            <Box sx={{
              display: 'grid',
              gap: 2,
              gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)' }
            }}>
              <TextField
                label="Var Threshold"
                type="number"
                value={settings.varThreshold}
                onChange={(e) => handleSettingChange('varThreshold', parseInt(e.target.value))}
                fullWidth
                size="small"
                inputProps={{ min: 1, max: 1000 }}
                disabled={isRunning}
              />
              <TextField
                label="Learning Rate"
                type="number"
                value={settings.learningRate}
                onChange={(e) => handleSettingChange('learningRate', parseFloat(e.target.value))}
                fullWidth
                size="small"
                inputProps={{ step: 0.0001, min: 0.001, max: 1 }}
                disabled={isRunning}
              />
              <TextField
                label="Iterations"
                type="number"
                value={settings.iterations}
                onChange={(e) => handleSettingChange('iterations', parseInt(e.target.value))}
                fullWidth
                size="small"
                inputProps={{ min: 1, max: 10 }}
                disabled={isRunning}
                sx={{ gridColumn: { xs: '1', sm: 'span 2' } }}
              />
            </Box>
          </Box>

          <FormControlLabel
            control={
              <Switch
                checked={imageSavingEnabled}
                onChange={(e) => setImageSavingEnabled(e.target.checked)}
                disabled={isRunning}
              />
            }
            label="실시간 이미지 저장"
          />
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button
            onClick={() => setSettingsDialogOpen(false)}
            variant="outlined"
            fullWidth={isMobile}
          >
            닫기
          </Button>
        </DialogActions>
      </Dialog>

      {/* 모바일 CCTV 선택 다이얼로그 */}
      <Dialog
        open={cctvDialogOpen}
        onClose={() => setCctvDialogOpen(false)}
        fullScreen={isMobile}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <Typography variant="h6">CCTV 선택 ({cctvList.length}개)</Typography>
          <IconButton onClick={() => setCctvDialogOpen(false)}>
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent sx={{ p: 1 }}>
          <Box sx={{ maxHeight: '60vh', overflowY: 'auto' }}>
            {cctvList.map((cctvId) => (
              <Box
                key={cctvId}
                sx={{
                  p: 1.5,
                  m: 0.5,
                  border: selectedCctv === cctvId ? `2px solid ${theme.palette.primary.main}` : `1px solid ${theme.palette.divider}`,
                  borderRadius: 1,
                  backgroundColor: selectedCctv === cctvId ? alpha(theme.palette.primary.main, 0.08) : 'transparent',
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                  '&:hover': {
                    backgroundColor: selectedCctv === cctvId ? alpha(theme.palette.primary.main, 0.12) : alpha(theme.palette.action.hover, 0.08),
                    borderColor: theme.palette.primary.main
                  },
                  ...touchFriendly.button
                }}
                onClick={() => {
                  handleCctvSelect(cctvId);
                  setCctvDialogOpen(false);
                }}
              >
                <Box sx={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center'
                }}>
                  <Typography variant="body2" fontWeight="medium" sx={{ color: 'text.primary' }}>
                    {cctvId}
                  </Typography>
                  {selectedCctv === cctvId && (
                    <Chip
                      label="선택됨"
                      color="primary"
                      size="small"
                      variant="filled"
                    />
                  )}
                </Box>
              </Box>
            ))}
          </Box>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button
            onClick={() => setCctvDialogOpen(false)}
            variant="outlined"
            fullWidth={isMobile}
          >
            닫기
          </Button>
        </DialogActions>
      </Dialog>

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
                  key={`modal-${imageUpdateKey}`}
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
    </Container>
    </Box>
  );
};

export default RealtimeParkingView;
