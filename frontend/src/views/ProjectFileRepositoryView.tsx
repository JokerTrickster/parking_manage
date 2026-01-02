/**
 * Project File Repository View
 *
 * Main page for managing project files across all categories
 * Features: category tabs, file upload, file list, pagination
 */

import React, { useState, useEffect, useMemo, useRef } from 'react';
import {
  Typography,
  Box,
  Tabs,
  Tab,
  CircularProgress,
  Alert,
  Snackbar,
  useTheme,
  alpha,
  Paper,
  IconButton,
  Link,
} from '@mui/material';
import {
  Folder as FolderIcon,
  ArrowBack as ArrowBackIcon,
} from '@mui/icons-material';
import { useNavigate, useParams } from 'react-router-dom';
import { FileRepositoryViewModel } from '../viewmodels/FileRepositoryViewModel';
import { FileCategory, FileRepositoryState, FolderNode } from '../models/FileStorage';
import { DragDropZone } from '../components/FileUpload/DragDropZone';
import { FileListTable } from '../components/FileList/FileListTable';
import { Pagination } from '../components/FileList/Pagination';
import { FolderListView } from '../components/FolderView/FolderListView';
import { SHADOWS, GRADIENTS } from '../styles/theme';

interface ProjectFileRepositoryViewProps {
  projectId: string;
  projectName: string;
}

/**
 * ProjectFileRepositoryView Component
 *
 * Main file repository page with:
 * - Category tabs (map, cad, roi, learning, test)
 * - File upload zone
 * - File list table
 * - Pagination
 */
export const ProjectFileRepositoryView: React.FC<ProjectFileRepositoryViewProps> = ({
  projectId,
  projectName,
}) => {
  const navigate = useNavigate();
  const { projectId: paramProjectId } = useParams<{ projectId: string }>();
  const currentProjectId = projectId || paramProjectId;
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';

  // State
  const [state, setState] = useState<FileRepositoryState>({
    currentCategory: 'map',
    files: [],
    folders: [],
    selectedFolder: null,
    currentPath: '',
    viewMode: 'files',
    loading: false,
    error: null,
    pagination: {
      page: 1,
      pageSize: 10,
      totalPages: 1,
      totalCount: 0,
    },
    uploadProgress: 0,
  });

  // ViewModel - recreate on projectId or state changes to ensure fresh state reference
  const viewModel = useMemo(
    () => new FileRepositoryViewModel(projectId, state, setState),
    [projectId, state, setState]
  );

  // Load files/folders on mount and category change
  useEffect(() => {
    if (state.currentCategory === 'learning' || state.currentCategory === 'test') {
      viewModel.loadFolders();
    } else {
      viewModel.loadFiles();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state.currentCategory]);

  // Handlers
  const handleCategoryChange = (_event: React.SyntheticEvent, newValue: FileCategory) => {
    viewModel.setCategory(newValue);
  };

  const handleFilesSelected = async (files: File[]) => {
    await viewModel.uploadFiles(files);
  };

  const handleDownload = (filename: string, originalName: string) => {
    viewModel.downloadFile(filename, originalName);
  };

  const handleDownloadLatest = (originalName: string) => {
    viewModel.downloadLatest(originalName);
  };

  // Wrapper for folder view - uses filename as both path and original name
  const handleFolderDownload = (filename: string) => {
    viewModel.downloadFile(filename, filename);
  };

  const handlePageChange = (page: number) => {
    viewModel.changePage(page);
  };

  const handleDelete = async (filename: string) => {
    if (window.confirm('이 파일을 삭제하시겠습니까?')) {
      await viewModel.deleteFile(filename);
    }
  };

  const handleBatchDelete = async (filenames: string[]) => {
    await viewModel.deleteFiles(filenames);
  };

  const handleBatchDownload = async (filenames: string[]) => {
    await viewModel.downloadMultiple(filenames);
  };

  const handleDeleteFolder = async (folderPath: string) => {
    if (window.confirm(`폴더 "${folderPath}"와 그 안의 모든 내용을 삭제하시겠습니까?`)) {
      await viewModel.deleteFolder(folderPath);
    }
  };

  const handleDeleteFileFromFolder = async (filename: string) => {
    if (window.confirm(`파일 "${filename}"을(를) 삭제하시겠습니까?`)) {
      await viewModel.deleteFile(filename);
    }
  };

  const handleCloseError = () => {
    viewModel.clearError();
  };

  const handleFolderClick = (folder: FolderNode) => {
    viewModel.selectFolder(folder);
  };

  const handleBackToFolders = () => {
    viewModel.backToFolders();
  };

  return (
    <Box sx={{
      minHeight: '100vh',
      bgcolor: isDark ? '#0a0a0a' : '#fafafa',
      display: 'flex',
      flexDirection: 'column'
    }}>
      {/* Header Bar - ROI Editor Style */}
      <Paper
        elevation={0}
        sx={{
          px: 2,
          py: 1,
          borderBottom: '1px solid',
          borderColor: 'divider',
          bgcolor: isDark ? alpha(theme.palette.background.paper, 0.5) : theme.palette.background.paper,
          display: 'flex',
          alignItems: 'center',
          gap: 2,
          zIndex: 5,
          flexShrink: 0
        }}
      >
        <IconButton
          size="small"
          onClick={() => navigate(`/project/${currentProjectId}`)}
          sx={{
            color: 'text.secondary',
            '&:hover': {
              color: 'primary.main',
              bgcolor: alpha(theme.palette.primary.main, 0.1)
            }
          }}
        >
          <ArrowBackIcon />
        </IconButton>
        <Typography variant="h6" sx={{
          fontWeight: 700,
          color: 'text.primary'
        }}>
          파일 보관함
        </Typography>
        <Typography variant="body2" sx={{
          color: 'text.secondary',
          ml: 'auto'
        }}>
          프로젝트: {projectName}
        </Typography>
      </Paper>

      {/* Main Content Area */}
      <Box sx={{ p: 3, flex: 1 }}>

      {/* Category Tabs */}
      <Box sx={{
        mb: 3,
        borderRadius: 2,
        bgcolor: isDark ? alpha('#1a1a1a', 0.6) : alpha('#ffffff', 0.8),
        backdropFilter: 'blur(10px)',
        border: '1px solid',
        borderColor: isDark ? alpha('#fff', 0.1) : alpha('#000', 0.1),
        boxShadow: isDark ? SHADOWS.dark.sm : SHADOWS.light.sm,
        overflow: 'hidden'
      }}>
        <Tabs
          value={state.currentCategory}
          onChange={handleCategoryChange}
          variant="scrollable"
          scrollButtons="auto"
          sx={{
            '& .MuiTab-root': {
              fontWeight: 500,
              minHeight: 56,
              transition: 'all 0.3s',
              '&:hover': {
                bgcolor: isDark ? alpha('#fff', 0.05) : alpha('#000', 0.05)
              },
              '&.Mui-selected': {
                fontWeight: 600,
                borderBottom: '3px solid',
                borderColor: 'primary.main'
              }
            }
          }}
        >
          <Tab label="Map" value="map" />
          <Tab label="CAD" value="cad" />
          <Tab label="ROI" value="roi" />
          <Tab label="Learning" value="learning" />
          <Tab label="Test" value="test" />
        </Tabs>
      </Box>

      {/* File Upload Zone */}
      <Box sx={{
        mb: 3,
        borderRadius: 2,
        bgcolor: isDark ? alpha('#1a1a1a', 0.4) : alpha('#ffffff', 0.6),
        backdropFilter: 'blur(10px)',
        border: '1px solid',
        borderColor: isDark ? alpha('#fff', 0.1) : alpha('#000', 0.1),
        p: 2
      }}>
        <DragDropZone
          category={state.currentCategory}
          onFilesSelected={handleFilesSelected}
          disabled={state.loading}
          uploading={state.loading && state.uploadProgress > 0}
          uploadProgress={state.uploadProgress}
        />
      </Box>

      {/* Loading Indicator */}
      {state.loading && !state.uploadProgress && (
        <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
          <CircularProgress />
        </Box>
      )}

      {/* Content: Folder View or File View */}
      {!state.loading && (
        <Box sx={{
          borderRadius: 2,
          bgcolor: isDark ? alpha('#1a1a1a', 0.6) : alpha('#ffffff', 0.8),
          backdropFilter: 'blur(10px)',
          border: '1px solid',
          borderColor: isDark ? alpha('#fff', 0.1) : alpha('#000', 0.1),
          boxShadow: isDark ? SHADOWS.dark.md : SHADOWS.light.md,
          p: 3
        }}>
          {/* Folder View (learning/test categories) */}
          {viewModel.supportsFolderView && state.viewMode === 'folders' && (
            <Box>
              {/* Breadcrumb for nested folders */}
              {state.currentPath && (
                <Box sx={{
                  mb: 3,
                  p: 2,
                  borderRadius: 1,
                  bgcolor: isDark ? alpha('#fff', 0.05) : alpha('#000', 0.03),
                  border: '1px solid',
                  borderColor: 'divider'
                }}>
                  <Link
                    component="button"
                    variant="body2"
                    onClick={handleBackToFolders}
                    sx={{
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      textDecoration: 'none',
                      '&:hover': {
                        color: 'primary.main'
                      }
                    }}
                  >
                    <FolderIcon sx={{ mr: 0.5 }} fontSize="inherit" />
                    상위 폴더로 돌아가기
                  </Link>
                  <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                    현재 경로: /{state.currentPath}
                  </Typography>
                </Box>
              )}

              <FolderListView
                folders={state.folders}
                onFolderClick={handleFolderClick}
                selectedFolder={state.selectedFolder}
                projectId={currentProjectId || ''}
                category={state.currentCategory}
                onDownload={handleFolderDownload}
                onDeleteFolder={handleDeleteFolder}
                onDeleteFile={handleDeleteFileFromFolder}
              />
            </Box>
          )}

          {/* File View (all categories or when folder selected) */}
          {state.viewMode === 'files' && (
            <Box>
              {/* Back button for folder navigation */}
              {viewModel.supportsFolderView && state.selectedFolder && (
                <Box sx={{
                  mb: 3,
                  p: 2,
                  borderRadius: 1,
                  bgcolor: isDark ? alpha('#fff', 0.05) : alpha('#000', 0.03),
                  border: '1px solid',
                  borderColor: 'divider'
                }}>
                  <Link
                    component="button"
                    variant="body2"
                    onClick={handleBackToFolders}
                    sx={{
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      textDecoration: 'none',
                      '&:hover': {
                        color: 'primary.main'
                      }
                    }}
                  >
                    <FolderIcon sx={{ mr: 0.5 }} fontSize="inherit" />
                    폴더 목록으로 돌아가기
                  </Link>
                  <Typography variant="h6" sx={{ mt: 1, fontWeight: 600 }}>
                    {state.selectedFolder.name}
                  </Typography>
                </Box>
              )}

              <Box sx={{
                mb: 3,
                pb: 2,
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                borderBottom: '2px solid',
                borderColor: isDark ? alpha('#fff', 0.1) : alpha('#000', 0.1)
              }}>
                <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                  파일 목록 ({state.pagination.totalCount}개)
                </Typography>
                <Typography
                  variant="body2"
                  sx={{
                    px: 2,
                    py: 0.5,
                    borderRadius: 1,
                    bgcolor: isDark ? alpha(theme.palette.primary.main, 0.2) : alpha(theme.palette.primary.main, 0.1),
                    color: 'primary.main',
                    fontWeight: 500
                  }}
                >
                  {viewModel.isVersionedCategory ? '버전 관리 지원' : 'CCTV ID 구분'}
                </Typography>
              </Box>

              {/* File List Table */}
              <FileListTable
                files={state.files}
                category={state.currentCategory}
                onDownload={handleDownload}
                onDownloadLatest={handleDownloadLatest}
                onDelete={handleDelete}
                onBatchDelete={handleBatchDelete}
                onBatchDownload={handleBatchDownload}
              />

              {/* Pagination */}
              {state.pagination.totalPages > 1 && (
                <Box sx={{ mt: 2, display: 'flex', justifyContent: 'center' }}>
                  <Pagination
                    currentPage={state.pagination.page}
                    totalPages={state.pagination.totalPages}
                    onPageChange={handlePageChange}
                  />
                </Box>
              )}
            </Box>
          )}
        </Box>
      )}
      </Box>

      {/* Error Snackbar */}
      <Snackbar
        open={!!state.error}
        autoHideDuration={6000}
        onClose={handleCloseError}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert onClose={handleCloseError} severity="error" sx={{ width: '100%' }}>
          {state.error}
        </Alert>
      </Snackbar>
    </Box>
  );
};
