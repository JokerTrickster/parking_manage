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
  Divider
} from '@mui/material';
import {
  ArrowBack as BackIcon,
  Save as SaveIcon,
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Cancel as CancelIcon
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

  const [cctvTemplate, setCctvTemplate] = useState<CctvTemplate | null>(null);
  const [selectedCctv, setSelectedCctv] = useState<string>('');
  const [cctvImageUrl, setCctvImageUrl] = useState<string>('');

  const [editMode, setEditMode] = useState<EditMode>('view');
  const [selectedRoiId, setSelectedRoiId] = useState<string | null>(null);
  const [tempRois, setTempRois] = useState<RoiRegion[]>([]);

  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

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

    setSelectedRoiFile(filename);

    try {
      setLoading(true);
      const blob = await FileStorageService.downloadFile(project.id, 'roi', filename);
      const text = await blob.text();
      const data: RoiData = JSON.parse(text);
      setRoiData(data);
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
    setSelectedRoiId(roiId);
  };

  const handleDeleteRoi = (roiId: string) => {
    const updatedRois = tempRois.filter(roi => roi.roi_id !== roiId);
    setTempRois(updatedRois);
    setSelectedRoiId(null);
    setMessage(`${roiId}가 삭제되었습니다.`);
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

  const handleSave = async () => {
    if (!roiData || !selectedCctv) return;

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

      // 새로운 파일명 생성 (CCTV_ID_timestamp.json)
      const timestamp = Date.now();
      const newFilename = `${selectedCctv}_${timestamp}.json`;

      const file = new File(
        [JSON.stringify(updatedData, null, 2)],
        newFilename,
        { type: 'application/json' }
      );

      await FileStorageService.uploadFiles(
        project.id,
        'roi',
        [file]
      );

      setRoiData(updatedData);
      setEditMode('view');
      setSelectedRoiId(null);
      setMessage(`새로운 ROI 파일이 생성되었습니다: ${newFilename}`);
      setTimeout(() => setMessage(null), 5000);
      setError(null);

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
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="h6">
                ROI 편집 - {cctvTemplate?.cctvList.find(c => c.cctvId === selectedCctv)?.displayName}
              </Typography>
              <Stack direction="row" spacing={1}>
                {editMode === 'view' && (
                  <>
                    <Button
                      variant="outlined"
                      startIcon={<AddIcon />}
                      onClick={handleAddRoi}
                      size="small"
                    >
                      추가
                    </Button>
                    <Button
                      variant="contained"
                      startIcon={<SaveIcon />}
                      onClick={handleSave}
                      disabled={JSON.stringify(tempRois) === JSON.stringify(roiData?.rois)}
                      size="small"
                    >
                      저장
                    </Button>
                  </>
                )}
                {editMode !== 'view' && (
                  <Button
                    variant="outlined"
                    startIcon={<CancelIcon />}
                    onClick={handleCancelEdit}
                    size="small"
                  >
                    취소
                  </Button>
                )}
              </Stack>
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
                  ROI 편집 ({tempRois.length}개 영역)
                </Typography>
                <Box sx={{ border: '2px solid #e0e0e0', borderRadius: 2, overflow: 'hidden', mb: 2 }}>
                  <canvas
                    ref={canvasRef}
                    style={{ width: '100%', height: 'auto', display: 'block' }}
                  />
                </Box>

                {/* ROI 목록 */}
                <Box>
                  <Typography variant="caption" color="text.secondary" gutterBottom display="block">
                    ROI 목록 (클릭하여 편집/삭제)
                  </Typography>
                  <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                    {tempRois.map((roi) => (
                      <Chip
                        key={roi.roi_id}
                        label={roi.roi_id}
                        color={roi.roi_id === selectedRoiId ? 'primary' : 'default'}
                        onClick={() => handleEditRoi(roi.roi_id)}
                        onDelete={() => handleDeleteRoi(roi.roi_id)}
                        deleteIcon={<DeleteIcon />}
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
    </Container>
  );
};

export default RoiEditorView;
