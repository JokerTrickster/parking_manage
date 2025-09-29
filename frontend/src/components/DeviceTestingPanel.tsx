import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Chip,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Divider,
  IconButton,
  Collapse,
  Alert,
  LinearProgress,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Tabs,
  Tab,
  Switch,
  FormControlLabel,
  useTheme,
  useMediaQuery,
} from '@mui/material';
import {
  PhoneIphone as MobileIcon,
  Tablet as TabletIcon,
  Computer as DesktopIcon,
  Speed as PerformanceIcon,
  Accessibility as AccessibilityIcon,
  CheckCircle as CheckIcon,
  Error as ErrorIcon,
  Warning as WarningIcon,
  ExpandMore as ExpandMoreIcon,
  ExpandLess as ExpandLessIcon,
  Refresh as RefreshIcon,
  Assessment as ReportIcon,
  DeviceHub as DeviceIcon,
  TouchApp as TouchIcon,
  ViewStream as LayoutIcon,
} from '@mui/icons-material';
import {
  DEVICE_PROFILES,
  TEST_SCENARIOS,
  detectCurrentDevice,
  testBreakpoints,
  measurePerformance,
  checkAccessibility,
  DeviceProfile,
  TestScenario,
} from '../utils/deviceTesting';

interface DeviceTestingPanelProps {
  open: boolean;
  onClose: () => void;
}

const DeviceTestingPanel: React.FC<DeviceTestingPanelProps> = ({ open, onClose }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  const [activeTab, setActiveTab] = useState(0);
  const [selectedDevice, setSelectedDevice] = useState<DeviceProfile | null>(null);
  const [selectedScenario, setSelectedScenario] = useState<TestScenario | null>(null);
  const [currentDevice, setCurrentDevice] = useState<Partial<DeviceProfile> | null>(null);
  const [expandedScenario, setExpandedScenario] = useState<string | null>(null);
  const [performanceMetrics, setPerformanceMetrics] = useState<any>(null);
  const [accessibilityResults, setAccessibilityResults] = useState<any>(null);
  const [testingEnabled, setTestingEnabled] = useState(true);
  const [autoRefresh, setAutoRefresh] = useState(false);

  useEffect(() => {
    if (open) {
      setCurrentDevice(detectCurrentDevice());
      if (testingEnabled) {
        runAccessibilityCheck();
        if (autoRefresh) {
          const interval = setInterval(() => {
            setCurrentDevice(detectCurrentDevice());
            runAccessibilityCheck();
          }, 5000);
          return () => clearInterval(interval);
        }
      }
    }
  }, [open, testingEnabled, autoRefresh]);

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue);
  };

  const getDeviceIcon = (category: string) => {
    switch (category) {
      case 'mobile': return <MobileIcon />;
      case 'tablet': return <TabletIcon />;
      case 'desktop': return <DesktopIcon />;
      default: return <DeviceIcon />;
    }
  };

  const getDeviceColor = (category: string) => {
    switch (category) {
      case 'mobile': return 'primary';
      case 'tablet': return 'secondary';
      case 'desktop': return 'success';
      default: return 'default';
    }
  };

  const runPerformanceTest = async () => {
    try {
      const metrics = await measurePerformance();
      setPerformanceMetrics(metrics);
    } catch (error) {
      console.error('Performance test failed:', error);
    }
  };

  const runAccessibilityCheck = () => {
    const results = checkAccessibility();
    setAccessibilityResults(results);
  };

  const getPerformanceScore = (metrics: any) => {
    if (!metrics) return 0;

    let score = 100;
    if (metrics.lcp > 2500) score -= 25;
    if (metrics.fid > 100) score -= 25;
    if (metrics.cls > 0.1) score -= 25;
    if (metrics.fcp > 1800) score -= 25;

    return Math.max(0, score);
  };

  const getAccessibilityScore = (results: any) => {
    if (!results) return 0;

    const total = Object.keys(results).length;
    const passed = Object.values(results).filter(Boolean).length;
    return Math.round((passed / total) * 100);
  };

  if (!open) return null;

  return (
    <Card sx={{
      position: 'fixed',
      top: { xs: 0, md: 20 },
      right: { xs: 0, md: 20 },
      bottom: { xs: 0, md: 20 },
      left: { xs: 0, md: 'auto' },
      width: { xs: '100%', md: 450 },
      zIndex: 1300,
      overflow: 'auto',
      maxHeight: '90vh'
    }}>
      <CardContent sx={{ p: { xs: 2, md: 3 } }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="h6" component="h2">
            📱 크로스 디바이스 테스팅
          </Typography>
          <IconButton onClick={onClose} size="small">
            ✕
          </IconButton>
        </Box>

        {/* Testing Toggle */}
        <Box sx={{ mb: 3 }}>
          <FormControlLabel
            control={
              <Switch
                checked={testingEnabled}
                onChange={(e) => setTestingEnabled(e.target.checked)}
              />
            }
            label="테스팅 활성화"
          />
          <FormControlLabel
            control={
              <Switch
                checked={autoRefresh}
                onChange={(e) => setAutoRefresh(e.target.checked)}
                disabled={!testingEnabled}
              />
            }
            label="자동 새로고침"
          />
        </Box>

        {/* Current Device Info */}
        {currentDevice && (
          <Alert severity="info" sx={{ mb: 2 }}>
            <Typography variant="body2">
              <strong>현재 디바이스:</strong> {currentDevice.width}×{currentDevice.height}
              ({currentDevice.category}) - 터치: {currentDevice.touchCapable ? '지원' : '미지원'}
            </Typography>
          </Alert>
        )}

        <Tabs
          value={activeTab}
          onChange={handleTabChange}
          variant="fullWidth"
          sx={{ mb: 2 }}
        >
          <Tab label="디바이스" icon={<DeviceIcon />} />
          <Tab label="시나리오" icon={<LayoutIcon />} />
          <Tab label="성능" icon={<PerformanceIcon />} />
          <Tab label="접근성" icon={<AccessibilityIcon />} />
        </Tabs>

        {/* Device Profiles Tab */}
        {activeTab === 0 && (
          <Box>
            <Typography variant="subtitle1" gutterBottom>
              📱 지원 디바이스 프로필
            </Typography>
            <List dense>
              {DEVICE_PROFILES.map((device, index) => (
                <ListItemButton
                  key={index}
                  selected={selectedDevice?.name === device.name}
                  onClick={() => setSelectedDevice(device)}
                >
                  <ListItemIcon>
                    {getDeviceIcon(device.category)}
                  </ListItemIcon>
                  <ListItemText
                    primary={device.name}
                    secondary={`${device.width}×${device.height} - ${device.description}`}
                  />
                  <Chip
                    label={device.category}
                    size="small"
                    color={getDeviceColor(device.category) as any}
                    variant="outlined"
                  />
                </ListItemButton>
              ))}
            </List>

            {selectedDevice && (
              <Card variant="outlined" sx={{ mt: 2 }}>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    {selectedDevice.name}
                  </Typography>
                  <Table size="small">
                    <TableBody>
                      <TableRow>
                        <TableCell>해상도</TableCell>
                        <TableCell>{selectedDevice.width}×{selectedDevice.height}</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell>픽셀 비율</TableCell>
                        <TableCell>{selectedDevice.pixelRatio}x</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell>방향</TableCell>
                        <TableCell>{selectedDevice.orientation}</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell>터치 지원</TableCell>
                        <TableCell>{selectedDevice.touchCapable ? '지원' : '미지원'}</TableCell>
                      </TableRow>
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            )}
          </Box>
        )}

        {/* Test Scenarios Tab */}
        {activeTab === 1 && (
          <Box>
            <Typography variant="subtitle1" gutterBottom>
              🧪 테스트 시나리오
            </Typography>
            <List>
              {TEST_SCENARIOS.map((scenario) => (
                <Box key={scenario.id}>
                  <ListItemButton
                    onClick={() => setExpandedScenario(
                      expandedScenario === scenario.id ? null : scenario.id
                    )}
                  >
                    <ListItemText
                      primary={scenario.name}
                      secondary={scenario.description}
                    />
                    {expandedScenario === scenario.id ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                  </ListItemButton>
                  <Collapse in={expandedScenario === scenario.id}>
                    <Box sx={{ pl: 4, pr: 2, pb: 2 }}>
                      <Typography variant="body2" gutterBottom>
                        <strong>테스트 디바이스:</strong>
                      </Typography>
                      <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap', mb: 1 }}>
                        {scenario.devices.map((device) => (
                          <Chip key={device} label={device} size="small" variant="outlined" />
                        ))}
                      </Box>

                      <Typography variant="body2" gutterBottom>
                        <strong>테스트 경로:</strong>
                      </Typography>
                      <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap', mb: 1 }}>
                        {scenario.routes.map((route) => (
                          <Chip key={route} label={route} size="small" color="primary" variant="outlined" />
                        ))}
                      </Box>

                      <Typography variant="body2" gutterBottom>
                        <strong>상호작용:</strong>
                      </Typography>
                      <List dense>
                        {scenario.interactions.map((interaction, idx) => (
                          <ListItem key={idx} sx={{ py: 0.5 }}>
                            <ListItemIcon sx={{ minWidth: 30 }}>
                              <TouchIcon fontSize="small" />
                            </ListItemIcon>
                            <ListItemText
                              primary={interaction}
                              primaryTypographyProps={{ variant: 'body2' }}
                            />
                          </ListItem>
                        ))}
                      </List>

                      <Typography variant="body2" gutterBottom>
                        <strong>기대 결과:</strong>
                      </Typography>
                      <List dense>
                        {scenario.expectedBehavior.map((behavior, idx) => (
                          <ListItem key={idx} sx={{ py: 0.5 }}>
                            <ListItemIcon sx={{ minWidth: 30 }}>
                              <CheckIcon fontSize="small" color="success" />
                            </ListItemIcon>
                            <ListItemText
                              primary={behavior}
                              primaryTypographyProps={{ variant: 'body2' }}
                            />
                          </ListItem>
                        ))}
                      </List>

                      <Button
                        size="small"
                        variant="outlined"
                        onClick={() => setSelectedScenario(scenario)}
                        sx={{ mt: 1 }}
                      >
                        이 시나리오 실행
                      </Button>
                    </Box>
                  </Collapse>
                  <Divider />
                </Box>
              ))}
            </List>
          </Box>
        )}

        {/* Performance Tab */}
        {activeTab === 2 && (
          <Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="subtitle1">
                ⚡ 성능 메트릭
              </Typography>
              <Button
                size="small"
                variant="outlined"
                onClick={runPerformanceTest}
                startIcon={<RefreshIcon />}
              >
                측정
              </Button>
            </Box>

            {performanceMetrics && (
              <>
                <Box sx={{ mb: 2 }}>
                  <Typography variant="body2" gutterBottom>
                    전체 성능 점수
                  </Typography>
                  <LinearProgress
                    variant="determinate"
                    value={getPerformanceScore(performanceMetrics)}
                    color={getPerformanceScore(performanceMetrics) > 80 ? 'success' : 'warning'}
                    sx={{ height: 8, borderRadius: 1 }}
                  />
                  <Typography variant="caption">
                    {getPerformanceScore(performanceMetrics)}/100
                  </Typography>
                </Box>

                <TableContainer component={Paper} variant="outlined">
                  <Table size="small">
                    <TableHead>
                      <TableRow>
                        <TableCell>메트릭</TableCell>
                        <TableCell align="right">값</TableCell>
                        <TableCell align="right">기준</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      <TableRow>
                        <TableCell>FCP</TableCell>
                        <TableCell align="right">{performanceMetrics.fcp.toFixed(0)}ms</TableCell>
                        <TableCell align="right">
                          <Chip
                            label={performanceMetrics.fcp < 1800 ? '좋음' : '개선필요'}
                            size="small"
                            color={performanceMetrics.fcp < 1800 ? 'success' : 'warning'}
                          />
                        </TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell>LCP</TableCell>
                        <TableCell align="right">{performanceMetrics.lcp.toFixed(0)}ms</TableCell>
                        <TableCell align="right">
                          <Chip
                            label={performanceMetrics.lcp < 2500 ? '좋음' : '개선필요'}
                            size="small"
                            color={performanceMetrics.lcp < 2500 ? 'success' : 'warning'}
                          />
                        </TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell>FID</TableCell>
                        <TableCell align="right">{performanceMetrics.fid.toFixed(0)}ms</TableCell>
                        <TableCell align="right">
                          <Chip
                            label={performanceMetrics.fid < 100 ? '좋음' : '개선필요'}
                            size="small"
                            color={performanceMetrics.fid < 100 ? 'success' : 'warning'}
                          />
                        </TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell>CLS</TableCell>
                        <TableCell align="right">{performanceMetrics.cls.toFixed(3)}</TableCell>
                        <TableCell align="right">
                          <Chip
                            label={performanceMetrics.cls < 0.1 ? '좋음' : '개선필요'}
                            size="small"
                            color={performanceMetrics.cls < 0.1 ? 'success' : 'warning'}
                          />
                        </TableCell>
                      </TableRow>
                    </TableBody>
                  </Table>
                </TableContainer>
              </>
            )}
          </Box>
        )}

        {/* Accessibility Tab */}
        {activeTab === 3 && (
          <Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="subtitle1">
                ♿ 접근성 검사
              </Typography>
              <Button
                size="small"
                variant="outlined"
                onClick={runAccessibilityCheck}
                startIcon={<RefreshIcon />}
              >
                검사
              </Button>
            </Box>

            {accessibilityResults && (
              <>
                <Box sx={{ mb: 2 }}>
                  <Typography variant="body2" gutterBottom>
                    접근성 점수
                  </Typography>
                  <LinearProgress
                    variant="determinate"
                    value={getAccessibilityScore(accessibilityResults)}
                    color={getAccessibilityScore(accessibilityResults) > 80 ? 'success' : 'error'}
                    sx={{ height: 8, borderRadius: 1 }}
                  />
                  <Typography variant="caption">
                    {getAccessibilityScore(accessibilityResults)}/100
                  </Typography>
                </Box>

                <List>
                  {Object.entries(accessibilityResults).map(([key, passed]) => (
                    <ListItem key={key} disablePadding>
                      <ListItemIcon>
                        {passed ? (
                          <CheckIcon color="success" />
                        ) : (
                          <ErrorIcon color="error" />
                        )}
                      </ListItemIcon>
                      <ListItemText
                        primary={
                          key === 'imagesHaveAltText' ? '이미지 대체 텍스트' :
                          key === 'buttonsHaveLabels' ? '버튼 라벨' :
                          key === 'formsHaveLabels' ? '폼 라벨' :
                          key === 'colorContrast' ? '색상 대비' :
                          key === 'keyboardNavigation' ? '키보드 네비게이션' :
                          key
                        }
                        secondary={passed ? '통과' : '개선 필요'}
                      />
                    </ListItem>
                  ))}
                </List>
              </>
            )}
          </Box>
        )}

        {/* Quick Actions */}
        <Box sx={{ mt: 3, pt: 2, borderTop: '1px solid', borderColor: 'divider' }}>
          <Typography variant="subtitle2" gutterBottom>
            빠른 액션
          </Typography>
          <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
            <Button
              size="small"
              variant="outlined"
              onClick={() => testBreakpoints()}
              startIcon={<LayoutIcon />}
            >
              브레이크포인트 테스트
            </Button>
            <Button
              size="small"
              variant="outlined"
              onClick={() => {
                const report = {
                  device: currentDevice,
                  performance: performanceMetrics,
                  accessibility: accessibilityResults,
                  timestamp: new Date().toISOString()
                };
                console.log('테스트 리포트:', report);
                alert('테스트 리포트가 콘솔에 출력되었습니다.');
              }}
              startIcon={<ReportIcon />}
            >
              리포트 생성
            </Button>
          </Box>
        </Box>
      </CardContent>
    </Card>
  );
};

export default DeviceTestingPanel;