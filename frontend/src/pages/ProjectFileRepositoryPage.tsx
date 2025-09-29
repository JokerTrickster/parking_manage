import React, { useState, useEffect } from 'react';
import {
  Avatar,
  Box,
  Typography,
  Breadcrumbs,
  Link,
  Container,
  Alert,
  Snackbar,
  Card,
  CardContent,
  Button,
  Paper,
  Chip,
  IconButton,
  CircularProgress,
} from '@mui/material';
import {
  Folder as FolderIcon,
  Home as HomeIcon,
  Image as ImageIcon,
  Videocam as VideoCamIcon,
  Map as MapIcon,
  Engineering as CadIcon,
  Crop as RoiIcon,
  Upload as UploadIcon,
  Refresh as RefreshIcon,
  Download as DownloadIcon,
  Delete as DeleteIcon,
  Visibility as VisibilityIcon,
  InsertDriveFile as FileIcon,
  Search as SearchIcon,
  Settings as SettingsIcon,
} from '@mui/icons-material';
import { useNavigate, useSearchParams, useParams } from 'react-router-dom';

interface FileItem {
  id: string;
  name: string;
  size: string;
  lastModified: string;
  modifiedDate?: string;
  type: string;
  version?: string;
}

interface FileCategory {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  color: string;
  path: string;
  files: FileItem[];
  totalSize: string;
}

const ProjectFileRepositoryPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { projectId: routeProjectId } = useParams<{ projectId: string }>();
  const [projectId, setProjectId] = useState<string>('');
  const [showAlert, setShowAlert] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string>('learning-images');
  const [isLoading, setIsLoading] = useState(false);

  // 파일 카테고리 데이터
  const fileCategories: FileCategory[] = [
    {
      id: 'learning-images',
      title: '학습 이미지 관리',
      description: '머신러닝 모델 훈련용 CCTV 이미지 데이터셋',
      icon: <ImageIcon />,
      color: '#1976d2',
      path: `shared/uploads/learningImages`,
      files: [
        { id: '1', name: 'P1_B2_3_1.jpg', size: '2.4 MB', lastModified: '2024-09-29 10:30', type: 'image/jpeg' },
        { id: '2', name: 'P1_B2_3_2.jpg', size: '2.2 MB', lastModified: '2024-09-29 10:25', type: 'image/jpeg' },
        { id: '3', name: 'P1_B2_4_1.jpg', size: '2.6 MB', lastModified: '2024-09-29 10:20', type: 'image/jpeg' },
      ],
      totalSize: '156.8 MB'
    },
    {
      id: 'test-images',
      title: '테스트 이미지 관리',
      description: '알고리즘 검증 및 성능 측정용 이미지',
      icon: <VideoCamIcon />,
      color: '#388e3c',
      path: `shared/uploads/testImages`,
      files: [
        { id: '4', name: 'test_scenario_1.jpg', size: '1.8 MB', lastModified: '2024-09-29 09:45', type: 'image/jpeg' },
        { id: '5', name: 'test_scenario_2.jpg', size: '1.9 MB', lastModified: '2024-09-29 09:40', type: 'image/jpeg' },
      ],
      totalSize: '42.3 MB'
    },
    {
      id: 'roi-files',
      title: 'ROI 파일 관리',
      description: 'JSON 형식의 관심영역 좌표 데이터',
      icon: <RoiIcon />,
      color: '#f57c00',
      path: `shared/uploads/roiFiles`,
      files: [
        { id: '6', name: 'roi_config_p1.json', size: '12 KB', lastModified: '2024-09-29 14:15', type: 'application/json' },
        { id: '7', name: 'roi_backup_p1.json', size: '11 KB', lastModified: '2024-09-28 16:30', type: 'application/json' },
      ],
      totalSize: '45 KB'
    },
    {
      id: 'cad-data',
      title: 'CAD 데이터 관리',
      description: 'CAD 도면 파일 및 설계 데이터',
      icon: <CadIcon />,
      color: '#7b1fa2',
      path: `shared/${projectId}/cad`,
      files: [
        { id: '8', name: 'parking_layout.dwg', size: '5.2 MB', lastModified: '2024-09-28 11:20', type: 'application/acad' },
        { id: '9', name: 'floor_plan.dxf', size: '3.8 MB', lastModified: '2024-09-27 15:45', type: 'application/dxf' },
      ],
      totalSize: '12.4 MB'
    },
    {
      id: 'map-files',
      title: 'Map 파일 관리',
      description: '주차장 맵 데이터 및 구조 정보',
      icon: <MapIcon />,
      color: '#d32f2f',
      path: `shared/${projectId}/map`,
      files: [
        { id: '10', name: 'parking_map_v1.json', size: '234 KB', lastModified: '2024-09-29 13:20', type: 'application/json' },
        { id: '11', name: 'zone_config.xml', size: '89 KB', lastModified: '2024-09-29 12:15', type: 'application/xml' },
      ],
      totalSize: '445 KB'
    },
  ];

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
          state: { message: '프로젝트 파일 보관함을 사용하려면 먼저 프로젝트를 선택해주세요.' }
        });
      }, 3000);
    }
  }, [searchParams, navigate, routeProjectId]);

  // 헬퍼 함수들
  const handleCategorySelect = (categoryId: string) => {
    setSelectedCategory(categoryId);
    setIsLoading(true);
    // Simulate loading delay
    setTimeout(() => {
      setIsLoading(false);
    }, 500);
  };

  const handleFileUpload = (categoryId: string) => {
    setIsLoading(true);
    // 실제 파일 업로드 로직 구현 예정
    setTimeout(() => {
      setIsLoading(false);
      alert(`${fileCategories.find(cat => cat.id === categoryId)?.title}에 파일 업로드 기능 구현 예정`);
    }, 1000);
  };

  const handleFileDownload = (file: FileItem) => {
    alert(`${file.name} 다운로드 기능 구현 예정`);
  };

  const handleFileDelete = (file: FileItem) => {
    if (window.confirm(`${file.name} 파일을 삭제하시겠습니까?`)) {
      alert(`${file.name} 삭제 기능 구현 예정`);
    }
  };

  const handleFileView = (file: FileItem) => {
    alert(`${file.name} 미리보기 기능 구현 예정`);
  };

  // Additional helper functions for the new UI
  const getCurrentCategory = () => {
    return fileCategories.find(cat => cat.id === selectedCategory);
  };

  const getFileIcon = (fileType: string) => {
    switch (fileType.toLowerCase()) {
      case 'image':
      case 'jpg':
      case 'jpeg':
      case 'png':
      case 'gif':
        return <ImageIcon />;
      case 'cad':
      case 'dwg':
      case 'dxf':
        return <CadIcon />;
      case 'map':
      case 'json':
        return <MapIcon />;
      case 'roi':
        return <RoiIcon />;
      default:
        return <FileIcon />;
    }
  };

  const handleUpload = (categoryId: string) => {
    handleFileUpload(categoryId);
  };

  const handleRefresh = (categoryId: string) => {
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      console.log('Refreshed files for category:', categoryId);
    }, 1000);
  };

  const handleView = (file: FileItem) => {
    handleFileView(file);
  };

  const handleDownload = (file: FileItem) => {
    handleFileDownload(file);
  };

  const handleDelete = (file: FileItem) => {
    handleFileDelete(file);
  };

  const handleBulkUpload = () => {
    if (selectedCategory) {
      handleFileUpload(selectedCategory);
    } else {
      alert('먼저 카테고리를 선택해주세요.');
    }
  };

  const handleBulkDownload = () => {
    if (selectedCategory) {
      alert('전체 다운로드 기능 구현 예정');
    } else {
      alert('먼저 카테고리를 선택해주세요.');
    }
  };

  const handleSearch = () => {
    alert('파일 검색 기능 구현 예정');
  };

  const handleSettings = () => {
    alert('설정 기능 구현 예정');
  };

  const selectedCategoryData = fileCategories.find(cat => cat.id === selectedCategory);

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
    <Container maxWidth="xl" sx={{ px: { xs: 1, sm: 2, md: 3 } }}>
      {/* Breadcrumb Navigation */}
      <Box sx={{ mb: 2 }}>
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
            <FolderIcon sx={{ mr: 0.5 }} fontSize="inherit" />
            프로젝트 파일 보관함
          </Typography>
        </Breadcrumbs>
      </Box>

      {/* Page Header */}
      <Paper elevation={2} sx={{ p: 3, mb: 3, background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <FolderIcon sx={{ fontSize: 48, color: 'white', mr: 2 }} />
            <Box>
              <Typography variant="h4" component="h1" sx={{ color: 'white', fontWeight: 'bold' }}>
                프로젝트 파일 보관함
              </Typography>
              <Typography variant="h6" sx={{ color: 'rgba(255,255,255,0.8)', mt: 0.5 }}>
                프로젝트 {projectId}의 모든 파일을 체계적으로 관리합니다
              </Typography>
            </Box>
          </Box>
          <IconButton
            color="inherit"
            onClick={() => setIsLoading(true)}
            sx={{ color: 'white' }}
          >
            <RefreshIcon />
          </IconButton>
        </Box>
      </Paper>


      {/* File Category Selection */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold', mb: 2 }}>
          파일 카테고리 선택
        </Typography>
        <Box sx={{
          display: 'grid',
          gridTemplateColumns: {
            xs: '1fr',
            sm: 'repeat(2, 1fr)',
            md: 'repeat(3, 1fr)',
            lg: 'repeat(5, 1fr)',
          },
          gap: 2,
        }}>
          {fileCategories.map((category) => (
            <Card
              key={category.id}
              sx={{
                cursor: 'pointer',
                '&:hover': {
                  boxShadow: 4,
                  transform: 'translateY(-2px)',
                  transition: 'all 0.2s ease-in-out',
                },
                border: selectedCategory === category.id ? 2 : 0,
                borderColor: selectedCategory === category.id ? category.color : 'transparent',
                bgcolor: selectedCategory === category.id ? 'action.selected' : 'background.paper',
              }}
              onClick={() => handleCategorySelect(category.id)}
            >
              <CardContent sx={{ p: 2, textAlign: 'center' }}>
                <Avatar
                  sx={{
                    bgcolor: category.color,
                    width: 48,
                    height: 48,
                    mx: 'auto',
                    mb: 1,
                  }}
                >
                  {category.icon}
                </Avatar>
                <Typography variant="subtitle2" sx={{ fontWeight: 'bold', mb: 0.5 }}>
                  {category.title}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {category.files.length}개 파일
                </Typography>
                <Typography variant="caption" color="text.secondary" display="block">
                  {category.totalSize}
                </Typography>
              </CardContent>
            </Card>
          ))}
        </Box>
      </Box>

      {/* Selected Category Details */}
      {selectedCategory && (
        <Card elevation={3} sx={{ mb: 4 }}>
          <CardContent sx={{ p: 0 }}>
            {/* Category Header */}
            <Box sx={{
              p: 3,
              background: `linear-gradient(135deg, ${getCurrentCategory()?.color}20 0%, ${getCurrentCategory()?.color}10 100%)`,
              borderBottom: '1px solid',
              borderBottomColor: 'divider'
            }}>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <Avatar
                    sx={{
                      bgcolor: getCurrentCategory()?.color,
                      width: 56,
                      height: 56,
                      mr: 3,
                    }}
                  >
                    {getCurrentCategory()?.icon}
                  </Avatar>
                  <Box>
                    <Typography variant="h5" sx={{ fontWeight: 'bold', mb: 0.5 }}>
                      {getCurrentCategory()?.title}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                      {getCurrentCategory()?.description}
                    </Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                      <Chip
                        icon={<FolderIcon />}
                        label={getCurrentCategory()?.path}
                        size="small"
                        variant="outlined"
                      />
                      <Chip
                        label={`${getCurrentCategory()?.files.length}개 파일`}
                        size="small"
                        color="primary"
                      />
                      <Chip
                        label={getCurrentCategory()?.totalSize}
                        size="small"
                        color="secondary"
                      />
                    </Box>
                  </Box>
                </Box>
                <Box sx={{ display: 'flex', gap: 1 }}>
                  <Button
                    variant="contained"
                    startIcon={<UploadIcon />}
                    onClick={() => handleUpload(selectedCategory)}
                    disabled={isLoading}
                    sx={{ bgcolor: getCurrentCategory()?.color, '&:hover': { bgcolor: getCurrentCategory()?.color, filter: 'brightness(0.9)' } }}
                  >
                    업로드
                  </Button>
                  <Button
                    variant="outlined"
                    startIcon={<RefreshIcon />}
                    onClick={() => handleRefresh(selectedCategory)}
                    disabled={isLoading}
                  >
                    새로고침
                  </Button>
                </Box>
              </Box>
            </Box>

            {/* File List */}
            <Box sx={{ p: 3 }}>
              {isLoading ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
                  <CircularProgress />
                  <Typography sx={{ ml: 2 }}>파일 목록을 불러오는 중...</Typography>
                </Box>
              ) : getCurrentCategory()?.files.length === 0 ? (
                <Box sx={{ textAlign: 'center', p: 4, color: 'text.secondary' }}>
                  <FolderIcon sx={{ fontSize: 64, mb: 2, opacity: 0.5 }} />
                  <Typography variant="h6" gutterBottom>
                    파일이 없습니다
                  </Typography>
                  <Typography variant="body2" sx={{ mb: 3 }}>
                    이 카테고리에 첫 번째 파일을 업로드해보세요.
                  </Typography>
                  <Button
                    variant="contained"
                    startIcon={<UploadIcon />}
                    onClick={() => handleUpload(selectedCategory)}
                    sx={{ bgcolor: getCurrentCategory()?.color, '&:hover': { bgcolor: getCurrentCategory()?.color, filter: 'brightness(0.9)' } }}
                  >
                    파일 업로드
                  </Button>
                </Box>
              ) : (
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                  {getCurrentCategory()?.files.map((file: FileItem, index: number) => (
                    <Paper
                      key={index}
                      elevation={1}
                      sx={{
                        p: 2,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        '&:hover': {
                          bgcolor: 'action.hover',
                        },
                      }}
                    >
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <Avatar
                          sx={{
                            bgcolor: 'grey.200',
                            color: 'text.secondary',
                            width: 40,
                            height: 40,
                            mr: 2,
                          }}
                        >
                          {getFileIcon(file.type)}
                        </Avatar>
                        <Box>
                          <Typography variant="subtitle2" sx={{ fontWeight: 'bold' }}>
                            {file.name}
                          </Typography>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 0.5 }}>
                            <Typography variant="caption" color="text.secondary">
                              {file.size}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              • {file.modifiedDate || file.lastModified}
                            </Typography>
                            {file.version && (
                              <Chip
                                label={`v${file.version}`}
                                size="small"
                                color="info"
                                sx={{ height: 18, fontSize: '0.7rem' }}
                              />
                            )}
                          </Box>
                        </Box>
                      </Box>
                      <Box sx={{ display: 'flex', gap: 1 }}>
                        <IconButton
                          size="small"
                          onClick={() => handleView(file)}
                          title="미리보기"
                        >
                          <VisibilityIcon fontSize="small" />
                        </IconButton>
                        <IconButton
                          size="small"
                          onClick={() => handleDownload(file)}
                          title="다운로드"
                        >
                          <DownloadIcon fontSize="small" />
                        </IconButton>
                        <IconButton
                          size="small"
                          onClick={() => handleDelete(file)}
                          title="삭제"
                          color="error"
                        >
                          <DeleteIcon fontSize="small" />
                        </IconButton>
                      </Box>
                    </Paper>
                  ))}
                </Box>
              )}
            </Box>
          </CardContent>
        </Card>
      )}

      {/* Quick Actions */}
      <Paper elevation={2} sx={{ p: 3, background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)' }}>
        <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold', color: 'primary.main' }}>
          빠른 작업
        </Typography>
        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', md: 'repeat(4, 1fr)' }, gap: 2 }}>
          <Button
            variant="contained"
            startIcon={<UploadIcon />}
            onClick={() => handleBulkUpload()}
            disabled={isLoading}
            fullWidth
          >
            일괄 업로드
          </Button>
          <Button
            variant="outlined"
            startIcon={<DownloadIcon />}
            onClick={() => handleBulkDownload()}
            disabled={!selectedCategory || isLoading}
            fullWidth
          >
            전체 다운로드
          </Button>
          <Button
            variant="outlined"
            startIcon={<SearchIcon />}
            onClick={() => handleSearch()}
            fullWidth
          >
            파일 검색
          </Button>
          <Button
            variant="outlined"
            startIcon={<SettingsIcon />}
            onClick={() => handleSettings()}
            fullWidth
          >
            설정
          </Button>
        </Box>
      </Paper>
    </Container>
  );
};

export default ProjectFileRepositoryPage;