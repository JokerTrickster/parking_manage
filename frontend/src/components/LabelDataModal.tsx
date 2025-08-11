import React, { useState, useEffect } from 'react';
import {
  Modal,
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  TextField,
  FormControlLabel,
  Checkbox,
  IconButton,
  Alert,
  CircularProgress,
} from '@mui/material';
import {
  Add as AddIcon,
  Remove as RemoveIcon,
  Save as SaveIcon,
  Close as CloseIcon,
} from '@mui/icons-material';
import { LabelData } from '../models/Label';
import LabelService from '../services/LabelService';

interface LabelDataModalProps {
  open: boolean;
  onClose: () => void;
  projectId: string;
  folderPath: string;
  cctvId: string;
  roiResultImageUrl: string;
}

const LabelDataModal: React.FC<LabelDataModalProps> = ({
  open,
  onClose,
  projectId,
  folderPath,
  cctvId,
  roiResultImageUrl,
}) => {
  const [labels, setLabels] = useState<LabelData[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // 라벨 데이터 로드
  useEffect(() => {
    if (open) {
      loadLabels();
    }
  }, [open, projectId, folderPath, cctvId]);

  const loadLabels = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await LabelService.getLabels(projectId, folderPath, cctvId);
      if (response.success && response.data) {
        setLabels(response.data);
      } else {
        // 데이터가 없으면 빈 배열로 초기화
        setLabels([]);
      }
    } catch (error) {
      console.error('라벨 데이터 로드 실패:', error);
      setError('라벨 데이터를 불러오는데 실패했습니다.');
      setLabels([]);
    } finally {
      setLoading(false);
    }
  };

  // 라벨 추가
  const handleAddLabel = () => {
    setLabels(prev => [...prev, { roi_id: '', has_vehicle: false }]);
  };

  // 라벨 삭제
  const handleRemoveLabel = (index: number) => {
    setLabels(prev => prev.filter((_, i) => i !== index));
  };

  // 라벨 데이터 업데이트
  const handleLabelChange = (index: number, field: keyof LabelData, value: string | boolean) => {
    setLabels(prev => prev.map((label, i) => 
      i === index ? { ...label, [field]: value } : label
    ));
  };

  // 라벨 데이터 저장
  const handleSave = async () => {
    setSaving(true);
    setError(null);
    setSuccess(null);

    try {
      const response = await LabelService.saveLabels(projectId, folderPath, cctvId, {
        labels: labels,
      });

      setSuccess('라벨 데이터가 성공적으로 저장되었습니다.');
      setTimeout(() => {
        onClose();
      }, 1500);
    } catch (error) {
      console.error('라벨 데이터 저장 실패:', error);
      setError('라벨 데이터 저장에 실패했습니다.');
    } finally {
      setSaving(false);
    }
  };

  const handleClose = () => {
    setLabels([]);
    setError(null);
    setSuccess(null);
    onClose();
  };

  return (
    <Modal
      open={open}
      onClose={handleClose}
      aria-labelledby="label-data-modal-title"
      aria-describedby="label-data-modal-description"
    >
      <Box sx={{
        position: 'absolute',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        width: { xs: '95%', sm: '80%', md: '70%' },
        maxWidth: 800,
        maxHeight: '90vh',
        overflow: 'auto',
      }}>
        <Card>
          <CardContent>
            {/* 헤더 */}
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
              <Typography variant="h5" component="h2" id="label-data-modal-title">
                라벨 데이터 생성 및 수정
              </Typography>
              <IconButton onClick={handleClose}>
                <CloseIcon />
              </IconButton>
            </Box>

            <Typography variant="body1" color="text.secondary" sx={{ mb: 2 }}>
              CCTV ID: {cctvId}
            </Typography>

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

            {loading ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
                <CircularProgress />
              </Box>
            ) : (
              <>
                {/* ROI 결과 이미지 */}
                <Box sx={{ mb: 3 }}>
                  <Typography variant="h6" gutterBottom>
                    ROI 결과 이미지
                  </Typography>
                  <Box sx={{ 
                    border: '1px solid #e0e0e0', 
                    borderRadius: 1, 
                    p: 1,
                    display: 'flex',
                    justifyContent: 'center'
                  }}>
                    <img
                      src={roiResultImageUrl}
                      alt="ROI Result"
                      style={{
                        maxWidth: '100%',
                        maxHeight: '300px',
                        objectFit: 'contain',
                      }}
                    />
                  </Box>
                </Box>

                {/* 라벨 데이터 섹션 */}
                <Box sx={{ mb: 3 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                    <Typography variant="h6">
                      라벨 데이터 ({labels.length}개)
                    </Typography>
                    <Button
                      variant="outlined"
                      startIcon={<AddIcon />}
                      onClick={handleAddLabel}
                    >
                      라벨 추가
                    </Button>
                  </Box>

                  {labels.length === 0 ? (
                    <Typography variant="body2" color="text.secondary" textAlign="center" py={2}>
                      라벨 데이터가 없습니다. "라벨 추가" 버튼을 클릭하여 라벨을 추가하세요.
                    </Typography>
                  ) : (
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                      {labels.map((label, index) => (
                        <Box key={index} sx={{ 
                          p: 2, 
                          border: '1px solid #e0e0e0', 
                          borderRadius: 1,
                          display: 'flex',
                          flexDirection: 'column',
                          gap: 2
                        }}>
                          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <Typography variant="subtitle2">
                              라벨 {index + 1}
                            </Typography>
                            <IconButton
                              size="small"
                              onClick={() => handleRemoveLabel(index)}
                              color="error"
                            >
                              <RemoveIcon />
                            </IconButton>
                          </Box>
                          
                          <TextField
                            fullWidth
                            label="ROI ID"
                            value={label.roi_id}
                            onChange={(e) => handleLabelChange(index, 'roi_id', e.target.value)}
                            size="small"
                          />
                          
                          <FormControlLabel
                            control={
                              <Checkbox
                                checked={label.has_vehicle}
                                onChange={(e) => handleLabelChange(index, 'has_vehicle', e.target.checked)}
                              />
                            }
                            label="차량 있음"
                          />
                        </Box>
                      ))}
                    </Box>
                  )}
                </Box>

                {/* 액션 버튼 */}
                <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
                  <Button
                    variant="outlined"
                    onClick={handleClose}
                    disabled={saving}
                  >
                    취소
                  </Button>
                  <Button
                    variant="contained"
                    startIcon={saving ? <CircularProgress size={20} /> : <SaveIcon />}
                    onClick={handleSave}
                    disabled={saving}
                  >
                    {saving ? '저장 중...' : '저장'}
                  </Button>
                </Box>
              </>
            )}
          </CardContent>
        </Card>
      </Box>
    </Modal>
  );
};

export default LabelDataModal;
