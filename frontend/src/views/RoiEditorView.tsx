import React, { useState, useEffect, useRef } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Alert,
  Container,
  IconButton,
  Chip,
  Stack,
  Divider,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  DialogContentText
} from '@mui/material';
import {
  ArrowBack as BackIcon,
  Save as SaveIcon,
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Cancel as CancelIcon,
  Undo as UndoIcon
} from '@mui/icons-material';
import { Project } from '../models/Project';
import { RoiData, RoiRegion, RoiFile } from '../models/RoiData';
import { CctvTemplate, CctvConfig } from '../models/CctvTemplate';
import { FileStorageService } from '../services/FileStorageService';
import { CctvTemplateService } from '../services/CctvTemplateService';

interface RoiEditorViewProps {
  project: Project;
  onBack?: () => void;
}

type EditMode = 'view' | 'add' | 'edit' | 'delete';

const RoiEditorView: React.FC<RoiEditorViewProps> = ({ project, onBack }) => {
  // 상태 관리
  const [roiFiles, setRoiFiles] = useState<string[]>([]);
  const [selectedRoiFile, setSelectedRoiFile] = useState<string>('');
  const [roiData, setRoiData] = useState<RoiData | null>(null);
  const [originalRoiData, setOriginalRoiData] = useState<RoiData | null>(null); // 롤백용 원본 데이터

  const [cctvTemplate, setCctvTemplate] = useState<CctvTemplate | null>(null);
  const [selectedCctv, setSelectedCctv] = useState<string>('');
  const [cctvImageUrl, setCctvImageUrl] = useState<string>('');

  const [editMode, setEditMode] = useState<EditMode>('view');
  const [selectedRoiId, setSelectedRoiId] = useState<string | null>(null);
  const [tempRois, setTempRois] = useState<RoiRegion[]>([]);
  const [editingRoiId, setEditingRoiId] = useState<string | null>(null); // 수정 중인 ROI ID

  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  // 다이얼로그 상태
  const [saveDialogOpen, setSaveDialogOpen] = useState(false);
  const [newFileName, setNewFileName] = useState('');
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);
  const [pendingRoiFile, setPendingRoiFile] = useState<string>('');

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [imageLoaded, setImageLoaded] = useState(false);
  const imageRef = useRef<HTMLImageElement | null>(null);

  // 초기 로드
  useEffect(() => {
    loadRoiFiles();
    loadCctvTemplate();
  }, [project.id]);

  const loadRoiFiles = async () => {
    try {
      setLoading(true);
      const response = await FileStorageService.listFiles(project.id, 'roi');
      const files = response.data.files.map((f: any) => f.filename);
      setRoiFiles(files);
      setError(null);
    } catch (error: any) {
      console.error('ROI 파일 목록 로드 실패:', error);
      setError('ROI 파일 목록을 불러올 수 없습니다.');
    } finally {
      setLoading(false);
    }
  };

  const loadCctvTemplate = () => {
    try {
      const template = CctvTemplateService.getTemplateByProjectId(project.id);
      if (template) {
        setCctvTemplate(template);
      } else {
        setError(`프로젝트 "${project.id}"의 CCTV 템플릿을 찾을 수 없습니다.`);
      }
    } catch (error) {
      console.error('CCTV 템플릿 로드 실패:', error);
      setError('CCTV 템플릿을 불러올 수 없습니다.');
    }
  };

  const handleRoiFileSelect = async (filename: string) => {
    if (!filename) return;

    // 기존 작업이 있으면 확인 다이얼로그 표시
    if (selectedRoiFile && tempRois.length > 0) {
      setPendingRoiFile(filename);
      setConfirmDialogOpen(true);
      return;
    }

    loadRoiFile(filename);
  };

  const loadRoiFile = async (filename: string) => {
    setSelectedRoiFile(filename);

    try {
      setLoading(true);
      const blob = await FileStorageService.downloadFile(project.id, 'roi', filename);
      const text = await blob.text();
      const data: RoiData = JSON.parse(text);
      setRoiData(data);
      setOriginalRoiData(JSON.parse(JSON.stringify(data))); // 원본 데이터 깊은 복사
      setTempRois(data.rois);

      // ROI 파일의 CCTV ID로 자동 선택
      if (data.cctv_id) {
        setSelectedCctv(data.cctv_id);

        // CCTV 이미지 로드
        if (cctvTemplate) {
          const cctv = cctvTemplate.cctvList.find(c => c.cctvId === data.cctv_id);
          if (cctv) {
            const originalImage = cctv.images.find(img => img.type === 'original');
            if (originalImage) {
              const timestamp = new Date().getTime();
              const imageUrl = `${originalImage.endpoint}?t=${timestamp}`;
              setCctvImageUrl(imageUrl);
              loadImage(imageUrl);
            }
          }
        }
      }

      setError(null);
    } catch (error: any) {
      console.error('ROI 데이터 로드 실패:', error);
      setError('ROI 데이터를 불러올 수 없습니다.');
      setSelectedCctv('');
      setCctvImageUrl('');
      setImageLoaded(false);
    } finally {
      setLoading(false);
    }
  };

  const handleConfirmFileChange = () => {
    setConfirmDialogOpen(false);
    loadRoiFile(pendingRoiFile);
    setPendingRoiFile('');
  };

  const handleCancelFileChange = () => {
    setConfirmDialogOpen(false);
    setPendingRoiFile('');
  };


  const loadImage = (url: string) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      imageRef.current = img;
      setImageLoaded(true);
      drawCanvas();
    };
    img.onerror = () => {
      setError('이미지를 불러올 수 없습니다.');
      setImageLoaded(false);
    };
    img.src = url;
  };

  const drawCanvas = () => {
    const canvas = canvasRef.current;
    const img = imageRef.current;
    if (!canvas || !img) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // 캔버스 크기 설정
    canvas.width = img.width;
    canvas.height = img.height;

    // 이미지 그리기
    ctx.drawImage(img, 0, 0);

    // ROI 영역 그리기
    tempRois.forEach((roi) => {
      drawRoi(ctx, roi, roi.roi_id === selectedRoiId);
    });
  };

  const drawRoi = (ctx: CanvasRenderingContext2D, roi: RoiRegion, isSelected: boolean) => {
    const coords = roi.coords;

    ctx.beginPath();
    ctx.moveTo(coords[0], coords[1]);
    for (let i = 2; i < coords.length; i += 2) {
      ctx.lineTo(coords[i], coords[i + 1]);
    }
    ctx.closePath();

    // 선 스타일
    ctx.strokeStyle = isSelected ? '#ff0000' : '#00ff00';
    ctx.lineWidth = isSelected ? 3 : 2;
    ctx.stroke();

    // 반투명 채우기
    ctx.fillStyle = isSelected ? 'rgba(255, 0, 0, 0.2)' : 'rgba(0, 255, 0, 0.1)';
    ctx.fill();

    // ROI ID 표시
    const centerX = coords.reduce((sum, val, idx) => idx % 2 === 0 ? sum + val : sum, 0) / (coords.length / 2);
    const centerY = coords.reduce((sum, val, idx) => idx % 2 === 1 ? sum + val : sum, 0) / (coords.length / 2);

    ctx.fillStyle = isSelected ? '#ff0000' : '#00ff00';
    ctx.font = 'bold 16px Arial';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(roi.roi_id, centerX, centerY);
  };

  useEffect(() => {
    if (imageLoaded) {
      drawCanvas();
    }
  }, [imageLoaded, tempRois, selectedRoiId]);

  const handleAddRoi = () => {
    setEditMode('add');
    // 새로운 ROI ID 생성 (기존 ID 중 가장 큰 번호 + 1)
    const maxId = tempRois.reduce((max, roi) => {
      const match = roi.roi_id.match(/ROI_(\d+)/);
      if (match) {
        const num = parseInt(match[1], 10);
        return num > max ? num : max;
      }
      return max;
    }, 0);

    const newRoiId = `ROI_${String(maxId + 1).padStart(2, '0')}`;

    // 기본 ROI 영역 추가 (이미지 중앙에 작은 사각형)
    const img = imageRef.current;
    if (img) {
      const centerX = img.width / 2;
      const centerY = img.height / 2;
      const size = 100;

      const newRoi: RoiRegion = {
        roi_id: newRoiId,
        coords: [
          centerX - size, centerY - size,
          centerX + size, centerY - size,
          centerX + size, centerY + size,
          centerX - size, centerY + size
        ]
      };

      setTempRois([...tempRois, newRoi]);
      setSelectedRoiId(newRoiId);
    }
  };

  const handleEditRoi = (roiId: string) => {
    setEditMode('edit');
    setEditingRoiId(roiId); // 수정 중인 ROI ID 저장
    setSelectedRoiId(roiId);

    // 기존 ROI를 임시로 숨김 (수정 모드)
    const currentRoi = tempRois.find(roi => roi.roi_id === roiId);
    if (currentRoi) {
      // 현재 ROI를 제외한 나머지만 표시
      const otherRois = tempRois.filter(roi => roi.roi_id !== roiId);
      // 캔버스에서는 otherRois만 그리고, 편집은 currentRoi 좌표를 기반으로 시작
    }
  };

  const handleDeleteRoi = (roiId: string) => {
    const updatedRois = tempRois.filter(roi => roi.roi_id !== roiId);
    setTempRois(updatedRois);
    setSelectedRoiId(null);
    setMessage(`${roiId}가 삭제되었습니다.`);
    setTimeout(() => setMessage(null), 3000);
  };

  const handleRollback = () => {
    if (!originalRoiData) {
      setError('롤백할 원본 데이터가 없습니다.');
      return;
    }

    // 원본 데이터로 복원
    setTempRois(originalRoiData.rois);
    setRoiData(JSON.parse(JSON.stringify(originalRoiData))); // 깊은 복사
    setEditMode('view');
    setSelectedRoiId(null);
    setEditingRoiId(null);
    setMessage('원본 ROI 데이터로 롤백되었습니다.');
    setTimeout(() => setMessage(null), 3000);
  };

  const handleCancelEdit = () => {
    setEditMode('view');
    setSelectedRoiId(null);
    // 원본 데이터로 복원
    if (roiData) {
      setTempRois(roiData.rois);
    }
  };

  const handleOpenSaveDialog = () => {
    setSaveDialogOpen(true);
    setNewFileName('');
  };

  const handleCloseSaveDialog = () => {
    setSaveDialogOpen(false);
    setNewFileName('');
  };

  const handleFinalSave = async () => {
    if (!roiData || !selectedCctv || !newFileName.trim()) {
      setError('파일명을 입력해주세요.');
      return;
    }

    try {
      setLoading(true);

      // 이미지 크기 가져오기
      const img = imageRef.current;
      const imageWidth = img?.width || roiData.image_width;
      const imageHeight = img?.height || roiData.image_height;

      const updatedData: RoiData = {
        cctv_id: selectedCctv,
        rois: tempRois,
        image_width: imageWidth,
        image_height: imageHeight
      };

      // 파일명에 .json 확장자 추가 (없으면)
      const filename = newFileName.endsWith('.json') ? newFileName : `${newFileName}.json`;

      const file = new File(
        [JSON.stringify(updatedData, null, 2)],
        filename,
        { type: 'application/json' }
      );

      // 파일 다운로드 (브라우저)
      const url = URL.createObjectURL(file);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      // 서버에도 업로드 (선택사항)
      await FileStorageService.uploadFiles(
        project.id,
        'roi',
        [file]
      );

      setRoiData(updatedData);
      setOriginalRoiData(JSON.parse(JSON.stringify(updatedData))); // 원본 데이터 업데이트
      setEditMode('view');
      setSelectedRoiId(null);
      setEditingRoiId(null);
      setMessage(`ROI 파일이 저장되었습니다: ${filename}`);
      setTimeout(() => setMessage(null), 5000);
      setError(null);
      setSaveDialogOpen(false);

      // ROI 파일 목록 새로고침
      await loadRoiFiles();
    } catch (error: any) {
      console.error('ROI 저장 실패:', error);
      setError('ROI 데이터 저장에 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container maxWidth="xl" sx={{ py: 3 }}>
      {/* 헤더 */}
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
        {onBack && (
          <Button startIcon={<BackIcon />} onClick={onBack} sx={{ mr: 2 }}>
            뒤로
          </Button>
        )}
        <Typography variant="h4" component="h1" sx={{ flexGrow: 1 }}>
          ROI 편집기
        </Typography>
        <Button
          variant="contained"
          color="success"
          startIcon={<SaveIcon />}
          onClick={handleOpenSaveDialog}
          disabled={!selectedCctv || tempRois.length === 0}
          size="large"
        >
          최종 저장
        </Button>
      </Box>

      {/* 메시지 및 에러 */}
      {message && <Alert severity="success" sx={{ mb: 2 }}>{message}</Alert>}
      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

      {/* 선택 영역 */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>ROI 파일 선택</Typography>
          <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', alignItems: 'center' }}>
            <FormControl sx={{ minWidth: 300 }}>
              <InputLabel>ROI 파일</InputLabel>
              <Select
                value={selectedRoiFile}
                onChange={(e) => handleRoiFileSelect(e.target.value)}
                label="ROI 파일"
              >
                {roiFiles.map((file) => (
                  <MenuItem key={file} value={file}>{file}</MenuItem>
                ))}
              </Select>
            </FormControl>

            {selectedCctv && cctvTemplate && (
              <Chip
                label={`CCTV: ${cctvTemplate.cctvList.find(c => c.cctvId === selectedCctv)?.displayName || selectedCctv}`}
                color="primary"
                variant="outlined"
              />
            )}
          </Box>
        </CardContent>
      </Card>

      {/* 이미지 및 편집 영역 */}
      {selectedCctv && cctvImageUrl && (
        <Card>
          <CardContent>
            <Box sx={{ mb: 2 }}>
              <Typography variant="h6">
                ROI 편집 - {cctvTemplate?.cctvList.find(c => c.cctvId === selectedCctv)?.displayName}
              </Typography>
            </Box>

            <Divider sx={{ mb: 2 }} />

            <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 3 }}>
              {/* 원본 이미지 (읽기 전용) */}
              <Box>
                <Typography variant="subtitle2" gutterBottom sx={{ fontWeight: 600 }}>
                  원본 이미지
                </Typography>
                <Box sx={{ border: '2px solid #e0e0e0', borderRadius: 2, overflow: 'hidden' }}>
                  <img
                    src={cctvImageUrl}
                    alt="Original"
                    style={{ width: '100%', height: 'auto', display: 'block' }}
                  />
                </Box>
              </Box>

              {/* ROI 편집 캔버스 */}
              <Box>
                <Typography variant="subtitle2" gutterBottom sx={{ fontWeight: 600 }}>
                  편집 가능한 이미지 ({tempRois.length}개 영역)
                </Typography>
                <Box sx={{ border: '2px solid #e0e0e0', borderRadius: 2, overflow: 'hidden', mb: 2 }}>
                  <canvas
                    ref={canvasRef}
                    style={{ width: '100%', height: 'auto', display: 'block' }}
                  />
                </Box>

                {/* 편집 버튼 */}
                <Stack direction="row" spacing={1} sx={{ mb: 2 }}>
                  <Button
                    variant="outlined"
                    startIcon={<AddIcon />}
                    onClick={handleAddRoi}
                    size="small"
                    fullWidth
                  >
                    생성
                  </Button>
                  <Button
                    variant="outlined"
                    startIcon={<EditIcon />}
                    onClick={() => selectedRoiId && handleEditRoi(selectedRoiId)}
                    disabled={!selectedRoiId}
                    size="small"
                    fullWidth
                  >
                    수정
                  </Button>
                  <Button
                    variant="outlined"
                    color="error"
                    startIcon={<DeleteIcon />}
                    onClick={() => selectedRoiId && handleDeleteRoi(selectedRoiId)}
                    disabled={!selectedRoiId}
                    size="small"
                    fullWidth
                  >
                    삭제
                  </Button>
                  <Button
                    variant="outlined"
                    color="warning"
                    startIcon={<UndoIcon />}
                    onClick={handleRollback}
                    disabled={!originalRoiData}
                    size="small"
                    fullWidth
                  >
                    롤백
                  </Button>
                </Stack>

                {editMode !== 'view' && (
                  <Stack direction="row" spacing={1} sx={{ mb: 2 }}>
                    <Button
                      variant="outlined"
                      startIcon={<CancelIcon />}
                      onClick={handleCancelEdit}
                      size="small"
                      fullWidth
                    >
                      편집 취소
                    </Button>
                  </Stack>
                )}

                {/* ROI 목록 */}
                <Box>
                  <Typography variant="caption" color="text.secondary" gutterBottom display="block">
                    ROI 목록 (클릭하여 선택)
                  </Typography>
                  <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                    {tempRois.map((roi) => (
                      <Chip
                        key={roi.roi_id}
                        label={roi.roi_id}
                        color={roi.roi_id === selectedRoiId ? 'primary' : 'default'}
                        onClick={() => setSelectedRoiId(roi.roi_id)}
                        sx={{ mb: 1 }}
                      />
                    ))}
                  </Stack>
                </Box>
              </Box>
            </Box>
          </CardContent>
        </Card>
      )}
      {/* 최종 저장 다이얼로그 */}
      <Dialog open={saveDialogOpen} onClose={handleCloseSaveDialog}>
        <DialogTitle>ROI 파일 저장</DialogTitle>
        <DialogContent>
          <DialogContentText sx={{ mb: 2 }}>
            저장할 ROI 파일의 이름을 입력하세요.
          </DialogContentText>
          <TextField
            autoFocus
            margin="dense"
            label="파일명"
            type="text"
            fullWidth
            variant="outlined"
            value={newFileName}
            onChange={(e) => setNewFileName(e.target.value)}
            placeholder="예: new_roi_data"
            helperText=".json 확장자는 자동으로 추가됩니다."
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseSaveDialog}>취소</Button>
          <Button onClick={handleFinalSave} variant="contained" disabled={!newFileName.trim()}>
            저장 및 다운로드
          </Button>
        </DialogActions>
      </Dialog>

      {/* ROI 파일 변경 확인 다이얼로그 */}
      <Dialog open={confirmDialogOpen} onClose={handleCancelFileChange}>
        <DialogTitle>ROI 파일 변경</DialogTitle>
        <DialogContent>
          <DialogContentText>
            기존 작업했던 내용이 모두 삭제됩니다. 계속하시겠습니까?
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCancelFileChange}>취소</Button>
          <Button onClick={handleConfirmFileChange} color="error" variant="contained">
            변경
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default RoiEditorView;
