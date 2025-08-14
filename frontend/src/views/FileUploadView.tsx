import React, { useState, useEffect } from 'react';
import {
  Box,
  Button,
  Typography,
  Card,
  CardContent,
  Alert,
  CircularProgress,
  LinearProgress,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  ListItemIcon,
  ListItemSecondaryAction,
  IconButton,
  Divider,
} from '@mui/material';
import {
  CloudUpload as UploadIcon,
  CheckCircle as SuccessIcon,
  Error as ErrorIcon,
  Folder as FolderIcon,
  FolderOpen as FolderOpenIcon,
  Refresh as RefreshIcon,
  Delete as DeleteIcon,
} from '@mui/icons-material';
import { FileType } from '../models/FileUpload';
import { FileUploadViewModel, FileUploadState } from '../viewmodels/FileUploadViewModel';
import { FolderInfo } from '../services/FileUploadService';

interface FileUploadViewProps {
  projectId: string;
  fileType: FileType;
  onUploadSuccess?: (filePath: string) => void;
  onDeleteFolder?: (folder: FolderInfo) => void;
}

const FileUploadView: React.FC<FileUploadViewProps> = ({ 
  projectId, 
  fileType, 
  onUploadSuccess,
  onDeleteFolder
}) => {
  const [state, setState] = useState<FileUploadState>({
    selectedFile: null,
    selectedFiles: undefined,
    selectedFolderName: undefined,
    existingFolders: [],
    selectedExistingFolder: null,
    uploading: false,
    uploadResult: null,
    uploadProgress: 0,
  });

  const viewModel = new FileUploadViewModel(projectId, fileType, state, setState);

  useEffect(() => {
    viewModel.loadExistingFolders();
  }, [projectId, fileType]);

  const handleFolderSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files && files.length > 0) {
      const fileArray = Array.from(files);
      if (fileArray.length > 0) {
        // 폴더명 추출 (첫 번째 파일의 webkitRelativePath에서)
        const firstFile = fileArray[0] as any;
        const folderName = firstFile.webkitRelativePath?.split('/')[0] || '선택된 폴더';
        
        viewModel.selectFiles(fileArray);
        
        setState(prev => ({
          ...prev,
          selectedFiles: fileArray,
          selectedFolderName: folderName
        }));
      }
    }
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files && files.length > 0) {
      const fileArray = Array.from(files);
      if (fileArray.length > 0) {
        viewModel.selectFiles(fileArray);
        setState(prev => ({
          ...prev,
          selectedFiles: fileArray,
          selectedFolderName: fileArray[0].name
        }));
      }
    }
  };

  const handleUpload = async () => {
    if (fileType === 'roi') {
      // ROI 파일은 단일 파일 업로드로 처리
      await viewModel.uploadFile();
    } else if (state.selectedFiles && state.selectedFiles.length > 1) {
      await viewModel.uploadFolder();
    } else {
      await viewModel.uploadFile();
    }
    
    if (viewModel.uploadResult?.success && onUploadSuccess) {
      onUploadSuccess(viewModel.uploadResult.filePath || '');
    }
  };

  const handleExistingFolderSelect = (folder: FolderInfo) => {
    viewModel.selectExistingFolder(folder);
    if (onUploadSuccess) {
      onUploadSuccess(folder.path);
    }
  };

  const handleRefreshFolders = () => {
    viewModel.loadExistingFolders();
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="subtitle1">
          기존 {viewModel.getFileTypeLabel()} 폴더
        </Typography>
        <Button
          startIcon={<RefreshIcon />}
          onClick={handleRefreshFolders}
          size="small"
        >
          새로고침
        </Button>
      </Box>

      {viewModel.existingFolders.length === 0 ? (
        <Box sx={{ textAlign: 'center', py: 3, border: '2px dashed #ccc', borderRadius: 1 }}>
          <FolderIcon sx={{ fontSize: 48, color: 'text.secondary', mb: 1 }} />
          <Typography variant="body2" color="text.secondary">
            업로드된 폴더가 없습니다.
          </Typography>
        </Box>
      ) : (
        <List sx={{ maxHeight: 200, overflow: 'auto', border: '1px solid #e0e0e0', borderRadius: 1 }}>
          {viewModel.existingFolders.map((folder, index) => (
            <React.Fragment key={folder.name}>
              <ListItem disablePadding>
                <ListItemButton
                  onClick={() => handleExistingFolderSelect(folder)}
                  selected={viewModel.selectedExistingFolder?.name === folder.name}
                >
                  <ListItemIcon>
                    <FolderOpenIcon />
                  </ListItemIcon>
                  <ListItemText
                    primary={folder.name}
                    secondary={`${folder.fileCount}개 파일`}
                  />
                  <ListItemSecondaryAction>
                    <IconButton
                      edge="end"
                      aria-label="delete"
                      onClick={(e) => {
                        e.stopPropagation();
                        onDeleteFolder?.(folder);
                      }}
                      color="error"
                      size="small"
                    >
                      <DeleteIcon />
                    </IconButton>
                  </ListItemSecondaryAction>
                </ListItemButton>
              </ListItem>
              {index < viewModel.existingFolders.length - 1 && <Divider />}
            </React.Fragment>
          ))}
        </List>
      )}

      {viewModel.selectedExistingFolder && (
        <Alert severity="success" sx={{ mt: 2 }}>
          <Typography variant="body2">
            선택된 폴더: <strong>{viewModel.selectedExistingFolder.name}</strong>
          </Typography>
          <Typography variant="caption" color="text.secondary">
            경로: {viewModel.selectedExistingFolder.path}
          </Typography>
        </Alert>
      )}

      <Divider sx={{ my: 2 }} />

      {/* 새 폴더 업로드 */}
      <Box>
        <Typography variant="subtitle1" gutterBottom>
          새 {viewModel.getFileTypeLabel()} {fileType === 'roi' ? '파일' : '폴더'} 업로드
        </Typography>

        <Box sx={{ border: '2px dashed #ccc', p: 3, textAlign: 'center', mb: 2 }}>
          <input
            accept={viewModel.getAcceptedExtensions()}
            style={{ display: 'none' }}
            id={`${fileType === 'roi' ? 'file' : 'folder'}-upload-${fileType}`}
            type="file"
            onChange={fileType === 'roi' ? handleFileSelect : handleFolderSelect}
            {...(fileType === 'roi' ? {
              multiple: true
            } : {
              webkitdirectory: "",
              directory: "",
              multiple: true
            } as any)}
          />
          <label htmlFor={`${fileType === 'roi' ? 'file' : 'folder'}-upload-${fileType}`}>
            <Button
              variant="outlined"
              component="span"
              startIcon={fileType === 'roi' ? <UploadIcon /> : <FolderIcon />}
              disabled={viewModel.uploading}
            >
              {fileType === 'roi' ? 'JSON 파일 선택' : '폴더 선택'}
            </Button>
          </label>
          
          {viewModel.selectedFile && (
            <Box sx={{ mt: 2 }}>
              <Typography variant="body2" color="text.secondary">
                {fileType === 'roi' ? '선택된 파일' : '선택된 폴더'}: {state.selectedFolderName || (fileType === 'roi' ? '파일' : '폴더')}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                파일 개수: {state.selectedFiles?.length || 1}개
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {fileType === 'roi' ? '선택된 파일' : '첫 번째 파일'}: {viewModel.selectedFile.name}
              </Typography>
            </Box>
          )}
        </Box>
        
        {viewModel.uploading && (
          <Box sx={{ width: '100%', mb: 2 }}>
            <LinearProgress 
              variant="determinate" 
              value={viewModel.uploadProgress} 
              sx={{ mb: 1 }}
            />
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Typography variant="caption" color="text.secondary">
                업로드 진행률: {viewModel.uploadProgress}%
              </Typography>
              {state.selectedFiles && state.selectedFiles.length > 1 && (
                <Typography variant="caption" color="text.secondary">
                  {state.selectedFiles.length}개 파일 처리 중...
                </Typography>
              )}
            </Box>
            {viewModel.uploadProgress > 0 && viewModel.uploadProgress < 100 && (
              <Typography variant="caption" color="primary" sx={{ display: 'block', mt: 1 }}>
                파일을 shared/{projectId}/uploads/ 폴더에 저장하고 있습니다...
              </Typography>
            )}
          </Box>
        )}
        
        <Button
          variant="contained"
          onClick={handleUpload}
          disabled={!viewModel.selectedFile || viewModel.uploading}
          fullWidth
          startIcon={viewModel.uploading ? <CircularProgress size={20} /> : <UploadIcon />}
        >
          {viewModel.uploading ? '업로드 중...' : '업로드'}
        </Button>
      </Box>

      {viewModel.uploadResult && (
        <Box sx={{ mt: 2 }}>
          <Alert
            severity={viewModel.uploadResult.success ? 'success' : 'error'}
            icon={viewModel.uploadResult.success ? <SuccessIcon /> : <ErrorIcon />}
          >
            {viewModel.uploadResult.message}
            {viewModel.uploadResult.success && viewModel.uploadResult.totalFiles && (
              <Box sx={{ mt: 1 }}>
                <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
                  📊 업로드 결과:
                </Typography>
                <Box sx={{ display: 'flex', gap: 2, mt: 0.5 }}>
                  <Typography variant="caption" color="primary">
                    📁 총 파일: {viewModel.uploadResult.totalFiles}개
                  </Typography>
                  <Typography variant="caption" color="success.main">
                    ✅ 성공: {viewModel.uploadResult.success}개
                  </Typography>
                    <Typography variant="caption" color="error.main">
                      ❌ 실패: {viewModel.uploadResult.failed}개
                    </Typography>
                </Box>
              </Box>
            )}
          </Alert>
        </Box>
      )}
    </Box>
  );
};

export default FileUploadView; 