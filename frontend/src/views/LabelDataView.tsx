import React, { useState, useEffect, useCallback } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  Pagination,
  CircularProgress,
  Alert,
  FormControlLabel,
  Checkbox,
  TextField,
  IconButton,
  Chip,
} from '@mui/material';
import {
  ArrowBack as BackIcon,
  Save as SaveIcon,
  Add as AddIcon,
  Delete as DeleteIcon,
} from '@mui/icons-material';
import { ImageLabel, LabelData } from '../models/Label';
import LabelService from '../services/LabelService';

interface LabelDataViewProps {
  projectId: string;
  folderPath: string;
  onBack: () => void;
}

const ITEMS_PER_PAGE = 4;

const LabelDataView: React.FC<LabelDataViewProps> = ({
  projectId,
  folderPath,
  onBack,
}) => {
  const [currentPage, setCurrentPage] = useState(1);
  const [imageLabels, setImageLabels] = useState<ImageLabel[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const totalPages = Math.ceil(imageLabels.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const endIndex = startIndex + ITEMS_PER_PAGE;
  const currentImageLabels = imageLabels.slice(startIndex, endIndex);

  // 라벨 데이터 로드
  const loadLabels = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await LabelService.getLabels(projectId, folderPath);
      if (response.success && response.data) {
        setImageLabels(response.data);
      } else {
        // 데이터가 없으면 빈 배열로 초기화
        setImageLabels([]);
      }
    } catch (error) {
      console.error('라벨 데이터 로드 실패:', error);
      setError('라벨 데이터를 불러오는데 실패했습니다.');
      setImageLabels([]);
    } finally {
      setLoading(false);
    }
  }, [projectId, folderPath]);

  useEffect(() => {
    loadLabels();
  }, [loadLabels]);

  // 라벨 저장
  const handleSave = async () => {
    setSaving(true);
    setError(null);
    setSuccess(null);
    
    try {
      const response = await LabelService.saveLabels({
        projectId,
        folderPath,
        imageLabels,
      });
      
      if (response.success) {
        setSuccess('라벨 데이터가 성공적으로 저장되었습니다.');
      } else {
        setError(response.message || '저장에 실패했습니다.');
      }
    } catch (error) {
      console.error('라벨 데이터 저장 실패:', error);
      setError('라벨 데이터 저장에 실패했습니다.');
    } finally {
      setSaving(false);
    }
  };

  // 라벨 추가
  const handleAddLabel = (imageIndex: number) => {
    setImageLabels(prev => {
      const newLabels = [...prev];
      const newLabel: LabelData = {
        roi_id: '',
        has_vehicle: false,
      };
      newLabels[imageIndex].labels.push(newLabel);
      return newLabels;
    });
  };

  // 라벨 삭제
  const handleDeleteLabel = (imageIndex: number, labelIndex: number) => {
    setImageLabels(prev => {
      const newLabels = [...prev];
      newLabels[imageIndex].labels.splice(labelIndex, 1);
      return newLabels;
    });
  };

  // 라벨 데이터 업데이트
  const handleLabelChange = (imageIndex: number, labelIndex: number, field: keyof LabelData, value: string | boolean) => {
    setImageLabels(prev => {
      const newLabels = [...prev];
      newLabels[imageIndex].labels[labelIndex] = {
        ...newLabels[imageIndex].labels[labelIndex],
        [field]: value,
      };
      return newLabels;
    });
  };

  const handlePageChange = (event: React.ChangeEvent<unknown>, value: number) => {
    setCurrentPage(value);
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
        <CircularProgress size={60} />
      </Box>
    );
  }

  return (
    <Box>
      {/* 헤더 */}
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 4 }}>
        <Button
          startIcon={<BackIcon />}
          onClick={onBack}
          sx={{ mr: 2 }}
        >
          테스트 이미지 관리로
        </Button>
        <Typography variant="h4" component="h1">
          라벨 데이터 생성 및 수정
        </Typography>
      </Box>

      <Card>
        <CardContent>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
            <Typography variant="h6">
              폴더: {folderPath}
            </Typography>
            <Button
              variant="contained"
              startIcon={saving ? <CircularProgress size={20} /> : <SaveIcon />}
              onClick={handleSave}
              disabled={saving}
            >
              {saving ? '저장 중...' : '저장'}
            </Button>
          </Box>

          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}

          {success && (
            <Alert severity="success" sx={{ mb: 2 }}>
              {success}
            </Alert>
          )}

          {currentImageLabels.length === 0 ? (
            <Typography variant="body1" color="text.secondary" textAlign="center" py={4}>
              라벨 데이터가 없습니다.
            </Typography>
          ) : (
            <>
              {/* 이미지 및 라벨 목록 */}
              <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)' }, gap: 3 }}>
                {currentImageLabels.map((imageLabel, imageIndex) => (
                  <Box key={imageLabel.image_id}>
                    <Card variant="outlined">
                      <CardContent>
                        <Typography variant="h6" component="h3" gutterBottom>
                          이미지 {startIndex + imageIndex + 1}
                        </Typography>
                        
                        {/* 이미지 */}
                        <Box sx={{ mb: 2 }}>
                          <img
                            src={imageLabel.image_url}
                            alt={`Image ${startIndex + imageIndex + 1}`}
                            style={{
                              width: '100%',
                              height: 'auto',
                              maxHeight: '200px',
                              objectFit: 'contain',
                              border: '1px solid #e0e0e0',
                              borderRadius: '4px',
                            }}
                          />
                        </Box>

                        {/* 라벨 목록 */}
                        <Box sx={{ mb: 2 }}>
                          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                            <Typography variant="subtitle2">
                              ROI 라벨 ({imageLabel.labels.length}개)
                            </Typography>
                            <Button
                              size="small"
                              startIcon={<AddIcon />}
                              onClick={() => handleAddLabel(startIndex + imageIndex)}
                            >
                              라벨 추가
                            </Button>
                          </Box>

                          {imageLabel.labels.map((label, labelIndex) => (
                            <Box key={labelIndex} sx={{ mb: 2, p: 2, border: '1px solid #e0e0e0', borderRadius: 1 }}>
                              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                                <Chip label={`ROI ${labelIndex + 1}`} size="small" color="primary" />
                                <IconButton
                                  size="small"
                                  onClick={() => handleDeleteLabel(startIndex + imageIndex, labelIndex)}
                                  color="error"
                                >
                                  <DeleteIcon />
                                </IconButton>
                              </Box>
                              
                              <TextField
                                fullWidth
                                label="ROI ID"
                                value={label.roi_id}
                                onChange={(e) => handleLabelChange(startIndex + imageIndex, labelIndex, 'roi_id', e.target.value)}
                                size="small"
                                sx={{ mb: 1 }}
                              />
                              
                              <FormControlLabel
                                control={
                                  <Checkbox
                                    checked={label.has_vehicle}
                                    onChange={(e) => handleLabelChange(startIndex + imageIndex, labelIndex, 'has_vehicle', e.target.checked)}
                                  />
                                }
                                label="차량 유무"
                              />
                            </Box>
                          ))}
                        </Box>
                      </CardContent>
                    </Card>
                  </Box>
                ))}
              </Box>

              {/* 페이지네이션 */}
              {totalPages > 1 && (
                <Box sx={{ display: 'flex', justifyContent: 'center', mt: 3 }}>
                  <Pagination 
                    count={totalPages} 
                    page={currentPage} 
                    onChange={handlePageChange}
                    showFirstButton 
                    showLastButton
                  />
                </Box>
              )}
            </>
          )}
        </CardContent>
      </Card>
    </Box>
  );
};

export default LabelDataView;
