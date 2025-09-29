import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Breadcrumbs,
  Link,
  Container,
  Alert,
  Snackbar,
  Card,
  CardContent,
  CardActions,
  Button,
  Chip,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Divider,
  TextField,
  InputAdornment,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Tab,
  Tabs,
  Badge,
  Paper,
  Grid,
  Fab,
  useTheme,
  useMediaQuery,
  Collapse,
  LinearProgress,
  Avatar
} from '@mui/material';
import {
  Folder as FolderIcon,
  Home as HomeIcon,
  InsertDriveFile as FileIcon,
  CloudUpload as UploadIcon,
  CloudDownload as DownloadIcon,
  Delete as DeleteIcon,
  Visibility as ViewIcon,
  Code as JsonIcon,
  Image as ImageIcon,
  Map as MapIcon,
  SmartToy as RoiIcon,
  School as LearningIcon,
  Quiz as TestIcon,
  Search as SearchIcon,
  FilterList as FilterIcon,
  Sort as SortIcon,
  Add as AddIcon,
  History as HistoryIcon,
  Star as StarIcon,
  Share as ShareIcon,
  Edit as EditIcon,
  Info as InfoIcon,
  ExpandMore as ExpandMoreIcon,
  ExpandLess as ExpandLessIcon,
  Timeline as ActivityIcon,
  Storage as StorageIcon,
  Assessment as QuizIcon,
  TrendingUp as TimelineIcon
} from '@mui/icons-material';
import { useNavigate, useSearchParams, useParams } from 'react-router-dom';
import { touchFriendly, responsiveSpacing, responsiveGrid } from '../styles/responsive';

interface FileCategory {
  id: string;
  title: string;
  description: string;
  icon: React.ReactElement;
  color: string;
  fileCount: number;
  lastUpdated: string;
  fileType: 'json' | 'folder' | 'image';
  size: string;
  subCategories?: FileSubCategory[];
  recentFiles?: RecentFile[];
  starred?: boolean;
}

interface FileSubCategory {
  id: string;
  name: string;
  count: number;
  icon: React.ReactElement;
}

interface RecentFile {
  id: string;
  name: string;
  size: string;
  modified: string;
  type: string;
}

interface Activity {
  id: string;
  type: 'upload' | 'download' | 'delete' | 'modify';
  fileName: string;
  timestamp: string;
  user: string;
}

const ProjectFileRepositoryPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { projectId: routeProjectId } = useParams<{ projectId: string }>();
  const [projectId, setProjectId] = useState<string>('');
  const [showAlert, setShowAlert] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<FileCategory | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploading, setUploading] = useState(false);

  const fileCategories: FileCategory[] = [
    {
      id: 'roi-json',
      title: 'ROI 작업 파일',
      description: 'ROI(관심영역) 설정 정보가 저장된 JSON 파일들',
      icon: <RoiIcon />,
      color: '#1976d2',
      fileCount: 15,
      lastUpdated: '2025-01-15',
      fileType: 'json',
      size: '2.3 MB',
      starred: true,
      subCategories: [
        { id: 'active', name: '활성 ROI', count: 8, icon: <StarIcon fontSize="small" /> },
        { id: 'archived', name: '보관된 ROI', count: 5, icon: <FolderIcon fontSize="small" /> },
        { id: 'templates', name: 'ROI 템플릿', count: 2, icon: <EditIcon fontSize="small" /> }
      ],
      recentFiles: [
        { id: '1', name: 'parking_lot_A_roi.json', size: '156KB', modified: '2시간 전', type: 'ROI 설정' },
        { id: '2', name: 'entrance_roi_config.json', size: '89KB', modified: '1일 전', type: 'ROI 설정' },
        { id: '3', name: 'exit_roi_template.json', size: '45KB', modified: '3일 전', type: 'ROI 템플릿' }
      ]
    },
    {
      id: 'map-data',
      title: '맵 데이터 파일',
      description: '주차장 맵 구조 및 레이아웃 정보 파일들',
      icon: <MapIcon />,
      color: '#388e3c',
      fileCount: 8,
      lastUpdated: '2025-01-14',
      fileType: 'json',
      size: '5.7 MB',
      subCategories: [
        { id: 'raw', name: '원본 맵', count: 3, icon: <FileIcon fontSize="small" /> },
        { id: 'processed', name: '처리된 맵', count: 2, icon: <JsonIcon fontSize="small" /> },
        { id: 'layouts', name: '레이아웃', count: 3, icon: <MapIcon fontSize="small" /> }
      ],
      recentFiles: [
        { id: '1', name: 'main_parking_layout.json', size: '2.1MB', modified: '6시간 전', type: '주 주차장' },
        { id: '2', name: 'overflow_area_map.json', size: '856KB', modified: '1일 전', type: '부 주차장' }
      ]
    },
    {
      id: 'learning-images',
      title: '학습 이미지',
      description: '머신러닝 학습에 사용되는 이미지 데이터셋',
      icon: <LearningIcon />,
      color: '#7b1fa2',
      fileCount: 1250,
      lastUpdated: '2025-01-13',
      fileType: 'folder',
      size: '485 MB',
      starred: true,
      subCategories: [
        { id: 'daylight', name: '주간 이미지', count: 850, icon: <ImageIcon fontSize="small" /> },
        { id: 'night', name: '야간 이미지', count: 300, icon: <ImageIcon fontSize="small" /> },
        { id: 'weather', name: '기상별 이미지', count: 100, icon: <ImageIcon fontSize="small" /> }
      ],
      recentFiles: [
        { id: '1', name: 'batch_2025_01_15.zip', size: '45MB', modified: '3시간 전', type: '배치 업로드' },
        { id: '2', name: 'night_samples.zip', size: '23MB', modified: '2일 전', type: '야간 샘플' }
      ]
    },
    {
      id: 'test-images',
      title: '테스트 이미지',
      description: '알고리즘 검증 및 테스트용 이미지들',
      icon: <TestIcon />,
      color: '#c62828',
      fileCount: 320,
      lastUpdated: '2025-01-12',
      fileType: 'folder',
      size: '125 MB',
      subCategories: [
        { id: 'validation', name: '검증 세트', count: 200, icon: <QuizIcon fontSize="small" /> },
        { id: 'benchmark', name: '벤치마크', count: 80, icon: <TimelineIcon fontSize="small" /> },
        { id: 'edge-cases', name: '엣지 케이스', count: 40, icon: <InfoIcon fontSize="small" /> }
      ],
      recentFiles: [
        { id: '1', name: 'validation_set_v2.zip', size: '38MB', modified: '1일 전', type: '검증 세트' },
        { id: '2', name: 'edge_case_samples.zip', size: '12MB', modified: '4일 전', type: '엣지 케이스' }
      ]
    },
    {
      id: 'results',
      title: '처리 결과',
      description: '알고리즘 처리 결과 및 분석 데이터',
      icon: <StorageIcon />,
      color: '#f57c00',
      fileCount: 45,
      lastUpdated: '2025-01-15',
      fileType: 'json',
      size: '12.8 MB',
      subCategories: [
        { id: 'analysis', name: '분석 결과', count: 25, icon: <ActivityIcon fontSize="small" /> },
        { id: 'logs', name: '처리 로그', count: 15, icon: <HistoryIcon fontSize="small" /> },
        { id: 'reports', name: '보고서', count: 5, icon: <FileIcon fontSize="small" /> }
      ],
      recentFiles: [
        { id: '1', name: 'analysis_2025_01_15.json', size: '3.2MB', modified: '30분 전', type: '최신 분석' },
        { id: '2', name: 'weekly_report.pdf', size: '1.8MB', modified: '2시간 전', type: '주간 보고서' }
      ]
    }
  ];

  const recentActivity: Activity[] = [
    { id: '1', type: 'upload', fileName: 'parking_lot_A_roi.json', timestamp: '2시간 전', user: '관리자' },
    { id: '2', type: 'download', fileName: 'main_parking_layout.json', timestamp: '6시간 전', user: '개발자' },
    { id: '3', type: 'modify', fileName: 'entrance_roi_config.json', timestamp: '1일 전', user: '관리자' },
    { id: '4', type: 'upload', fileName: 'batch_2025_01_15.zip', timestamp: '3시간 전', user: '시스템' },
    { id: '5', type: 'delete', fileName: 'old_test_data.zip', timestamp: '2일 전', user: '관리자' }
  ];

  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [activeTab, setActiveTab] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('lastUpdated');
  const [filterBy, setFilterBy] = useState('all');
  const [expandedCategory, setExpandedCategory] = useState<string | null>(null);

  useEffect(() => {
    // Get project ID from URL params or localStorage
    const urlProjectId = searchParams.get('projectId') || routeProjectId;
    const storedProjectId = localStorage.getItem('selectedProjectId');

    if (urlProjectId) {
      setProjectId(urlProjectId);
      localStorage.setItem('selectedProjectId', urlProjectId);
    } else if (storedProjectId) {
      setProjectId(storedProjectId);
    } else {
      // No project selected, show alert and redirect
      setShowAlert(true);
      setTimeout(() => {
        navigate('/', {
          state: { message: '파일 보관함을 사용하려면 먼저 프로젝트를 선택해주세요.' }
        });
      }, 3000);
    }
  }, [searchParams, navigate]);

  const handleCategoryClick = (category: FileCategory) => {
    setSelectedCategory(category);
    setDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
    setSelectedCategory(null);
  };

  const getFileTypeIcon = (fileType: string) => {
    switch (fileType) {
      case 'json':
        return <JsonIcon color="action" />;
      case 'folder':
        return <FolderIcon color="action" />;
      case 'image':
        return <ImageIcon color="action" />;
      default:
        return <FileIcon color="action" />;
    }
  };

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'upload':
        return <UploadIcon color="primary" fontSize="small" />;
      case 'download':
        return <DownloadIcon color="success" fontSize="small" />;
      case 'modify':
        return <EditIcon color="info" fontSize="small" />;
      case 'delete':
        return <DeleteIcon color="error" fontSize="small" />;
      default:
        return <FileIcon color="action" fontSize="small" />;
    }
  };

  const getActivityColor = (type: string) => {
    switch (type) {
      case 'upload': return 'primary';
      case 'download': return 'success';
      case 'modify': return 'info';
      case 'delete': return 'error';
      default: return 'default';
    }
  };

  const filteredCategories = fileCategories.filter(category => {
    const matchesSearch = category.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         category.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter = filterBy === 'all' || category.fileType === filterBy ||
                         (filterBy === 'starred' && category.starred);
    return matchesSearch && matchesFilter;
  });

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue);
  };

  const handleExpandCategory = (categoryId: string) => {
    setExpandedCategory(expandedCategory === categoryId ? null : categoryId);
  };

  const handleUpload = () => {
    setUploading(true);
    setUploadProgress(0);
    // Simulate upload progress
    const interval = setInterval(() => {
      setUploadProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          setUploading(false);
          return 0;
        }
        return prev + 10;
      });
    }, 200);
  };

  if (!projectId) {
    return (
      <Container maxWidth="lg">
        <Box sx={{ mt: 4, textAlign: 'center' }}>
          <Alert severity="warning" sx={{ mb: 2 }}>
            프로젝트 파일 보관함을 사용하려면 먼저 프로젝트를 선택해주세요.
          </Alert>
          <Typography variant="body1" color="text.secondary">
            3초 후 프로젝트 선택 페이지로 이동합니다...
          </Typography>
        </Box>
        <Snackbar
          open={showAlert}
          onClose={() => setShowAlert(false)}
          message="프로젝트를 선택해주세요"
        />
      </Container>
    );
  }

  return (
    <Container maxWidth="xl" sx={{ ...responsiveSpacing.pagePadding, pb: { xs: 10, md: 3 } }}>
      {/* Mobile-optimized Breadcrumb Navigation */}
      <Box sx={{ mb: 2 }}>
        <Breadcrumbs
          aria-label="breadcrumb"
          sx={{
            '& .MuiBreadcrumbs-separator': {
              mx: { xs: 0.5, sm: 1 }
            }
          }}
        >
          <Link
            color="inherit"
            onClick={() => navigate('/')}
            sx={{
              display: 'flex',
              alignItems: 'center',
              cursor: 'pointer',
              fontSize: { xs: '0.875rem', sm: '1rem' }
            }}
          >
            <HomeIcon sx={{ mr: 0.5, fontSize: { xs: 16, sm: 20 } }} />
            <Box sx={{ display: { xs: 'none', sm: 'block' } }}>프로젝트 선택</Box>
            <Box sx={{ display: { xs: 'block', sm: 'none' } }}>홈</Box>
          </Link>
          <Link
            color="inherit"
            onClick={() => navigate(`/project/${projectId}`)}
            sx={{
              display: 'flex',
              alignItems: 'center',
              cursor: 'pointer',
              fontSize: { xs: '0.875rem', sm: '1rem' }
            }}
          >
            프로젝트 {projectId}
          </Link>
          <Typography
            color="text.primary"
            sx={{
              display: 'flex',
              alignItems: 'center',
              fontSize: { xs: '0.875rem', sm: '1rem' }
            }}
          >
            <FolderIcon sx={{ mr: 0.5, fontSize: { xs: 16, sm: 20 } }} />
            파일 보관함
          </Typography>
        </Breadcrumbs>
      </Box>

      {/* Page Header */}
      <Box sx={{ mb: 4, textAlign: { xs: 'left', sm: 'center' } }}>
        <Box sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: { xs: 'flex-start', sm: 'center' },
          mb: 1
        }}>
          <FolderIcon sx={{
            fontSize: { xs: 32, sm: 40, md: 48 },
            color: 'primary.main',
            mr: 1.5
          }} />
          <Typography
            variant="h4"
            component="h1"
            color="primary.main"
            sx={{
              fontSize: { xs: '1.5rem', sm: '2rem', md: '2.5rem' }
            }}
          >
            프로젝트 파일 보관함
          </Typography>
        </Box>
        <Typography
          variant="body1"
          color="text.secondary"
          sx={{
            fontSize: { xs: '0.875rem', sm: '1rem' },
            mb: 2
          }}
        >
          프로젝트 파일을 종류별로 관리하고 다운로드할 수 있습니다
        </Typography>
        <Typography variant="body2" color="text.secondary">
          프로젝트 ID: {projectId}
        </Typography>
      </Box>

      {/* Search and Filter Bar */}
      <Paper sx={{ p: { xs: 2, sm: 3 }, mb: 3, ...responsiveSpacing.cardPadding }}>
        <Box sx={{
          display: 'flex',
          flexDirection: { xs: 'column', sm: 'row' },
          gap: 2,
          alignItems: { xs: 'stretch', sm: 'center' },
          mb: 2
        }}>
          <TextField
            placeholder="파일 검색..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            size={isMobile ? "small" : "medium"}
            sx={{ flex: 1, maxWidth: { xs: '100%', sm: 400 } }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon />
                </InputAdornment>
              )
            }}
          />

          <Box sx={{
            display: 'flex',
            gap: 1,
            flexWrap: 'wrap',
            '& > *': { flex: { xs: 1, sm: 'none' } }
          }}>
            <FormControl size={isMobile ? "small" : "medium"} sx={{ minWidth: 120 }}>
              <InputLabel>필터</InputLabel>
              <Select
                value={filterBy}
                label="필터"
                onChange={(e) => setFilterBy(e.target.value)}
              >
                <MenuItem value="all">전체</MenuItem>
                <MenuItem value="json">JSON 파일</MenuItem>
                <MenuItem value="folder">폴더</MenuItem>
                <MenuItem value="image">이미지</MenuItem>
                <MenuItem value="starred">즐겨찾기</MenuItem>
              </Select>
            </FormControl>

            <FormControl size={isMobile ? "small" : "medium"} sx={{ minWidth: 120 }}>
              <InputLabel>정렬</InputLabel>
              <Select
                value={sortBy}
                label="정렬"
                onChange={(e) => setSortBy(e.target.value)}
              >
                <MenuItem value="lastUpdated">최근 수정</MenuItem>
                <MenuItem value="name">이름</MenuItem>
                <MenuItem value="size">크기</MenuItem>
                <MenuItem value="fileCount">파일 수</MenuItem>
              </Select>
            </FormControl>
          </Box>
        </Box>
      </Paper>

      {/* Tabs for Different Views */}
      <Box sx={{ mb: 3 }}>
        <Tabs
          value={activeTab}
          onChange={handleTabChange}
          variant={isMobile ? "fullWidth" : "standard"}
          scrollButtons="auto"
          allowScrollButtonsMobile
        >
          <Tab label="파일 카테고리" />
          <Tab label="최근 활동" />
          <Tab label="즐겨찾기" />
        </Tabs>
      </Box>

      {/* Tab Content */}
      {activeTab === 0 && (
        <Box sx={{ mb: 3 }}>
          {/* File Categories Grid */}
          <Box sx={{
            display: 'grid',
            gap: { xs: 2, sm: 3 },
            gridTemplateColumns: {
              xs: '1fr',
              sm: 'repeat(auto-fit, minmax(350px, 1fr))'
            }
          }}>
            {filteredCategories.map((category) => (
              <Card
                key={category.id}
                elevation={2}
                sx={{
                  cursor: 'pointer',
                  transition: 'all 0.3s',
                  '&:hover': {
                    transform: { xs: 'none', sm: 'translateY(-4px)' },
                    boxShadow: { xs: 2, sm: 6 },
                  },
                  border: category.starred ? `2px solid ${category.color}20` : 'none'
                }}
                onClick={() => handleCategoryClick(category)}
              >
                <CardContent sx={{ ...responsiveSpacing.cardPadding }}>
                  <Box sx={{ display: 'flex', alignItems: 'flex-start', mb: 2 }}>
                    <Box sx={{
                      color: category.color,
                      mr: 2,
                      fontSize: { xs: 28, sm: 32 },
                      display: 'flex',
                      alignItems: 'center'
                    }}>
                      {category.icon}
                    </Box>
                    <Box sx={{ flexGrow: 1, minWidth: 0 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                        <Typography
                          variant="h6"
                          component="h3"
                          sx={{
                            fontSize: { xs: '1rem', sm: '1.25rem' },
                            fontWeight: 600
                          }}
                          noWrap
                        >
                          {category.title}
                        </Typography>
                        {category.starred && (
                          <StarIcon sx={{ color: 'gold', fontSize: 18 }} />
                        )}
                      </Box>
                      <Box sx={{
                        display: 'flex',
                        gap: 1,
                        flexWrap: 'wrap',
                        mb: 1
                      }}>
                        <Chip
                          label={`${category.fileCount}개`}
                          size="small"
                          color="primary"
                          variant="outlined"
                        />
                        <Chip
                          label={category.size}
                          size="small"
                          variant="outlined"
                        />
                      </Box>
                    </Box>
                    <IconButton
                      size="small"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleExpandCategory(category.id);
                      }}
                    >
                      {expandedCategory === category.id ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                    </IconButton>
                  </Box>

                  <Typography
                    variant="body2"
                    color="text.secondary"
                    paragraph
                    sx={{ fontSize: { xs: '0.875rem', sm: '1rem' } }}
                  >
                    {category.description}
                  </Typography>

                  <Typography
                    variant="caption"
                    color="text.secondary"
                    sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' } }}
                  >
                    마지막 업데이트: {category.lastUpdated}
                  </Typography>

                  {/* Expanded Content */}
                  <Collapse in={expandedCategory === category.id}>
                    <Divider sx={{ my: 2 }} />

                    {/* Sub-categories */}
                    {category.subCategories && (
                      <Box sx={{ mb: 2 }}>
                        <Typography variant="subtitle2" gutterBottom>
                          하위 카테고리
                        </Typography>
                        <Box sx={{
                          display: 'flex',
                          flexWrap: 'wrap',
                          gap: 1
                        }}>
                          {category.subCategories.map((sub) => (
                            <Chip
                              key={sub.id}
                              icon={sub.icon}
                              label={`${sub.name} (${sub.count})`}
                              variant="outlined"
                              size="small"
                              clickable
                            />
                          ))}
                        </Box>
                      </Box>
                    )}

                    {/* Recent Files */}
                    {category.recentFiles && (
                      <Box>
                        <Typography variant="subtitle2" gutterBottom>
                          최근 파일
                        </Typography>
                        <List dense>
                          {category.recentFiles.slice(0, 3).map((file) => (
                            <ListItem key={file.id} disablePadding>
                              <ListItemIcon>
                                {getFileTypeIcon(category.fileType)}
                              </ListItemIcon>
                              <ListItemText
                                primary={file.name}
                                secondary={`${file.size} • ${file.modified}`}
                                primaryTypographyProps={{
                                  fontSize: { xs: '0.875rem', sm: '1rem' },
                                  noWrap: true
                                }}
                                secondaryTypographyProps={{
                                  fontSize: { xs: '0.75rem', sm: '0.875rem' }
                                }}
                              />
                            </ListItem>
                          ))}
                        </List>
                      </Box>
                    )}
                  </Collapse>
                </CardContent>

                <CardActions sx={{
                  justifyContent: 'space-between',
                  px: { xs: 2, sm: 3 },
                  pb: { xs: 1.5, sm: 2 }
                }}>
                  <Button
                    size={isMobile ? "small" : "medium"}
                    color="primary"
                    startIcon={<ViewIcon />}
                    sx={{ ...touchFriendly.button }}
                  >
                    보기
                  </Button>
                  <Box sx={{ display: 'flex', gap: 0.5 }}>
                    <IconButton
                      size="small"
                      color="primary"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleUpload();
                      }}
                      sx={{ ...touchFriendly.button, minWidth: 'auto' }}
                    >
                      <UploadIcon fontSize={isMobile ? "small" : "medium"} />
                    </IconButton>
                    <IconButton
                      size="small"
                      color="primary"
                      sx={{ ...touchFriendly.button, minWidth: 'auto' }}
                    >
                      <DownloadIcon fontSize={isMobile ? "small" : "medium"} />
                    </IconButton>
                    <IconButton
                      size="small"
                      sx={{ ...touchFriendly.button, minWidth: 'auto' }}
                    >
                      <ShareIcon fontSize={isMobile ? "small" : "medium"} />
                    </IconButton>
                  </Box>
                </CardActions>
              </Card>
            ))}
          </Box>
        </Box>
      )}

      {/* Recent Activity Tab */}
      {activeTab === 1 && (
        <Card sx={{ mb: 3 }}>
          <CardContent sx={{ ...responsiveSpacing.cardPadding }}>
            <Typography variant="h6" gutterBottom sx={{
              display: 'flex',
              alignItems: 'center',
              gap: 1
            }}>
              <ActivityIcon />
              최근 활동
            </Typography>
            <List>
              {recentActivity.map((activity) => (
                <ListItem key={activity.id} divider>
                  <ListItemIcon>
                    <Avatar sx={{ width: 32, height: 32, bgcolor: `${getActivityColor(activity.type)}.light` }}>
                      {getActivityIcon(activity.type)}
                    </Avatar>
                  </ListItemIcon>
                  <ListItemText
                    primary={
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
                        <Typography
                          variant="body2"
                          component="span"
                          sx={{ fontSize: { xs: '0.875rem', sm: '1rem' } }}
                        >
                          {activity.fileName}
                        </Typography>
                        <Chip
                          label={activity.type}
                          size="small"
                          color={getActivityColor(activity.type) as any}
                          variant="outlined"
                        />
                      </Box>
                    }
                    secondary={`${activity.user} • ${activity.timestamp}`}
                    secondaryTypographyProps={{
                      fontSize: { xs: '0.75rem', sm: '0.875rem' }
                    }}
                  />
                </ListItem>
              ))}
            </List>
          </CardContent>
        </Card>
      )}

      {/* Favorites Tab */}
      {activeTab === 2 && (
        <Box>
          {fileCategories.filter(cat => cat.starred).length > 0 ? (
            <Box sx={{
              display: 'grid',
              gap: { xs: 2, sm: 3 },
              gridTemplateColumns: {
                xs: '1fr',
                sm: 'repeat(auto-fit, minmax(350px, 1fr))'
              }
            }}>
              {fileCategories.filter(cat => cat.starred).map((category) => (
                <Card key={category.id} elevation={2}>
                  <CardContent sx={{ ...responsiveSpacing.cardPadding }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                      <Box sx={{ color: category.color, mr: 2, fontSize: 32 }}>
                        {category.icon}
                      </Box>
                      <Box sx={{ flexGrow: 1 }}>
                        <Typography variant="h6" component="h3">
                          {category.title}
                        </Typography>
                        <Chip
                          icon={<StarIcon />}
                          label="즐겨찾기"
                          size="small"
                          color="warning"
                          variant="filled"
                        />
                      </Box>
                    </Box>
                  </CardContent>
                </Card>
              ))}
            </Box>
          ) : (
            <Paper sx={{ p: 4, textAlign: 'center' }}>
              <StarIcon sx={{ fontSize: 64, color: 'grey.400', mb: 2 }} />
              <Typography variant="h6" color="text.secondary" gutterBottom>
                즐겨찾기한 파일이 없습니다
              </Typography>
              <Typography variant="body2" color="text.secondary">
                파일 카테고리에서 별 아이콘을 클릭하여 즐겨찾기에 추가하세요
              </Typography>
            </Paper>
          )}
        </Box>
      )}

      {/* Upload Progress */}
      {uploading && (
        <Paper sx={{
          position: 'fixed',
          bottom: { xs: 80, md: 20 },
          right: 20,
          p: 2,
          minWidth: 250,
          zIndex: 1000
        }}>
          <Typography variant="body2" gutterBottom>
            파일 업로드 중...
          </Typography>
          <LinearProgress variant="determinate" value={uploadProgress} />
          <Typography variant="caption" color="text.secondary">
            {uploadProgress}%
          </Typography>
        </Paper>
      )}

      {/* Floating Action Button */}
      <Fab
        color="primary"
        aria-label="upload"
        onClick={handleUpload}
        disabled={uploading}
        sx={{
          position: 'fixed',
          bottom: { xs: 16, md: 16 },
          right: { xs: 16, md: 16 },
          zIndex: 1000
        }}
      >
        <AddIcon />
      </Fab>

      {/* File Category Detail Dialog */}
      <Dialog
        open={dialogOpen}
        onClose={handleCloseDialog}
        maxWidth="md"
        fullWidth
        fullScreen={window.innerWidth < 600}
      >
        {selectedCategory && (
          <>
            <DialogTitle sx={{ pb: 1 }}>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <Box sx={{ color: selectedCategory.color, mr: 2, fontSize: 28, display: 'flex', alignItems: 'center' }}>
                  {selectedCategory.icon}
                </Box>
                <Box>
                  <Typography variant="h6">
                    {selectedCategory.title}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {selectedCategory.fileCount}개 파일
                  </Typography>
                </Box>
              </Box>
            </DialogTitle>
            <DialogContent>
              <Typography variant="body2" color="text.secondary" paragraph>
                {selectedCategory.description}
              </Typography>

              <Divider sx={{ my: 2 }} />

              <Typography variant="h6" gutterBottom>
                파일 목록
              </Typography>

              <List>
                {Array.from({ length: Math.min(selectedCategory.fileCount, 10) }, (_, index) => (
                  <ListItem key={index} divider>
                    <ListItemIcon>
                      {getFileTypeIcon(selectedCategory.fileType)}
                    </ListItemIcon>
                    <ListItemText
                      primary={`${selectedCategory.fileType}_${index + 1}.${selectedCategory.fileType === 'folder' ? 'folder' : 'json'}`}
                      secondary={`크기: ${Math.floor(Math.random() * 1000 + 100)}KB • 수정일: 2025-01-${String(15 - index).padStart(2, '0')}`}
                    />
                    <Box>
                      <IconButton size="small">
                        <ViewIcon />
                      </IconButton>
                      <IconButton size="small">
                        <DownloadIcon />
                      </IconButton>
                      <IconButton size="small" color="error">
                        <DeleteIcon />
                      </IconButton>
                    </Box>
                  </ListItem>
                ))}
              </List>

              {selectedCategory.fileCount > 10 && (
                <Typography variant="body2" color="text.secondary" sx={{ mt: 2, textAlign: 'center' }}>
                  ... 그리고 {selectedCategory.fileCount - 10}개 파일 더
                </Typography>
              )}
            </DialogContent>
            <DialogActions>
              <Button onClick={handleCloseDialog}>
                닫기
              </Button>
              <Button variant="contained" startIcon={<UploadIcon />}>
                파일 업로드
              </Button>
              <Button variant="outlined" startIcon={<DownloadIcon />}>
                전체 다운로드
              </Button>
            </DialogActions>
          </>
        )}
      </Dialog>
    </Container>
  );
};

export default ProjectFileRepositoryPage;