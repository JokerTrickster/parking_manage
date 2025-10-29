/**
 * Project File Repository View
 *
 * Main page for managing project files across all categories
 * Features: category tabs, file upload, file list, pagination
 */

import React, { useState, useEffect, useMemo } from 'react';
import {
  Typography,
  Box,
  Tabs,
  Tab,
  CircularProgress,
  Alert,
  Snackbar,
  Breadcrumbs,
  Link,
} from '@mui/material';
import {
  Home as HomeIcon,
  Folder as FolderIcon,
} from '@mui/icons-material';
import { useNavigate, useParams } from 'react-router-dom';
import { FileRepositoryViewModel } from '../viewmodels/FileRepositoryViewModel';
import { FileCategory, FileRepositoryState, FolderNode } from '../models/FileStorage';
import { DragDropZone } from '../components/FileUpload/DragDropZone';
import { FileListTable } from '../components/FileList/FileListTable';
import { Pagination } from '../components/FileList/Pagination';
import { FolderListView } from '../components/FolderView/FolderListView';

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
      pageSize: 100,
      totalPages: 1,
      totalCount: 0,
    },
    uploadProgress: 0,
  });

  // ViewModel
  const viewModel = useMemo(
    () => new FileRepositoryViewModel(projectId, state, setState),
    [projectId, state]
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
  const handleCategoryChange = (event: React.SyntheticEvent, newValue: FileCategory) => {
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

  const handlePageChange = (page: number) => {
    viewModel.changePage(page);
  };

  const handleDelete = async (filename: string) => {
    if (window.confirm('이 파일을 삭제하시겠습니까?')) {
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
    <Box sx={{ p: 3 }}>
      {/* Breadcrumb Navigation */}
      <Box sx={{ mb: 3 }}>
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
            onClick={() => navigate(`/project/${currentProjectId}`)}
            sx={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}
          >
            프로젝트 {projectName}
          </Link>
          <Typography color="text.primary" sx={{ display: 'flex', alignItems: 'center' }}>
            <FolderIcon sx={{ mr: 0.5 }} fontSize="inherit" />
            파일 보관함
          </Typography>
        </Breadcrumbs>
      </Box>

      {/* Header */}
      <Box sx={{ mb: 3 }}>
        <Typography variant="h5" gutterBottom>
          프로젝트 파일 보관함
        </Typography>
        <Typography variant="body2" color="text.secondary">
          현재 프로젝트: <strong>{projectName}</strong>
        </Typography>
      </Box>

      {/* Category Tabs */}
      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 2 }}>
        <Tabs
          value={state.currentCategory}
          onChange={handleCategoryChange}
          variant="scrollable"
          scrollButtons="auto"
        >
          <Tab label="Map" value="map" />
          <Tab label="CAD" value="cad" />
          <Tab label="ROI" value="roi" />
          <Tab label="Learning" value="learning" />
          <Tab label="Test" value="test" />
        </Tabs>
      </Box>

      {/* File Upload Zone */}
      <Box sx={{ mb: 3 }}>
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
        <Box>
          {/* Folder View (learning/test categories) */}
          {viewModel.supportsFolderView && state.viewMode === 'folders' && (
            <Box>
              {/* Breadcrumb for nested folders */}
              {state.currentPath && (
                <Box sx={{ mb: 2 }}>
                  <Link
                    component="button"
                    variant="body2"
                    onClick={handleBackToFolders}
                    sx={{ cursor: 'pointer', display: 'flex', alignItems: 'center' }}
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
                onDownload={handleDownload}
              />
            </Box>
          )}

          {/* File View (all categories or when folder selected) */}
          {state.viewMode === 'files' && (
            <Box>
              {/* Back button for folder navigation */}
              {viewModel.supportsFolderView && state.selectedFolder && (
                <Box sx={{ mb: 2 }}>
                  <Link
                    component="button"
                    variant="body2"
                    onClick={handleBackToFolders}
                    sx={{ cursor: 'pointer', display: 'flex', alignItems: 'center' }}
                  >
                    <FolderIcon sx={{ mr: 0.5 }} fontSize="inherit" />
                    폴더 목록으로 돌아가기
                  </Link>
                  <Typography variant="h6" sx={{ mt: 1 }}>
                    {state.selectedFolder.name}
                  </Typography>
                </Box>
              )}

              <Box sx={{ mb: 2, display: 'flex', justifyContent: 'space-between', alignments: 'center' }}>
                <Typography variant="subtitle1">
                  파일 목록 ({state.pagination.totalCount}개)
                </Typography>
                <Typography variant="body2" color="text.secondary">
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
