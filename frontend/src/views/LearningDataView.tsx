import React, { useState, useEffect, useContext } from 'react';
import {
  Box,
  Button,
  Typography,
  Paper,
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
  Container,
  AppBar,
  Toolbar,
  alpha,
  useTheme
} from '@mui/material';
import {
  ArrowBack as BackIcon,
  Delete as DeleteIcon,
  Folder as FolderIcon,
  FolderOpen as FolderOpenIcon,
  Refresh as RefreshIcon,
  Warning as WarningIcon,
  LightMode as LightModeIcon,
  DarkMode as DarkModeIcon,
  CloudUpload as CloudUploadIcon
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { Project } from '../models/Project';
import FileUploadView from './FileUploadView';
import { FileUploadService, FolderInfo } from '../services/FileUploadService';
import { ThemeContext } from '../App';
import { GRADIENTS, SHADOWS } from '../styles/theme';
import '../index.css';

interface LearningDataViewProps {
  project: Project;
  onBack: () => void;
}

const LearningDataView: React.FC<LearningDataViewProps> = ({ project, onBack }) => {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';
  const { mode, toggleTheme } = useContext(ThemeContext);
  const navigate = useNavigate();

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
    <Box sx={{ minHeight: '100vh', bgcolor: 'background.default' }}>
      {/* Header */}
      <AppBar
        position="sticky"
        className="glass-medium"
        sx={{
          bgcolor: isDark ? alpha(theme.palette.background.paper, 0.8) : alpha(theme.palette.background.paper, 0.95),
          borderBottom: '1px solid',
          borderColor: 'divider',
          backdropFilter: 'blur(10px)'
        }}
        elevation={0}
      >
        <Toolbar>
          <IconButton
            edge="start"
            onClick={onBack}
            className="hover-lift"
            sx={{ mr: 2 }}
          >
            <BackIcon />
          </IconButton>

          <CloudUploadIcon sx={{ mr: 2, color: 'primary.main' }} />

          <Typography variant="h6" sx={{ flexGrow: 1, fontWeight: 700 }}>
            학습 데이터 관리 - {project.name}
          </Typography>

          {/* Refresh button */}
          <IconButton
            onClick={loadFolders}
            className="hover-lift"
            disabled={loading}
            sx={{ mr: 1 }}
          >
            <RefreshIcon className={loading ? 'animate-spin' : ''} />
          </IconButton>

          {/* Theme toggle */}
          <IconButton
            onClick={toggleTheme}
            className="hover-lift"
          >
            {isDark ? <LightModeIcon /> : <DarkModeIcon />}
          </IconButton>
        </Toolbar>
      </AppBar>

      <Container maxWidth="xl" sx={{ py: 4 }}>

      {/* 성공/오류 메시지 */}
      {success && (
        <Alert
          severity="success"
          sx={{ mb: 3 }}
          className="animate-fade-in"
        >
          {success}
        </Alert>
      )}

      {error && (
        <Alert
          severity="error"
          sx={{ mb: 3 }}
          className="animate-fade-in"
        >
          {error}
        </Alert>
      )}

      {/* 3개 섹션을 가로로 배치 */}
      <Box sx={{
        display: 'grid',
        gridTemplateColumns: {
          xs: '1fr',
          md: 'repeat(2, 1fr)',
          lg: 'repeat(3, 1fr)'
        },
        gap: 3
      }}>
        {/* 학습 이미지 관리 */}
        <Paper
          className="glass-medium animate-fade-in hover-lift"
          sx={{
            boxShadow: isDark ? SHADOWS.dark.sm : SHADOWS.light.sm,
            border: '1px solid',
            borderColor: 'divider',
            p: 3
          }}
        >
          <Typography variant="h6" gutterBottom sx={{ fontWeight: 600, mb: 3 }}>
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
        </Paper>

        {/* 테스트 이미지 관리 */}
        <Paper
          className="glass-medium animate-fade-in hover-lift"
          sx={{
            boxShadow: isDark ? SHADOWS.dark.sm : SHADOWS.light.sm,
            border: '1px solid',
            borderColor: 'divider',
            p: 3,
            animationDelay: '0.1s'
          }}
        >
          <Typography variant="h6" gutterBottom sx={{ fontWeight: 600, mb: 3 }}>
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
        </Paper>

        {/* ROI 파일 관리 */}
        <Paper
          className="glass-medium animate-fade-in hover-lift"
          sx={{
            boxShadow: isDark ? SHADOWS.dark.sm : SHADOWS.light.sm,
            border: '1px solid',
            borderColor: 'divider',
            p: 3,
            animationDelay: '0.2s'
          }}
        >
          <Typography variant="h6" gutterBottom sx={{ fontWeight: 600, mb: 3 }}>
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
        </Paper>
      </Box>

      {/* 삭제 확인 다이얼로그 */}
      <Dialog
        open={deleteDialogOpen}
        onClose={handleDeleteCancel}
        PaperProps={{
          className: 'glass-medium',
          sx: {
            boxShadow: isDark ? SHADOWS.dark.xl : SHADOWS.light.xl,
            border: '1px solid',
            borderColor: 'divider'
          }
        }}
      >
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
          <Button
            onClick={handleDeleteCancel}
            className="hover-lift"
          >
            취소
          </Button>
          <Button
            onClick={handleDeleteConfirm}
            color="error"
            variant="contained"
            className="hover-lift"
            sx={{
              '&:hover': {
                boxShadow: isDark ? SHADOWS.dark.md : SHADOWS.light.md
              }
            }}
          >
            삭제
          </Button>
        </DialogActions>
      </Dialog>
      </Container>
    </Box>
  );
};

export default LearningDataView;
