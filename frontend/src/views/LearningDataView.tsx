import React, { useState, useEffect } from 'react';
import {
  Box,
  Button,
  Typography,
  Card,
  CardContent,
  Alert,
  CircularProgress,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  ListItemIcon,
  ListItemSecondaryAction,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Divider,
  Chip,
} from '@mui/material';
import {
  ArrowBack as BackIcon,
  Delete as DeleteIcon,
  Folder as FolderIcon,
  FolderOpen as FolderOpenIcon,
  Refresh as RefreshIcon,
  Warning as WarningIcon,
} from '@mui/icons-material';
import { Project } from '../models/Project';
import FileUploadView from './FileUploadView';
import { FileUploadService, FolderInfo } from '../services/FileUploadService';

interface LearningDataViewProps {
  project: Project;
  onBack: () => void;
}

const LearningDataView: React.FC<LearningDataViewProps> = ({ project, onBack }) => {
  const [learningFolders, setLearningFolders] = useState<FolderInfo[]>([]);
  const [testFolders, setTestFolders] = useState<FolderInfo[]>([]);
  const [roiFolders, setRoiFolders] = useState<FolderInfo[]>([]);
  const [loading, setLoading] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<{ type: string; folder: FolderInfo } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // 폴더 목록 로드
  const loadFolders = async () => {
    setLoading(true);
    setError(null);
    try {
      const [learning, test, roi] = await Promise.all([
        FileUploadService.getExistingFolders(project.id, 'learning'),
        FileUploadService.getExistingFolders(project.id, 'test'),
        FileUploadService.getExistingFolders(project.id, 'roi'),
      ]);
      
      setLearningFolders(learning);
      setTestFolders(test);
      setRoiFolders(roi);
    } catch (error) {
      console.error('폴더 로드 실패:', error);
      setError('폴더 목록을 불러오는데 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadFolders();
  }, [project.id]);

  // 업로드 성공 후 폴더 목록 새로고침
  const handleUploadSuccess = () => {
    loadFolders();
    setSuccess('파일이 성공적으로 업로드되었습니다.');
    setTimeout(() => setSuccess(null), 3000);
  };

  // 삭제 다이얼로그 열기
  const handleDeleteClick = (type: string, folder: FolderInfo) => {
    setItemToDelete({ type, folder });
    setDeleteDialogOpen(true);
  };

  // 삭제 확인
  const handleDeleteConfirm = async () => {
    if (!itemToDelete) return;

    try {
      // 백엔드 API 호출
      const result = await FileUploadService.deleteFileOrFolder(
        project.id,
        itemToDelete.type as 'learning' | 'test' | 'roi',
        itemToDelete.folder.name
      );
      
      if (result.success) {
        // 삭제 성공 후 목록 새로고침
        await loadFolders();
        
        setSuccess(result.message);
        setTimeout(() => setSuccess(null), 3000);
      } else {
        setError(result.message || '삭제에 실패했습니다.');
        setTimeout(() => setError(null), 3000);
      }
    } catch (error) {
      console.error('삭제 실패:', error);
      setError('삭제에 실패했습니다.');
      setTimeout(() => setError(null), 3000);
    } finally {
      setDeleteDialogOpen(false);
      setItemToDelete(null);
    }
  };

  // 삭제 취소
  const handleDeleteCancel = () => {
    setDeleteDialogOpen(false);
    setItemToDelete(null);
  };

  return (
    <Box>
      {/* 헤더 */}
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 4 }}>
        <Button
          startIcon={<BackIcon />}
          onClick={onBack}
          sx={{ mr: 2 }}
        >
          대시보드로
        </Button>
        <Typography variant="h4" component="h1">
          학습 데이터 등록 - {project.name}
        </Typography>
      </Box>

      {/* 성공/오류 메시지 */}
      {success && (
        <Alert severity="success" sx={{ mb: 2 }}>
          {success}
        </Alert>
      )}
      
      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {/* 3개 섹션을 가로로 배치 */}
      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 3 }}>
        {/* 학습 이미지 관리 */}
        <Card sx={{ flex: '1 1 400px', minWidth: 0 }}>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              학습 이미지 관리
            </Typography>
            
            {loading ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', py: 2 }}>
                <CircularProgress size={24} />
              </Box>
            ) : (
              <FileUploadView
                projectId={project.id}
                fileType="learning"
                onUploadSuccess={handleUploadSuccess}
                onDeleteFolder={(folder) => handleDeleteClick('learning', folder)}
              />
            )}
          </CardContent>
        </Card>

        {/* 테스트 이미지 관리 */}
        <Card sx={{ flex: '1 1 400px', minWidth: 0 }}>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              테스트 이미지 관리
            </Typography>
            
            {loading ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', py: 2 }}>
                <CircularProgress size={24} />
              </Box>
            ) : (
              <FileUploadView
                projectId={project.id}
                fileType="test"
                onUploadSuccess={handleUploadSuccess}
                onDeleteFolder={(folder) => handleDeleteClick('test', folder)}
              />
            )}
          </CardContent>
        </Card>

        {/* ROI 파일 관리 */}
        <Card sx={{ flex: '1 1 400px', minWidth: 0 }}>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              ROI 파일 관리
            </Typography>
            
            {loading ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', py: 2 }}>
                <CircularProgress size={24} />
              </Box>
            ) : (
              <FileUploadView
                projectId={project.id}
                fileType="roi"
                onUploadSuccess={handleUploadSuccess}
                onDeleteFolder={(folder) => handleDeleteClick('roi', folder)}
              />
            )}
          </CardContent>
        </Card>
      </Box>

      {/* 삭제 확인 다이얼로그 */}
      <Dialog open={deleteDialogOpen} onClose={handleDeleteCancel}>
        <DialogTitle>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <WarningIcon color="warning" />
            삭제 확인
          </Box>
        </DialogTitle>
        <DialogContent>
          <Typography>
            <strong>{itemToDelete?.folder.name}</strong>을(를) 삭제하시겠습니까?
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
            이 작업은 되돌릴 수 없습니다.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleDeleteCancel}>취소</Button>
          <Button onClick={handleDeleteConfirm} color="error" variant="contained">
            삭제
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default LearningDataView;
