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
  MenuItem
} from '@mui/material';
import {
  ArrowBack as BackIcon
} from '@mui/icons-material';
import { ParkingTestViewModel } from '../viewmodels/ParkingTestViewModel';
import { Project } from '../models/Project';
import LearningResultsView from './LearningResultsView';
import { FileUploadService } from '../services/FileUploadService';

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
  const [state, setState] = useState(ParkingTestViewModel.getInitialState());
  const [activeTab, setActiveTab] = useState(0);
  
  // 상태 변경 추적
  useEffect(() => {
    console.log('state.learningHistory 변경됨:', state.learningHistory);
  }, [state.learningHistory]);
  
  useEffect(() => {
    console.log('state.learningResult 변경됨:', state.learningResult);
  }, [state.learningResult]);
  
  useEffect(() => {
    console.log('state.learningResultsData 변경됨:', state.learningResultsData);
  }, [state.learningResultsData]);
  const [availableFolders, setAvailableFolders] = useState({
    learning: [] as string[],
    test: [] as string[],
    roi: [] as string[]
  });
  const [selectedHistory, setSelectedHistory] = useState<any>(null);
  const [historyLoading, setHistoryLoading] = useState(false);

  useEffect(() => {
    loadAvailableFolders();
    loadLearningHistory();
  }, [project.id]);

  const loadAvailableFolders = async () => {
    try {
      const [learningFolders, testFolders, roiFolders] = await Promise.all([
        FileUploadService.getFolders(project.id, 'learning'),
        FileUploadService.getFolders(project.id, 'test'),
        FileUploadService.getFolders(project.id, 'roi')
      ]);

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
      const history = await ParkingTestViewModel.loadLearningHistory(project.id);
      console.log('받아온 히스토리 데이터:', history);
      console.log('받아온 히스토리 길이:', history.length);
      
      // 테스트를 위해 임시 데이터 추가 (실제 데이터가 없을 경우)
      const testData = history.length === 0 ? [
        {
          folder_path: 'test_20241201_123456',
          timestamp: new Date().toISOString(),
          name: '테스트 학습',
          cctv_list: ['cctv1', 'cctv2']
        },
        {
          folder_path: 'test_20241201_234567', 
          timestamp: new Date(Date.now() - 86400000).toISOString(),
          name: '이전 학습',
          cctv_list: ['cctv1']
        }
      ] : history;
      
      setState(prev => ({ 
        ...prev, 
        learningHistory: testData 
      }));
      console.log('상태 업데이트 완료, 최종 데이터:', testData);
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
        console.log('학습 완료, 결과 로드 시작:', result.folder_path);
        
        const detailedResults = await ParkingTestViewModel.loadLearningResults(project.id, result.folder_path);
        console.log('로드된 상세 결과:', detailedResults);
        
        if (detailedResults) {
          setState(prev => ({ 
            ...prev, 
            learningResultsData: detailedResults,
            showResults: true
          }));
          console.log('상태 업데이트 완료');
        } else {
          console.error('상세 결과 로드 실패');
          setState(prev => ({ 
            ...prev, 
            error: '학습 결과를 불러오는데 실패했습니다.'
          }));
        }
      }

      // 히스토리 새로고침
      await loadLearningHistory();
    } catch (error: any) {
      setState(prev => ({ ...prev, error: error.message }));
    } finally {
      setState(prev => ({ ...prev, loading: false }));
    }
  };

  const handleHistorySelect = async (historyItem: any) => {
    try {
      setSelectedHistory(historyItem);
      const detailedResults = await ParkingTestViewModel.loadLearningResults(project.id, historyItem.folder_path);
      setState(prev => ({ 
        ...prev, 
        selectedHistoryResults: detailedResults
      }));
    } catch (error) {
      console.error('히스토리 결과 로드 실패:', error);
    }
  };

  const handleTabChange = async (event: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue);
    
    // 학습 히스토리 탭으로 이동할 때 히스토리 데이터 로드
    if (newValue === 1) {
      console.log('학습 히스토리 탭 선택됨, 히스토리 로드 시작');
      await loadLearningHistory();
    }
  };

  const handleSnackbarClose = () => {
    setState(prev => ({ ...prev, error: null }));
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
          주차면 테스트
        </Typography>
      </Box>

      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 2 }}>
        <Tabs value={activeTab} onChange={handleTabChange}>
          <Tab label="학습 시작하기" />
          <Tab label="학습 히스토리" />
        </Tabs>
      </Box>

      <TabPanel value={activeTab} index={0}>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          {/* 데이터 선택 */}
          <Card>
            <CardContent sx={{ pb: 2 }}>
              <Typography variant="h6" gutterBottom>
                데이터 선택
              </Typography>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
                <FormControl sx={{ flex: '1 1 200px', minWidth: 200 }}>
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

                <FormControl sx={{ flex: '1 1 200px', minWidth: 200 }}>
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

                <FormControl sx={{ flex: '1 1 200px', minWidth: 200 }}>
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
            </CardContent>
          </Card>

          {/* 테스트 설정 */}
          <Card>
            <CardContent sx={{ pb: 2 }}>
              <Typography variant="h6" gutterBottom>
                테스트 설정
              </Typography>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, mb: 2 }}>
                <TextField
                  label="Var Threshold"
                  type="number"
                  value={state.varThreshold}
                  onChange={(e) => setState(prev => ({ ...prev, varThreshold: Number(e.target.value) }))}
                  sx={{ flex: '1 1 150px', minWidth: 150 }}
                />
                <TextField
                  label="Learning Rate"
                  type="number"
                  value={state.learningRate}
                  onChange={(e) => setState(prev => ({ ...prev, learningRate: Number(e.target.value) }))}
                  sx={{ flex: '1 1 150px', minWidth: 150 }}
                  inputProps={{ step: 0.0001 }}
                />
                <TextField
                  label="Iterations"
                  type="number"
                  value={state.iterations}
                  onChange={(e) => setState(prev => ({ ...prev, iterations: Number(e.target.value) }))}
                  sx={{ flex: '1 1 150px', minWidth: 150 }}
                />
              </Box>
              <Button
                variant="contained"
                onClick={handleStartLearning}
                disabled={state.loading}
                size="large"
              >
                {state.loading ? '학습 중...' : '학습 시작'}
              </Button>
            </CardContent>
          </Card>

          {/* 학습 결과 */}
          {state.learningResult?.folder_path && state.learningResultsData?.cctv_list && state.learningResultsData.cctv_list.length > 0 && (
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  최신 학습 결과
                </Typography>
                <LearningResultsView
                  projectId={project.id}
                  folderPath={state.learningResult.folder_path}
                  cctvList={state.learningResultsData.cctv_list}
                  timestamp={state.learningResultsData.timestamp}
                />
              </CardContent>
            </Card>
          )}
          
          {/* 학습 결과 로딩 실패 시 */}
          {state.learningResult?.folder_path && !state.learningResultsData && !state.loading && (
            <Card>
              <CardContent>
                <Alert severity="warning">
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
              <CardContent sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', py: 4 }}>
                <CircularProgress size={60} sx={{ mb: 2 }} />
                <Typography variant="h6" color="text.secondary">
                  학습을 진행하고 있습니다...
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                  완료되면 결과가 자동으로 표시됩니다.
                </Typography>
              </CardContent>
            </Card>
          )}
        </Box>
      </TabPanel>

      <TabPanel value={activeTab} index={1}>
        <Box sx={{ display: 'flex', gap: 2, height: '70vh' }}>
          {/* 히스토리 목록 */}
          <Card sx={{ flex: '0 0 300px' }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                학습 히스토리
              </Typography>
              {(() => {
                console.log('렌더링 시점 - historyLoading:', historyLoading);
                console.log('렌더링 시점 - state.learningHistory:', state.learningHistory);
                console.log('렌더링 시점 - 히스토리 길이:', state.learningHistory?.length);
                return null;
              })()}
              {historyLoading ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
                  <CircularProgress />
                </Box>
              ) : state.learningHistory && state.learningHistory.length > 0 ? (
                <List sx={{ maxHeight: '60vh', overflow: 'auto' }}>
                  {state.learningHistory.map((item, index) => {
                    console.log(`히스토리 아이템 ${index}:`, item);
                    return (
                      <ListItem key={index} disablePadding>
                        <ListItemButton
                          selected={selectedHistory?.folder_path === item.folder_path}
                          onClick={() => handleHistorySelect(item)}
                        >
                          <ListItemText
                            primary={`학습 ${index + 1}${item.name ? ` - ${item.name}` : ''}`}
                            secondary={item.timestamp || item.created_at || item.date ? 
                              new Date(item.timestamp || item.created_at || item.date).toLocaleString() : 
                              `폴더: ${item.folder_path || '정보 없음'}`
                            }
                          />
                        </ListItemButton>
                      </ListItem>
                    );
                  })}
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
            {selectedHistory && state.selectedHistoryResults ? (
              <LearningResultsView
                projectId={project.id}
                folderPath={selectedHistory.folder_path}
                cctvList={state.selectedHistoryResults.cctv_list}
                timestamp={state.selectedHistoryResults.timestamp}
              />
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
      </TabPanel>

      <Snackbar
        open={!!state.error}
        autoHideDuration={6000}
        onClose={handleSnackbarClose}
      >
        <Alert onClose={handleSnackbarClose} severity="error">
          {state.error}
        </Alert>
      </Snackbar>
    </Box>
  );
}; 