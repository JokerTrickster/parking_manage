import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  TextField,
  Button,
  CircularProgress,
  Alert,
  Snackbar,
  Tabs,
  Tab,
  List,
  ListItem,
  ListItemText,
  ListItemButton,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  useMediaQuery,
  useTheme,
  Collapse,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Container
} from '@mui/material';
import {
  ArrowBack as BackIcon,
  ExpandMore as ExpandMoreIcon,
  Settings as SettingsIcon,
  History as HistoryIcon,
  PlayArrow as PlayIcon,
  Close as CloseIcon
} from '@mui/icons-material';
import { ParkingTestViewModel } from '../viewmodels/ParkingTestViewModel';
import { Project } from '../models/Project';
import LearningResultsView from './LearningResultsView';
import { FileStorageService } from '../services/FileStorageService';
import { touchFriendly, responsiveSpacing } from '../styles/responsive';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`simple-tabpanel-${index}`}
      aria-labelledby={`simple-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ p: 2 }}>
          {children}
        </Box>
      )}
    </div>
  );
}

interface ParkingTestViewProps {
  project: Project;
  onBack?: () => void;
}

export const ParkingTestView: React.FC<ParkingTestViewProps> = ({ project, onBack }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const isSmallMobile = useMediaQuery(theme.breakpoints.down('sm'));

  const [state, setState] = useState(ParkingTestViewModel.getInitialState());
  const [activeTab, setActiveTab] = useState(0);
  

  const [availableFolders, setAvailableFolders] = useState({
    learning: [] as string[],
    test: [] as string[],
    roi: [] as string[]
  });
  const [selectedHistory, setSelectedHistory] = useState<any>(null);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [historyResultLoading, setHistoryResultLoading] = useState(false);

  // Mobile UI states
  const [dataSelectionExpanded, setDataSelectionExpanded] = useState(!isMobile);
  const [testSettingsExpanded, setTestSettingsExpanded] = useState(!isMobile);
  const [historyDialogOpen, setHistoryDialogOpen] = useState(false);
  const [settingsDialogOpen, setSettingsDialogOpen] = useState(false);

  useEffect(() => {
    loadAvailableFolders();
    loadLearningHistory();
  }, [project.id]);

  const loadAvailableFolders = async () => {
    try {
      const [learningResponse, testResponse, roiResponse] = await Promise.all([
        FileStorageService.listFolders(project.id, 'learning'),
        FileStorageService.listFolders(project.id, 'test'),
        FileStorageService.listFiles(project.id, 'roi')
      ]);

      // 폴더만 필터링하여 이름 추출
      const learningFolders = learningResponse.data.items
        .filter(item => item.isFolder)
        .map(folder => folder.name);

      const testFolders = testResponse.data.items
        .filter(item => item.isFolder)
        .map(folder => folder.name);

      // ROI는 파일 목록에서 파일명 추출
      const roiFolders = roiResponse.data.files.map(file => file.filename);

      setAvailableFolders({
        learning: learningFolders,
        test: testFolders,
        roi: roiFolders
      });
    } catch (error) {
      console.error('폴더 목록 로드 실패:', error);
    }
  };

  const loadLearningHistory = async () => {
    try {
      setHistoryLoading(true);
      // 히스토리 로드 시 선택된 히스토리 초기화
      setSelectedHistory(null);
      setState(prev => ({ ...prev, selectedHistoryResults: null }));
      
      const history = await ParkingTestViewModel.loadLearningHistory(project.id);
      
      setState(prev => ({ 
        ...prev, 
        learningHistory: history 
      }));
    } catch (error) {
      console.error('학습 히스토리 로드 실패:', error);
      setState(prev => ({ ...prev, error: '학습 히스토리를 불러오는데 실패했습니다.' }));
    } finally {
      setHistoryLoading(false);
    }
  };

  const handleStartLearning = async () => {
    try {
      setState(prev => ({ ...prev, loading: true, error: null }));
      
      const result = await ParkingTestViewModel.startLearning(
        project.id,
        state.selectedLearningFolder,
        state.selectedRoiFile,
        state.selectedTestFolder,
        state.varThreshold,
        state.learningRate,
        state.iterations
      );

      setState(prev => ({ 
        ...prev, 
        learningResult: result,
        lastLearningFolderPath: result.folder_path
      }));

      // 학습 완료 후 상세 결과 로드
      if (result.folder_path) {
        const detailedResults = await ParkingTestViewModel.loadLearningResults(project.id, result.folder_path);
        
        if (detailedResults) {
          setState(prev => ({ 
            ...prev, 
            learningResultsData: detailedResults,
            showResults: true,
            // 최신 학습 결과로 업데이트
            lastLearningFolderPath: result.folder_path
          }));
        } else {
          setState(prev => ({ 
            ...prev, 
            error: '학습 결과를 불러오는데 실패했습니다.'
          }));
        }
      }

      // 히스토리 새로고침 (새로운 학습 결과 포함)
      await loadLearningHistory();
    } catch (error: any) {
      setState(prev => ({ ...prev, error: error.message }));
    } finally {
      setState(prev => ({ ...prev, loading: false }));
    }
  };

  const handleHistorySelect = async (historyItem: any) => {
    try {
      setHistoryResultLoading(true);
      setSelectedHistory(historyItem);
      
      // 이전 결과 초기화
      setState(prev => ({ 
        ...prev, 
        selectedHistoryResults: null
      }));
      
      const detailedResults = await ParkingTestViewModel.loadLearningResults(project.id, historyItem.folder_path);
      
      setState(prev => ({ 
        ...prev, 
        selectedHistoryResults: detailedResults
      }));
    } catch (error) {
      console.error('히스토리 결과 로드 실패:', error);
      setState(prev => ({ 
        ...prev, 
        selectedHistoryResults: null,
        error: '히스토리 결과를 불러오는데 실패했습니다.'
      }));
    } finally {
      setHistoryResultLoading(false);
    }
  };

  const handleTabChange = async (event: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue);
    
    // 학습 히스토리 탭으로 이동할 때 히스토리 데이터 로드
    if (newValue === 1) {
      await loadLearningHistory();
    }
  };

  const handleSnackbarClose = () => {
    setState(prev => ({ ...prev, error: null }));
  };

  return (
    <Container maxWidth="xl" sx={{ ...responsiveSpacing.pagePadding, pb: { xs: 8, md: 3 } }}>
      {/* 헤더 */}
      <Box sx={{
        display: 'flex',
        alignItems: 'center',
        ...responsiveSpacing.sectionMargin,
        flexWrap: { xs: 'wrap', sm: 'nowrap' },
        gap: 1
      }}>
        {onBack && (
          <Button
            startIcon={<BackIcon />}
            onClick={onBack}
            sx={{
              ...touchFriendly.button,
              mr: { xs: 0, sm: 2 },
              mb: { xs: 1, sm: 0 },
              minWidth: { xs: 'auto', sm: 'unset' }
            }}
            size={isSmallMobile ? "small" : "medium"}
          >
            {isSmallMobile ? "뒤로" : "대시보드로"}
          </Button>
        )}
        <Typography
          variant={isMobile ? "h5" : "h4"}
          component="h1"
          sx={{ flexGrow: 1, fontSize: { xs: '1.5rem', sm: '2rem', md: '2.5rem' } }}
        >
          주차면 테스트
        </Typography>

        {/* Mobile quick action buttons */}
        {isMobile && (
          <Box sx={{ display: 'flex', gap: 1 }}>
            <IconButton
              onClick={() => setSettingsDialogOpen(true)}
              sx={{ ...touchFriendly.iconButton }}
            >
              <SettingsIcon />
            </IconButton>
            <IconButton
              onClick={() => setHistoryDialogOpen(true)}
              sx={{ ...touchFriendly.iconButton }}
            >
              <HistoryIcon />
            </IconButton>
          </Box>
        )}
      </Box>

      {/* Tabs - Desktop only */}
      {!isMobile && (
        <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 2 }}>
          <Tabs value={activeTab} onChange={handleTabChange}>
            <Tab label="학습 시작하기" icon={<PlayIcon />} iconPosition="start" />
            <Tab label="학습 히스토리" icon={<HistoryIcon />} iconPosition="start" />
          </Tabs>
        </Box>
      )}

      {/* Mobile: Always show learning tab, dialogs for settings/history */}
      {isMobile && (
        <Box sx={{ mb: 2 }}>
          <Typography variant="h6" sx={{ mb: 1, fontWeight: 600 }}>
            학습 시작하기
          </Typography>
        </Box>
      )}

      {/* Learning content - always visible on mobile, tab content on desktop */}
      {(isMobile || activeTab === 0) && (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: { xs: 2, sm: 3 } }}>
          {/* 데이터 선택 */}
          <Card>
            <CardContent sx={{ ...responsiveSpacing.cardPadding }}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <Typography variant="h6" sx={{
                  flexGrow: 1,
                  fontSize: { xs: '1rem', sm: '1.25rem' },
                  fontWeight: 600
                }}>
                  데이터 선택
                </Typography>
                {isMobile && (
                  <IconButton
                    onClick={() => setDataSelectionExpanded(!dataSelectionExpanded)}
                    sx={{ ...touchFriendly.iconButton }}
                  >
                    <ExpandMoreIcon
                      sx={{
                        transform: dataSelectionExpanded ? 'rotate(180deg)' : 'rotate(0deg)',
                        transition: 'transform 0.3s'
                      }}
                    />
                  </IconButton>
                )}
              </Box>

              <Collapse in={dataSelectionExpanded}>
                <Box sx={{
                  display: 'grid',
                  gap: { xs: 2, sm: 3 },
                  gridTemplateColumns: {
                    xs: '1fr',
                    sm: 'repeat(2, 1fr)',
                    md: 'repeat(3, 1fr)'
                  }
                }}>
                  <FormControl fullWidth size={isMobile ? "small" : "medium"}>
                    <InputLabel>학습 이미지 폴더</InputLabel>
                    <Select
                      value={state.selectedLearningFolder}
                      label="학습 이미지 폴더"
                      onChange={(e) => setState(prev => ({ ...prev, selectedLearningFolder: e.target.value }))}
                      sx={{ minHeight: { xs: 44, sm: 56 } }}
                    >
                      {availableFolders.learning.map((folder) => (
                        <MenuItem key={folder} value={folder}>
                          {folder}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>

                  <FormControl fullWidth size={isMobile ? "small" : "medium"}>
                    <InputLabel>ROI 파일</InputLabel>
                    <Select
                      value={state.selectedRoiFile}
                      label="ROI 파일"
                      onChange={(e) => setState(prev => ({ ...prev, selectedRoiFile: e.target.value }))}
                      sx={{ minHeight: { xs: 44, sm: 56 } }}
                    >
                      {availableFolders.roi.map((file) => (
                        <MenuItem key={file} value={file}>
                          {file}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>

                  <FormControl fullWidth size={isMobile ? "small" : "medium"}>
                    <InputLabel>테스트 이미지 폴더</InputLabel>
                    <Select
                      value={state.selectedTestFolder}
                      label="테스트 이미지 폴더"
                      onChange={(e) => setState(prev => ({ ...prev, selectedTestFolder: e.target.value }))}
                      sx={{ minHeight: { xs: 44, sm: 56 } }}
                    >
                      {availableFolders.test.map((folder) => (
                        <MenuItem key={folder} value={folder}>
                          {folder}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Box>
              </Collapse>
            </CardContent>
          </Card>

          {/* 테스트 설정 */}
          <Card>
            <CardContent sx={{ ...responsiveSpacing.cardPadding }}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <Typography variant="h6" sx={{
                  flexGrow: 1,
                  fontSize: { xs: '1rem', sm: '1.25rem' },
                  fontWeight: 600
                }}>
                  테스트 설정
                </Typography>
                {isMobile && (
                  <IconButton
                    onClick={() => setTestSettingsExpanded(!testSettingsExpanded)}
                    sx={{ ...touchFriendly.iconButton }}
                  >
                    <ExpandMoreIcon
                      sx={{
                        transform: testSettingsExpanded ? 'rotate(180deg)' : 'rotate(0deg)',
                        transition: 'transform 0.3s'
                      }}
                    />
                  </IconButton>
                )}
              </Box>

              <Collapse in={testSettingsExpanded}>
                <Box sx={{
                  display: 'grid',
                  gap: { xs: 2, sm: 3 },
                  gridTemplateColumns: {
                    xs: '1fr',
                    sm: 'repeat(2, 1fr)',
                    md: 'repeat(3, 1fr)'
                  },
                  mb: 3
                }}>
                  <TextField
                    label="Var Threshold"
                    type="number"
                    value={state.varThreshold}
                    onChange={(e) => setState(prev => ({ ...prev, varThreshold: Number(e.target.value) }))}
                    fullWidth
                    size={isMobile ? "small" : "medium"}
                    sx={{ minHeight: { xs: 44, sm: 56 } }}
                  />
                  <TextField
                    label="Learning Rate"
                    type="number"
                    value={state.learningRate}
                    onChange={(e) => setState(prev => ({ ...prev, learningRate: Number(e.target.value) }))}
                    fullWidth
                    size={isMobile ? "small" : "medium"}
                    inputProps={{ step: 0.0001 }}
                    sx={{ minHeight: { xs: 44, sm: 56 } }}
                  />
                  <TextField
                    label="Iterations"
                    type="number"
                    value={state.iterations}
                    onChange={(e) => setState(prev => ({ ...prev, iterations: Number(e.target.value) }))}
                    fullWidth
                    size={isMobile ? "small" : "medium"}
                    sx={{ minHeight: { xs: 44, sm: 56 } }}
                  />
                </Box>

                <Button
                  variant="contained"
                  onClick={handleStartLearning}
                  disabled={state.loading || !state.selectedLearningFolder || !state.selectedRoiFile || !state.selectedTestFolder}
                  fullWidth={isMobile}
                  startIcon={<PlayIcon />}
                  sx={{
                    ...touchFriendly.button,
                    fontSize: { xs: '1rem', sm: '1.125rem' },
                    py: { xs: 1.5, sm: 2 },
                    minWidth: { xs: 'auto', sm: 200 }
                  }}
                >
                  {state.loading ? '학습 중...' : '학습 시작'}
                </Button>
              </Collapse>
            </CardContent>
          </Card>

          {/* 학습 결과 */}
          {state.learningResult?.folder_path && state.learningResultsData?.cctv_list && state.learningResultsData.cctv_list.length > 0 && (
            <Card>
              <CardContent sx={{ ...responsiveSpacing.cardPadding }}>
                <Typography variant="h6" gutterBottom sx={{
                  fontSize: { xs: '1rem', sm: '1.25rem' },
                  fontWeight: 600
                }}>
                  최신 학습 결과
                </Typography>
                <Box sx={{ mt: { xs: 2, sm: 3 } }}>
                  <LearningResultsView
                    projectId={project.id}
                    folderPath={state.learningResult.folder_path}
                    cctvList={state.learningResultsData.cctv_list}
                    timestamp={state.learningResultsData.timestamp}
                  />
                </Box>
              </CardContent>
            </Card>
          )}
          
          {/* 학습 결과 로딩 실패 시 */}
          {state.learningResult?.folder_path && !state.learningResultsData && !state.loading && (
            <Card>
              <CardContent sx={{ ...responsiveSpacing.cardPadding }}>
                <Alert severity="warning" sx={{ fontSize: { xs: '0.875rem', sm: '1rem' } }}>
                  학습은 완료되었지만 결과를 불러오는데 실패했습니다.
                  <br />
                  폴더 경로: {state.learningResult.folder_path}
                </Alert>
              </CardContent>
            </Card>
          )}
          
          {/* 학습 중 로딩 표시 */}
          {state.loading && (
            <Card>
              <CardContent sx={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                py: { xs: 3, sm: 4 },
                ...responsiveSpacing.cardPadding
              }}>
                <CircularProgress size={isMobile ? 48 : 60} sx={{ mb: 2 }} />
                <Typography variant={isMobile ? "body1" : "h6"} color="text.secondary" sx={{
                  textAlign: 'center',
                  fontSize: { xs: '1rem', sm: '1.25rem' },
                  fontWeight: 600
                }}>
                  학습을 진행하고 있습니다...
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{
                  mt: 1,
                  textAlign: 'center',
                  fontSize: { xs: '0.875rem', sm: '1rem' }
                }}>
                  {isMobile
                    ? "완료되면 결과가 표시됩니다."
                    : "완료되면 결과가 자동으로 표시됩니다."
                  }
                </Typography>
              </CardContent>
            </Card>
          )}
        </Box>
      )}

      {/* Desktop History Tab */}
      {!isMobile && activeTab === 1 && (
        <Box sx={{ display: 'flex', gap: 2, height: '70vh' }}>
          {/* 히스토리 목록 */}
          <Card sx={{ flex: '0 0 300px' }}>
            <CardContent sx={{ ...responsiveSpacing.cardPadding }}>
              <Typography variant="h6" gutterBottom sx={{
                fontSize: { xs: '1rem', sm: '1.25rem' },
                fontWeight: 600
              }}>
                학습 히스토리
              </Typography>


              {historyLoading ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
                  <CircularProgress />
                </Box>
              ) : state.learningHistory && state.learningHistory.length > 0 ? (
                <List sx={{ maxHeight: '60vh', overflow: 'auto' }}>
                  {state.learningHistory.map((item, index) => (
                      <ListItem key={item.id || index} disablePadding>
                        <ListItemButton
                          selected={selectedHistory?.folder_path === item.folder_path}
                          onClick={() => handleHistorySelect(item)}
                        >
                          <ListItemText
                            primary={
                              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <Typography variant="subtitle2" fontWeight="bold">
                                  {item.name || `학습 ${index + 1}`}
                                </Typography>
                                {item.cctv_list && Array.isArray(item.cctv_list) && item.cctv_list.length > 0 && (
                                  <Chip 
                                    label={`${item.cctv_list.length}개`} 
                                    size="small" 
                                    color="primary"
                                    variant="outlined"
                                  />
                                )}
                              </Box>
                            }
                            secondary={
                              <Box sx={{ mt: 1 }}>
                                <Typography variant="caption" display="block" color="text.primary">
                                  📅 {item.created_at ? 
                                    new Date(item.created_at).toLocaleString('ko-KR') : 
                                    '시간 정보 없음'
                                  }
                                </Typography>
                                <Typography variant="caption" display="block" color="text.secondary" sx={{ mt: 0.5 }}>
                                  🎯 학습률: {item.learning_rate || 'N/A'} | 🔄 반복: {item.epoch || 'N/A'} | 📊 임계값: {item.var_threshold || 'N/A'}
                                </Typography>
                              </Box>
                            }
                          />
                        </ListItemButton>
                      </ListItem>
                  ))}
                </List>
              ) : (
                <Typography variant="body2" color="text.secondary" sx={{ py: 4, textAlign: 'center' }}>
                  학습 히스토리가 없습니다. (현재 개수: {state.learningHistory?.length || 0})
                </Typography>
              )}
            </CardContent>
          </Card>

          {/* 히스토리 결과 */}
          <Box sx={{ flex: 1 }}>
            {historyResultLoading ? (
              <Card sx={{ height: '100%' }}>
                <CardContent sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%' }}>
                  <CircularProgress sx={{ mb: 2 }} />
                  <Typography variant="body1" color="text.secondary">
                    학습 결과를 불러오는 중...
                  </Typography>
                </CardContent>
              </Card>
            ) : selectedHistory && state.selectedHistoryResults ? (
              <Card sx={{ height: '100%' }}>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    {selectedHistory.name || `학습 결과`} - {selectedHistory.created_at ? new Date(selectedHistory.created_at).toLocaleString() : ''}
                  </Typography>
                  <LearningResultsView
                    projectId={project.id}
                    folderPath={selectedHistory.folder_path}
                    cctvList={state.selectedHistoryResults.cctv_list}
                    timestamp={state.selectedHistoryResults.timestamp}
                  />
                </CardContent>
              </Card>
            ) : (
              <Card sx={{ height: '100%' }}>
                <CardContent sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%' }}>
                  <Typography variant="body1" color="text.secondary">
                    히스토리를 선택하면 결과를 확인할 수 있습니다.
                  </Typography>
                </CardContent>
              </Card>
            )}
          </Box>
        </Box>
      )}

      {/* Mobile Settings Dialog */}
      <Dialog
        open={settingsDialogOpen}
        onClose={() => setSettingsDialogOpen(false)}
        maxWidth="sm"
        fullWidth
        fullScreen={isSmallMobile}
      >
        <DialogTitle sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Typography variant="h6">학습 설정</Typography>
          <IconButton onClick={() => setSettingsDialogOpen(false)}>
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent>
          {/* Data Selection */}
          <Box sx={{ mb: 3 }}>
            <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: 600 }}>
              데이터 선택
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <FormControl fullWidth size="small">
                <InputLabel>학습 이미지 폴더</InputLabel>
                <Select
                  value={state.selectedLearningFolder}
                  label="학습 이미지 폴더"
                  onChange={(e) => setState(prev => ({ ...prev, selectedLearningFolder: e.target.value }))}
                >
                  {availableFolders.learning.map((folder) => (
                    <MenuItem key={folder} value={folder}>
                      {folder}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

              <FormControl fullWidth size="small">
                <InputLabel>ROI 파일</InputLabel>
                <Select
                  value={state.selectedRoiFile}
                  label="ROI 파일"
                  onChange={(e) => setState(prev => ({ ...prev, selectedRoiFile: e.target.value }))}
                >
                  {availableFolders.roi.map((file) => (
                    <MenuItem key={file} value={file}>
                      {file}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

              <FormControl fullWidth size="small">
                <InputLabel>테스트 이미지 폴더</InputLabel>
                <Select
                  value={state.selectedTestFolder}
                  label="테스트 이미지 폴더"
                  onChange={(e) => setState(prev => ({ ...prev, selectedTestFolder: e.target.value }))}
                >
                  {availableFolders.test.map((folder) => (
                    <MenuItem key={folder} value={folder}>
                      {folder}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Box>
          </Box>

          {/* Test Settings */}
          <Box>
            <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: 600 }}>
              테스트 설정
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <TextField
                label="Var Threshold"
                type="number"
                value={state.varThreshold}
                onChange={(e) => setState(prev => ({ ...prev, varThreshold: Number(e.target.value) }))}
                fullWidth
                size="small"
              />
              <TextField
                label="Learning Rate"
                type="number"
                value={state.learningRate}
                onChange={(e) => setState(prev => ({ ...prev, learningRate: Number(e.target.value) }))}
                fullWidth
                size="small"
                inputProps={{ step: 0.0001 }}
              />
              <TextField
                label="Iterations"
                type="number"
                value={state.iterations}
                onChange={(e) => setState(prev => ({ ...prev, iterations: Number(e.target.value) }))}
                fullWidth
                size="small"
              />
            </Box>
          </Box>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button
            onClick={() => setSettingsDialogOpen(false)}
            sx={{ ...touchFriendly.button }}
          >
            닫기
          </Button>
          <Button
            variant="contained"
            onClick={() => {
              handleStartLearning();
              setSettingsDialogOpen(false);
            }}
            disabled={state.loading || !state.selectedLearningFolder || !state.selectedRoiFile || !state.selectedTestFolder}
            startIcon={<PlayIcon />}
            sx={{ ...touchFriendly.button }}
          >
            학습 시작
          </Button>
        </DialogActions>
      </Dialog>

      {/* Mobile History Dialog */}
      <Dialog
        open={historyDialogOpen}
        onClose={() => setHistoryDialogOpen(false)}
        maxWidth="md"
        fullWidth
        fullScreen={isSmallMobile}
        sx={{
          '& .MuiDialog-paper': {
            height: { xs: '100%', sm: '80vh' }
          }
        }}
      >
        <DialogTitle sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Typography variant="h6">학습 히스토리</Typography>
          <IconButton onClick={() => setHistoryDialogOpen(false)}>
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent sx={{ p: 0 }}>
          {historyLoading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
              <CircularProgress />
            </Box>
          ) : state.learningHistory && state.learningHistory.length > 0 ? (
            <List sx={{ pt: 0 }}>
              {state.learningHistory.map((item, index) => (
                <ListItem key={item.id || index} disablePadding>
                  <ListItemButton
                    selected={selectedHistory?.folder_path === item.folder_path}
                    onClick={() => {
                      handleHistorySelect(item);
                      // 추운에 달유 보기도 추가
                    }}
                    sx={{
                      ...touchFriendly.button,
                      py: 2,
                      px: 2
                    }}
                  >
                    <ListItemText
                      primary={
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <Typography variant="subtitle1" fontWeight="bold" sx={{
                            fontSize: { xs: '1rem', sm: '1.125rem' }
                          }}>
                            {item.name || `학습 ${index + 1}`}
                          </Typography>
                          {item.cctv_list && Array.isArray(item.cctv_list) && item.cctv_list.length > 0 && (
                            <Chip
                              label={`${item.cctv_list.length}개`}
                              size="small"
                              color="primary"
                              variant="outlined"
                            />
                          )}
                        </Box>
                      }
                      secondary={
                        <Box sx={{ mt: 1 }}>
                          <Typography variant="caption" display="block" color="text.primary" sx={{
                            fontSize: { xs: '0.75rem', sm: '0.875rem' }
                          }}>
                            📅 {item.created_at ?
                              new Date(item.created_at).toLocaleString('ko-KR') :
                              '시간 정보 없음'
                            }
                          </Typography>
                          <Typography variant="caption" display="block" color="text.secondary" sx={{
                            mt: 0.5,
                            fontSize: { xs: '0.7rem', sm: '0.75rem' }
                          }}>
                            🎯 학습률: {item.learning_rate || 'N/A'} | 🔄 반복: {item.epoch || 'N/A'} | 📊 임계값: {item.var_threshold || 'N/A'}
                          </Typography>
                        </Box>
                      }
                    />
                  </ListItemButton>
                </ListItem>
              ))}
            </List>
          ) : (
            <Box sx={{ p: 3, textAlign: 'center' }}>
              <Typography variant="body1" color="text.secondary">
                학습 히스토리가 없습니다.
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                첫 학습을 실행해보세요.
              </Typography>
            </Box>
          )}

          {/* 선택된 히스토리 결과 */}
          {selectedHistory && state.selectedHistoryResults && (
            <Box sx={{ p: 2, borderTop: '1px solid', borderColor: 'divider', mt: 2 }}>
              <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: 600 }}>
                {selectedHistory.name || '학습 결과'} - {selectedHistory.created_at ? new Date(selectedHistory.created_at).toLocaleDateString() : ''}
              </Typography>
              <LearningResultsView
                projectId={project.id}
                folderPath={selectedHistory.folder_path}
                cctvList={state.selectedHistoryResults.cctv_list}
                timestamp={state.selectedHistoryResults.timestamp}
              />
            </Box>
          )}

          {historyResultLoading && (
            <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
              <CircularProgress size={24} />
              <Typography variant="body2" color="text.secondary" sx={{ ml: 2 }}>
                결과 로딩 중...
              </Typography>
            </Box>
          )}
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button
            onClick={() => setHistoryDialogOpen(false)}
            sx={{ ...touchFriendly.button }}
          >
            닫기
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={!!state.error}
        autoHideDuration={6000}
        onClose={handleSnackbarClose}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert
          onClose={handleSnackbarClose}
          severity="error"
          sx={{
            width: '100%',
            fontSize: { xs: '0.875rem', sm: '1rem' }
          }}
          elevation={6}
        >
          {state.error}
        </Alert>
      </Snackbar>
    </Container>
  );
}; 