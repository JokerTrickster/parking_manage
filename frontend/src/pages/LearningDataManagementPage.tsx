/**
 * Learning Data Management Page
 *
 * Page for managing learning data with ROI-based image editing
 * Allows users to select ROI files, learning folders, CCTVs, and fill/empty ROI regions
 */

import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Container,
  Paper,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Button,
  Alert,
  CircularProgress,
  Breadcrumbs,
  Link,
  Chip,
  Card,
  CardContent,
  CardActions,
  Divider,
} from '@mui/material';
import {
  Home as HomeIcon,
  Storage as StorageIcon,
  Save as SaveIcon,
  Refresh as RefreshIcon,
  FolderOpen as FolderIcon,
  Videocam as VideocamIcon,
  Image as ImageIcon,
} from '@mui/icons-material';
import { useNavigate, useParams } from 'react-router-dom';
import { LearningDataManagementState } from '../models/LearningDataManagement';
import { LearningDataManagementViewModel } from '../viewmodels/LearningDataManagementViewModel';
import ROIImageCanvas from '../components/ROIImageCanvas';

const LearningDataManagementPage: React.FC = () => {
  const navigate = useNavigate();
  const { projectId } = useParams<{ projectId: string }>();

  const [state, setState] = useState<LearningDataManagementState>({
    selectedRoiFile: null,
    selectedRoiFileData: null,
    selectedLearningFolder: null,
    selectedCCTV: null,
    roiFiles: [],
    learningFolders: [],
    cctvList: [],
    currentImage: null,
    currentImageFile: null,
    editedROIs: [],
    hasUnsavedChanges: false,
    loading: false,
    saving: false,
    error: null,
    successMessage: null,
  });

  const [viewModel, setViewModel] = useState<LearningDataManagementViewModel | null>(null);
  const [selectedROI, setSelectedROI] = useState<string | null>(null);

  // Initialize ViewModel
  useEffect(() => {
    if (!projectId) {
      navigate('/');
      return;
    }

    const vm = new LearningDataManagementViewModel(projectId, state, setState);
    setViewModel(vm);

    // Load initial data
    vm.initialize();
  }, [projectId]);

  // Handle ROI file selection
  const handleROIFileSelect = async (roiFileName: string) => {
    if (viewModel) {
      await viewModel.selectROIFile(roiFileName);
    }
  };

  // Handle learning folder selection
  const handleLearningFolderSelect = async (folderPath: string) => {
    if (viewModel) {
      await viewModel.selectLearningFolder(folderPath);
    }
  };

  // Handle CCTV selection
  const handleCCTVSelect = async (cctvId: string) => {
    if (viewModel) {
      await viewModel.selectCCTV(cctvId);
    }
  };

  // Handle ROI click (toggle occupied state)
  const handleROIClick = (roiId: string) => {
    if (viewModel) {
      viewModel.toggleROIOccupied(roiId);
      setSelectedROI(roiId);
    }
  };

  // Handle fill ROI
  const handleFillROI = (roiId: string) => {
    if (viewModel) {
      viewModel.fillROI(roiId);
    }
  };

  // Handle empty ROI
  const handleEmptyROI = (roiId: string) => {
    if (viewModel) {
      viewModel.emptyROI(roiId);
    }
  };

  // Handle save
  const handleSave = async () => {
    if (viewModel) {
      await viewModel.saveEditedImage();
    }
  };

  // Handle reset
  const handleReset = () => {
    if (viewModel) {
      viewModel.reset();
      setSelectedROI(null);
    }
  };

  if (!projectId) {
    return null;
  }

  return (
    <Container maxWidth="xl" sx={{ px: { xs: 1, sm: 2, md: 3 }, py: 3 }}>
      {/* Breadcrumb Navigation */}
      <Box sx={{ mb: 2 }}>
        <Breadcrumbs aria-label="breadcrumb">
          <Link
            color="inherit"
            onClick={() => navigate('/')}
            sx={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}
          >
            <HomeIcon sx={{ mr: 0.5 }} fontSize="small" />
            홈
          </Link>
          <Link
            color="inherit"
            onClick={() => navigate(`/project/${projectId}`)}
            sx={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}
          >
            프로젝트 {projectId}
          </Link>
          <Typography color="text.primary" sx={{ display: 'flex', alignItems: 'center' }}>
            <StorageIcon sx={{ mr: 0.5 }} fontSize="small" />
            학습 데이터 관리
          </Typography>
        </Breadcrumbs>
      </Box>

      {/* Page Header */}
      <Box sx={{ mb: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
          <StorageIcon sx={{ fontSize: 40, color: 'primary.main', mr: 1.5 }} />
          <Typography variant="h4" component="h1" color="primary.main">
            학습 데이터 관리
          </Typography>
        </Box>
        <Typography variant="body1" color="text.secondary">
          ROI 파일과 학습 데이터를 선택하여 주차면에 차량 점유 상태를 표시합니다
        </Typography>
      </Box>

      {/* Error Alert */}
      {state.error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setState(prev => ({ ...prev, error: null }))}>
          {state.error}
        </Alert>
      )}

      {/* Success Alert */}
      {state.successMessage && (
        <Alert
          severity="success"
          sx={{ mb: 2 }}
          onClose={() => setState(prev => ({ ...prev, successMessage: null }))}
        >
          {state.successMessage}
        </Alert>
      )}

      <Box sx={{ display: 'flex', gap: 3, flexDirection: { xs: 'column', md: 'row' } }}>
        {/* Left Panel - Selection Controls */}
        <Box sx={{ flex: { xs: '1 1 100%', md: '0 0 33.33%' } }}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              선택 옵션
            </Typography>

            {/* ROI File Selection */}
            <FormControl fullWidth sx={{ mb: 3 }}>
              <InputLabel>ROI 파일 선택</InputLabel>
              <Select
                value={state.selectedRoiFile || ''}
                label="ROI 파일 선택"
                onChange={e => handleROIFileSelect(e.target.value)}
                disabled={state.loading}
              >
                {state.roiFiles.map(file => (
                  <MenuItem key={file} value={file}>
                    {file}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            {/* Learning Folder Selection */}
            <FormControl fullWidth sx={{ mb: 3 }}>
              <InputLabel>학습 데이터 폴더</InputLabel>
              <Select
                value={state.selectedLearningFolder || ''}
                label="학습 데이터 폴더"
                onChange={e => handleLearningFolderSelect(e.target.value)}
                disabled={state.loading}
              >
                {state.learningFolders.map(folder => (
                  <MenuItem key={folder.folder_path} value={folder.folder_path}>
                    <Box>
                      <Typography variant="body2">{folder.folder_name}</Typography>
                      <Typography variant="caption" color="text.secondary">
                        {folder.cctv_count} CCTVs, {folder.image_count} images
                      </Typography>
                    </Box>
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            {/* CCTV Selection */}
            <FormControl fullWidth sx={{ mb: 3 }}>
              <InputLabel>CCTV 선택</InputLabel>
              <Select
                value={state.selectedCCTV || ''}
                label="CCTV 선택"
                onChange={e => handleCCTVSelect(e.target.value)}
                disabled={state.loading || !state.selectedLearningFolder}
              >
                {state.cctvList.map(cctv => (
                  <MenuItem key={cctv.cctv_id} value={cctv.cctv_id}>
                    <Box>
                      <Typography variant="body2">{cctv.cctv_id}</Typography>
                      <Typography variant="caption" color="text.secondary">
                        {cctv.image_files.length} images
                      </Typography>
                    </Box>
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <Divider sx={{ my: 2 }} />

            {/* Status Info */}
            <Box sx={{ mb: 2 }}>
              <Typography variant="subtitle2" gutterBottom>
                선택 상태
              </Typography>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                <Chip
                  icon={<FolderIcon />}
                  label={state.selectedRoiFile || '미선택'}
                  size="small"
                  color={state.selectedRoiFile ? 'primary' : 'default'}
                />
                <Chip
                  icon={<ImageIcon />}
                  label={state.selectedLearningFolder ? state.selectedLearningFolder.split('/').pop() : '미선택'}
                  size="small"
                  color={state.selectedLearningFolder ? 'primary' : 'default'}
                />
                <Chip
                  icon={<VideocamIcon />}
                  label={state.selectedCCTV || '미선택'}
                  size="small"
                  color={state.selectedCCTV ? 'primary' : 'default'}
                />
              </Box>
            </Box>

            {/* Action Buttons */}
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
              <Button
                variant="contained"
                color="primary"
                startIcon={state.saving ? <CircularProgress size={16} /> : <SaveIcon />}
                onClick={handleSave}
                disabled={!state.hasUnsavedChanges || state.saving || !state.currentImage}
                fullWidth
              >
                {state.saving ? '저장 중...' : '저장'}
              </Button>
              <Button
                variant="outlined"
                startIcon={<RefreshIcon />}
                onClick={handleReset}
                disabled={state.loading}
                fullWidth
              >
                초기화
              </Button>
            </Box>
          </Paper>

          {/* ROI List */}
          {state.editedROIs.length > 0 && (
            <Paper sx={{ p: 2, mt: 2 }}>
              <Typography variant="h6" gutterBottom>
                ROI 목록
              </Typography>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, maxHeight: 300, overflow: 'auto' }}>
                {state.editedROIs.map(roi => (
                  <Card key={roi.roi_id} variant="outlined">
                    <CardContent sx={{ py: 1, px: 2 }}>
                      <Typography variant="body2" fontWeight="bold">
                        {roi.roi_id}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {roi.occupied ? '점유됨 (채워짐)' : '비어있음'}
                      </Typography>
                    </CardContent>
                    <CardActions sx={{ py: 0.5, px: 1 }}>
                      <Button
                        size="small"
                        onClick={() => handleFillROI(roi.roi_id)}
                        disabled={roi.occupied}
                      >
                        채우기
                      </Button>
                      <Button
                        size="small"
                        onClick={() => handleEmptyROI(roi.roi_id)}
                        disabled={!roi.occupied}
                      >
                        비우기
                      </Button>
                    </CardActions>
                  </Card>
                ))}
              </Box>
            </Paper>
          )}
        </Box>

        {/* Right Panel - Image Display */}
        <Box sx={{ flex: { xs: '1 1 100%', md: '0 0 66.67%' } }}>
          <Paper sx={{ p: 3, minHeight: 600 }}>
            <Typography variant="h6" gutterBottom>
              이미지 편집
            </Typography>

            {state.loading && (
              <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 400 }}>
                <CircularProgress />
              </Box>
            )}

            {!state.loading && !state.currentImage && (
              <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 400 }}>
                <Typography variant="body1" color="text.secondary">
                  ROI 파일, 학습 폴더, CCTV를 선택하여 이미지를 표시합니다
                </Typography>
              </Box>
            )}

            {!state.loading && state.currentImage && state.editedROIs.length > 0 && (
              <Box>
                <Box sx={{ mb: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Typography variant="body2" color="text.secondary">
                    클릭하여 ROI 영역을 채우거나 비웁니다
                  </Typography>
                  {state.hasUnsavedChanges && (
                    <Chip label="저장되지 않은 변경사항" color="warning" size="small" />
                  )}
                </Box>

                <Box sx={{ display: 'flex', justifyContent: 'center' }}>
                  <ROIImageCanvas
                    imageSrc={state.currentImage}
                    rois={state.editedROIs}
                    onROIClick={handleROIClick}
                    highlightedROI={selectedROI}
                    width={800}
                    height={600}
                  />
                </Box>

                <Box sx={{ mt: 2 }}>
                  <Alert severity="info">
                    <Typography variant="body2">
                      <strong>사용 방법:</strong> ROI 영역을 클릭하여 점유 상태를 전환합니다.
                      흰색으로 채워진 영역은 차량이 있는 것으로 학습됩니다.
                    </Typography>
                  </Alert>
                </Box>
              </Box>
            )}
          </Paper>
        </Box>
      </Box>
    </Container>
  );
};

export default LearningDataManagementPage;
