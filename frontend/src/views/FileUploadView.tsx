import React, { useState } from 'react';
import {
  Box,
  Button,
  Typography,
  Card,
  CardContent,
  Alert,
  CircularProgress,
  LinearProgress,
} from '@mui/material';
import {
  CloudUpload as UploadIcon,
  CheckCircle as SuccessIcon,
  Error as ErrorIcon,
} from '@mui/icons-material';
import { FileType } from '../models/FileUpload';
import { FileUploadViewModel, FileUploadState } from '../viewmodels/FileUploadViewModel';

interface FileUploadViewProps {
  projectId: string;
  fileType: FileType;
  onUploadSuccess?: (filePath: string) => void;
}

const FileUploadView: React.FC<FileUploadViewProps> = ({ 
  projectId, 
  fileType, 
  onUploadSuccess 
}) => {
  const [state, setState] = useState<FileUploadState>({
    selectedFile: null,
    uploading: false,
    uploadResult: null,
    uploadProgress: 0,
  });

  const viewModel = new FileUploadViewModel(projectId, fileType, state, setState);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      viewModel.selectFile(file);
    }
  };

  const handleUpload = async () => {
    await viewModel.uploadFile();
    if (viewModel.uploadResult?.success && onUploadSuccess) {
      onUploadSuccess(viewModel.uploadResult.filePath || '');
    }
  };

  return (
    <Card>
      <CardContent>
        <Typography variant="h6" gutterBottom>
          {viewModel.getFileTypeLabel()} 업로드
        </Typography>
        
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          <Box sx={{ border: '2px dashed #ccc', p: 3, textAlign: 'center' }}>
            <input
              accept={viewModel.getAcceptedExtensions()}
              style={{ display: 'none' }}
              id={`file-upload-${fileType}`}
              type="file"
              onChange={handleFileSelect}
              multiple={fileType === 'learning'}
            />
            <label htmlFor={`file-upload-${fileType}`}>
              <Button
                variant="outlined"
                component="span"
                startIcon={<UploadIcon />}
                disabled={viewModel.uploading}
              >
                파일 선택
              </Button>
            </label>
            
            {viewModel.selectedFile && (
              <Box sx={{ mt: 2 }}>
                <Typography variant="body2" color="text.secondary">
                  선택된 파일: {viewModel.selectedFile.name}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  크기: {(viewModel.selectedFile.size / 1024 / 1024).toFixed(2)} MB
                </Typography>
              </Box>
            )}
          </Box>
          
          {viewModel.uploading && (
            <Box sx={{ width: '100%' }}>
              <LinearProgress 
                variant="determinate" 
                value={viewModel.uploadProgress} 
                sx={{ mb: 1 }}
              />
              <Typography variant="caption" color="text.secondary">
                업로드 진행률: {viewModel.uploadProgress}%
              </Typography>
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
            </Alert>
          </Box>
        )}
      </CardContent>
    </Card>
  );
};

export default FileUploadView; 