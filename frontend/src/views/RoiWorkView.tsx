import React, { useState, useEffect, useRef } from 'react';
import {
  Box,
  Container,
  Typography,
  Button,
  Card,
  CardContent,
  TextField,
  Alert,
  CircularProgress,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Snackbar,
  useMediaQuery,
  useTheme,
  Drawer,
  IconButton,
  Collapse
} from '@mui/material';
import {
  Edit as EditIcon,
  Save as SaveIcon,
  Cancel as CancelIcon,
  Add as AddIcon,
  Delete as DeleteIcon,
  ArrowBack as BackIcon,
  Menu as MenuIcon,
  ExpandMore as ExpandMoreIcon,
  Fullscreen as FullscreenIcon,
  FullscreenExit as FullscreenExitIcon
} from '@mui/icons-material';
import { RoiService } from '../services/RoiService';
import { FileStorageService } from '../services/FileStorageService';
import {
  ImageFile,
  ReadRoiResponse
} from '../models/Roi';
import RoiCanvas, { RoiCanvasRef } from '../components/RoiCanvas';
import { touchFriendly, responsiveSpacing, responsiveGrid } from '../styles/responsive';

interface RoiWorkViewProps {
  projectId: string;
  onBack?: () => void;
}

export const RoiWorkView: React.FC<RoiWorkViewProps> = ({ projectId, onBack }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const isSmallMobile = useMediaQuery(theme.breakpoints.down('sm'));

  // 상태 관리
  const [testFolders, setTestFolders] = useState<any[]>([]);
  const [selectedFolder, setSelectedFolder] = useState<string>('');
  const [folderImages, setFolderImages] = useState<ImageFile[]>([]);
  const [roiFiles, setRoiFiles] = useState<any[]>([]);
  const [selectedRoiFile, setSelectedRoiFile] = useState<string>('');
  const [selectedImage, setSelectedImage] = useState<ImageFile | null>(null);
  const [roiData, setRoiData] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>('');
  const [success, setSuccess] = useState<string>('');

  // ROI 편집 상태
  const [editMode, setEditMode] = useState(false);
  const [draftCreated, setDraftCreated] = useState(false);
  const [selectedRoiId, setSelectedRoiId] = useState<string>('');
  const [draftRoiData, setDraftRoiData] = useState<{ [cctvId: string]: any }>({});
  const [roiEditMode, setRoiEditMode] = useState<'create' | 'update' | null>(null);
  const [tempRoiId, setTempRoiId] = useState<string>('');
  const [tempRoiNumber, setTempRoiNumber] = useState<string>('');
  const roiCanvasRef = useRef<RoiCanvasRef>(null);

  // Mobile UI 상태
  const [mobileControlsOpen, setMobileControlsOpen] = useState(false);
  const [fileSelectionExpanded, setFileSelectionExpanded] = useState(!isMobile);
  const [fullscreenCanvas, setFullscreenCanvas] = useState(false);

  // Snackbar 닫기 핸들러
  const handleCloseSnackbar = () => {
    setSuccess('');
    setError('');
  };

  useEffect(() => {
    loadTestFolders();
    loadRoiFiles();
  }, [projectId]);

  // 테스트 폴더 목록 로드 - FileStorageService 사용
  const loadTestFolders = async () => {
    try {
      setLoading(true);
      const response = await FileStorageService.listFolders(projectId, 'test');
      // FolderNode 배열을 폴더 이름 배열로 변환
      const folderNames = response.data.items
        .filter(item => item.isFolder)
        .map(folder => folder.name);
      setTestFolders(folderNames);
    } catch (err) {
      setError('테스트 폴더 목록을 불러오는데 실패했습니다.');
      console.error('테스트 폴더 로드 실패:', err);
    } finally {
      setLoading(false);
    }
  };

  // ROI 파일 목록 로드 - FileStorageService 사용
  const loadRoiFiles = async () => {
    try {
      setLoading(true);
      const response = await FileStorageService.listFiles(projectId, 'roi');
      // FileInfo 배열에서 파일 이름만 추출
      const fileNames = response.data.files.map(file => file.filename);
      setRoiFiles(fileNames);
    } catch (err) {
      setError('ROI 파일 목록을 불러오는데 실패했습니다.');
      console.error('ROI 파일 로드 실패:', err);
    } finally {
      setLoading(false);
    }
  };

  // 폴더 선택 - 이미지 목록 로드
  const handleFolderSelect = async (folderName: string) => {
    try {
      setLoading(true);
      setSelectedFolder(folderName);
      setError(''); // 에러 메시지 초기화
      
      const response = await RoiService.getTestImages(projectId, folderName);
      setFolderImages(response.images || []);
      
      // 선택된 이미지와 ROI 파일 초기화
      setSelectedImage(null);
      setRoiData(null);
      setSelectedRoiId('');
      
    } catch (err) {
      console.error('폴더 선택 에러:', err);
      setError(`폴더 '${folderName}'의 이미지 목록을 불러오는데 실패했습니다. 폴더가 존재하지 않거나 접근할 수 없습니다.`);
      setFolderImages([]);
      setSelectedImage(null);
      setRoiData(null);
    } finally {
      setLoading(false);
    }
  };

  // 이미지 선택
  const handleImageSelect = async (image: ImageFile) => {
    try {
      setLoading(true);
      setError(''); // 에러 메시지 초기화
      
      // 새로운 이미지 API로 이미지 가져오기
      const imageBlob = await RoiService.getImageRoi(projectId, selectedFolder, image.name);
      const imageUrl = URL.createObjectURL(imageBlob);
      
      // ImageFile 객체 업데이트
      const updatedImage: ImageFile = {
        ...image,
        path: imageUrl
      };
      
      setSelectedImage(updatedImage);
      
      // 이미지 선택 시 ROI 데이터 자동 로드
      if (selectedRoiFile) {
        loadRoiData(updatedImage, selectedRoiFile);
      }
    } catch (err) {
      console.error('이미지 선택 에러:', err);
      setError(`이미지 '${image.name}'을 불러오는데 실패했습니다.`);
      setSelectedImage(null);
      setRoiData(null);
    } finally {
      setLoading(false);
    }
  };

  // ROI 파일 선택
  const handleRoiFileSelect = (fileName: string) => {
    // 확장자 제거 (.json)
    const roiFileName = fileName.replace(/\.json$/, '');
    setSelectedRoiFile(roiFileName);
    setError(''); // 에러 메시지 초기화
    
    // ROI 파일 선택 시 ROI 데이터 자동 로드
    if (selectedImage) {
      loadRoiData(selectedImage, roiFileName);
    }
  };

  // 이미지 파일명에서 _Current 제거
  const getDisplayImageName = (imageName: string) => {
    return imageName.replace(/_Current$/, '');
  };

  // ROI 클릭 핸들러
  const handleRoiClick = (roiId: string) => {
    setSelectedRoiId(roiId);
  };

  // ROI 데이터 로드
  const loadRoiData = async (image: ImageFile, roiFile: string) => {
    try {
      setLoading(true);
      setError(''); // 에러 메시지 초기화
      
      const cctvId = getDisplayImageName(image.name).split('.')[0]; // 이미지 이름에서 CCTV ID 추출 (_Current 제거 후)
      
      if (draftCreated) {
        // Draft 모드일 때: 저장된 Draft 데이터가 있으면 사용, 없으면 API에서 로드
        if (draftRoiData[cctvId]) {
          setRoiData(draftRoiData[cctvId]);
        } else {
          // Draft 데이터가 없으면 API에서 로드하고 Draft에 저장
          const response = await RoiService.readRoi(projectId, {
            cctv_id: cctvId,
            project_id: projectId,
            roi_file: roiFile
          });
          setRoiData(response);
          setDraftRoiData(prev => ({
            ...prev,
            [cctvId]: response
          }));
        }
      } else {
        // 일반 모드일 때: API에서 데이터 로드
        const response = await RoiService.readRoi(projectId, {
          cctv_id: cctvId,
          project_id: projectId,
          roi_file: roiFile
        });
        setRoiData(response);
      }
    } catch (err) {
      console.error('ROI 데이터 로드 에러:', err);
      setError(`ROI 데이터를 불러오는데 실패했습니다. 이미지 '${image.name}'과 ROI 파일 '${roiFile}'의 조합을 확인해주세요.`);
      setRoiData(null);
    } finally {
      setLoading(false);
    }
  };

  // ROI 생성
  const handleCreateRoi = () => {
    setRoiEditMode('create');
    setTempRoiId('');
    setTempRoiNumber('');
  };

  // ROI 수정
  const handleUpdateRoi = (roiId: string) => {
    setRoiEditMode('update');
    setSelectedRoiId(roiId);
  };

  // ROI 삭제
  const handleDeleteRoi = async (roiId: string) => {
    if (!selectedImage || !selectedRoiFile || !roiData) return;

    const cctvId = getDisplayImageName(selectedImage.name).split('.')[0];

    try {
      setLoading(true);
      
      // Draft 파일에서 ROI 삭제 (로컬 상태 업데이트)
      const updatedRois = { ...(roiData.rois || {}) };
      delete updatedRois[roiId];
      const updatedRoiData = {
        ...roiData,
        rois: updatedRois
      };
      
      setRoiData(updatedRoiData);
      
      // Draft 데이터에도 저장
      setDraftRoiData(prev => ({
        ...prev,
        [cctvId]: updatedRoiData
      }));
      
      // Draft 파일에 실제로 저장 (기존 API 활용)
      try {
        // Draft 모드에서는 원본 파일명으로 호출하되 Draft 파일에 저장됨
        await RoiService.deleteRoi(projectId, {
          roi_id: roiId,
          cctv_id: cctvId,
          roi_file: selectedRoiFile // 원본 파일명으로 호출
        });
      } catch (draftErr) {
        console.warn('Draft 파일 저장 실패:', draftErr);
        // Draft 파일 저장 실패해도 로컬 상태는 유지
      }
      
      setSuccess('ROI가 성공적으로 삭제되었습니다. (Draft에서 삭제됨)');
      setError(''); // 에러 메시지 초기화
    } catch (err) {
      setError('ROI 삭제에 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };



  // 편집 시작
  const handleStartEdit = async () => {
    if (!selectedRoiFile) return;

    try {
      setLoading(true);
      // ROI Draft 생성 (확장자 제거된 파일명 사용)
      await RoiService.createDraftRoi(projectId, selectedRoiFile);
      setEditMode(true);
      setDraftCreated(true);
      setError('');
      
      // 편집 모드로 전환 후 ROI 데이터 다시 로드 (초안 파일 사용)
      if (selectedImage) {
        await loadRoiData(selectedImage, selectedRoiFile);
      }
    } catch (err) {
      setError('편집 모드 시작에 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  // ROI 생성 완료
  const handleRoiCreate = async (coordinates: number[]) => {
    if (!tempRoiNumber.trim()) {
      setError('ROI 번호를 입력해주세요.');
      return;
    }
    
    if (!selectedImage || !selectedRoiFile || !roiData) {
      setError('필수 정보가 누락되었습니다.');
      return;
    }
    
    const roiId = `PARKINGLOCATIONS_${tempRoiNumber}`;
    const cctvId = getDisplayImageName(selectedImage.name).split('.')[0];
    
    // 좌표를 정수형으로 반올림
    const roundedCoordinates = coordinates.map(coord => Math.round(coord));
    
    try {
      setLoading(true);
      
      // Draft 파일에 ROI 추가 (로컬 상태 업데이트)
      const updatedRois = { ...(roiData.rois || {}) };
      updatedRois[roiId] = roundedCoordinates;
      const updatedRoiData = {
        ...roiData,
        rois: updatedRois
      };
      
      setRoiData(updatedRoiData);
      
      // Draft 데이터에도 저장
      setDraftRoiData(prev => ({
        ...prev,
        [cctvId]: updatedRoiData
      }));
      
      // Draft 파일에 실제로 저장 (기존 API 활용)
      try {
        // Draft 모드에서는 원본 파일명으로 호출하되 Draft 파일에 저장됨
        await RoiService.createRoi(projectId, {
          roi_id: roiId,
          cctv_id: cctvId,
          roi_file: selectedRoiFile, // 원본 파일명으로 호출
          coords: roundedCoordinates
        });
      } catch (draftErr) {
        console.warn('Draft 파일 저장 실패:', draftErr);
        // Draft 파일 저장 실패해도 로컬 상태는 유지
      }
      
      setRoiEditMode(null);
      setTempRoiId('');
      setTempRoiNumber('');
      setSuccess('ROI가 성공적으로 생성되었습니다. (Draft에 저장됨)');
      setError(''); // 에러 메시지 초기화
    } catch (err) {
      setError('ROI 생성에 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  // ROI 수정 완료
  const handleRoiUpdate = async (roiId: string, coordinates: number[]) => {
    if (!selectedImage || !selectedRoiFile || !roiData) {
      setError('필수 정보가 누락되었습니다.');
      return;
    }
    
    const cctvId = getDisplayImageName(selectedImage.name).split('.')[0];
    
    // 좌표를 정수형으로 반올림
    const roundedCoordinates = coordinates.map(coord => Math.round(coord));
    
    try {
      setLoading(true);
      
      // Draft 파일에 ROI 수정 (로컬 상태 업데이트)
      const updatedRois = { ...(roiData.rois || {}) };
      updatedRois[roiId] = roundedCoordinates;
      const updatedRoiData = {
        ...roiData,
        rois: updatedRois
      };
      
      setRoiData(updatedRoiData);
      
      // Draft 데이터에도 저장
      setDraftRoiData(prev => ({
        ...prev,
        [cctvId]: updatedRoiData
      }));
      
      // Draft 파일에 실제로 저장 (기존 API 활용)
      try {
        // Draft 모드에서는 원본 파일명으로 호출하되 Draft 파일에 저장됨
        await RoiService.updateRoi(projectId, {
          roi_id: roiId,
          cctv_id: cctvId,
          roi_file: selectedRoiFile, // 원본 파일명으로 호출
          coords: roundedCoordinates
        });
      } catch (draftErr) {
        console.warn('Draft 파일 저장 실패:', draftErr);
        // Draft 파일 저장 실패해도 로컬 상태는 유지
      }
      
      setRoiEditMode(null);
      setSuccess('ROI가 성공적으로 수정되었습니다. (Draft에 저장됨)');
      setError(''); // 에러 메시지 초기화
    } catch (err) {
      setError('ROI 수정에 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  // ROI 편집 저장
  const handleSaveRoiEdit = () => {
    if (roiCanvasRef.current) {
      roiCanvasRef.current.completeRoi();
    }
  };

  // ROI 편집 취소
  const handleCancelRoiEdit = () => {
    if (roiCanvasRef.current) {
      roiCanvasRef.current.cancelRoiEdit();
    }
    setRoiEditMode(null);
    setTempRoiId('');
    setTempRoiNumber('');
  };

  // 편집 취소
  const handleCancelEdit = () => {
    setRoiEditMode(null);
    setTempRoiId('');
    setTempRoiNumber('');
  };

  // 편집 모드 종료
  const handleEndEdit = async () => {
    setEditMode(false);
    setDraftCreated(false);
    setDraftRoiData({}); // Draft 데이터 초기화
    
    // 편집 모드 종료 후 원본 파일로 ROI 데이터 다시 로드
    if (selectedImage && selectedRoiFile) {
      await loadRoiData(selectedImage, selectedRoiFile);
    }
  };

  // 파일 저장
  const handleSaveFile = async () => {
    if (!selectedRoiFile || !draftCreated) return;

    try {
      setLoading(true);
      
      // 기존 saveDraftRoi API 사용 (Draft 파일을 원본 파일로 복사)
      await RoiService.saveDraftRoi(projectId, selectedRoiFile);
      
      setError('');
      setSuccess('파일이 성공적으로 저장되었습니다.');
      setDraftCreated(false);
      setEditMode(false);
      setDraftRoiData({}); // Draft 데이터 초기화
      
      // ROI 파일 리스트 새로고침
      await loadRoiFiles();
    } catch (err) {
      console.error('파일 저장 실패:', err);
      setError('파일 저장에 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container maxWidth="xl" sx={{ ...responsiveSpacing.pagePadding, pb: { xs: 8, md: 3 } }}>
      {/* 헤더 */}
      <Box sx={{
        display: 'flex',
        alignItems: 'center',
        ...responsiveSpacing.sectionMargin,
        flexWrap: { xs: 'wrap', sm: 'nowrap' },
        gap: 1
      }}>
        {onBack && (
          <Button
            startIcon={<BackIcon />}
            onClick={onBack}
            sx={{
              ...touchFriendly.button,
              mr: { xs: 0, sm: 2 },
              mb: { xs: 1, sm: 0 },
              minWidth: { xs: 'auto', sm: 'unset' }
            }}
            size={isSmallMobile ? "small" : "medium"}
          >
            {isSmallMobile ? "뒤로" : "대시보드로"}
          </Button>
        )}
        <Typography
          variant={isMobile ? "h5" : "h4"}
          component="h1"
          sx={{ flexGrow: 1, fontSize: { xs: '1.5rem', sm: '2rem', md: '2.5rem' } }}
        >
          ROI 작업
        </Typography>

        {/* Mobile controls toggle */}
        {isMobile && (
          <IconButton
            onClick={() => setMobileControlsOpen(!mobileControlsOpen)}
            sx={{ ...touchFriendly.iconButton }}
          >
            <MenuIcon />
          </IconButton>
        )}
      </Box>



      {/* 파일 선택 섹션 */}
      <Box sx={{ ...responsiveSpacing.sectionMargin }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          <Typography variant={isMobile ? "h6" : "h5"} sx={{ flexGrow: 1 }}>
            파일 선택
          </Typography>
          {isMobile && (
            <IconButton
              onClick={() => setFileSelectionExpanded(!fileSelectionExpanded)}
              sx={{ ...touchFriendly.iconButton }}
            >
              <ExpandMoreIcon
                sx={{
                  transform: fileSelectionExpanded ? 'rotate(180deg)' : 'rotate(0deg)',
                  transition: 'transform 0.3s'
                }}
              />
            </IconButton>
          )}
        </Box>

        <Collapse in={fileSelectionExpanded}>
          <Box sx={{
            display: 'grid',
            gap: { xs: 2, sm: 3 },
            gridTemplateColumns: {
              xs: '1fr',
              sm: 'repeat(2, 1fr)',
              md: 'repeat(3, 1fr)'
            }
          }}>
            {/* 테스트 폴더 선택 */}
            <Card sx={{ height: 'fit-content' }}>
              <CardContent sx={{ ...responsiveSpacing.cardPadding }}>
                <Typography variant="h6" gutterBottom sx={{ fontSize: { xs: '1rem', sm: '1.25rem' } }}>
                  테스트 폴더
                </Typography>
                <FormControl fullWidth size={isMobile ? "small" : "medium"}>
                  <InputLabel>폴더 선택</InputLabel>
                  <Select
                    value={selectedFolder}
                    onChange={(e) => handleFolderSelect(e.target.value)}
                    label="폴더 선택"
                    sx={{ minHeight: { xs: 44, sm: 56 } }}
                  >
                    {testFolders.map((folder) => (
                      <MenuItem key={folder.name || folder} value={folder.name || folder}>
                        {folder.name || folder}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </CardContent>
            </Card>

            {/* ROI 파일 선택 */}
            <Card sx={{ height: 'fit-content' }}>
              <CardContent sx={{ ...responsiveSpacing.cardPadding }}>
                <Typography variant="h6" gutterBottom sx={{ fontSize: { xs: '1rem', sm: '1.25rem' } }}>
                  ROI 파일
                </Typography>
                <FormControl fullWidth size={isMobile ? "small" : "medium"}>
                  <InputLabel>ROI 파일 선택</InputLabel>
                  <Select
                    value={selectedRoiFile ? selectedRoiFile + '.json' : ''}
                    onChange={(e) => handleRoiFileSelect(e.target.value)}
                    label="ROI 파일 선택"
                    sx={{ minHeight: { xs: 44, sm: 56 } }}
                  >
                    {roiFiles.map((file) => {
                      const fileName = typeof file === 'string' ? file : file.name;
                      const displayName = fileName.replace(/\.json$/, '');
                      return (
                        <MenuItem key={fileName} value={fileName}>
                          {displayName}
                        </MenuItem>
                      );
                    })}
                  </Select>
                </FormControl>
              </CardContent>
            </Card>

            {/* 이미지 선택 */}
            <Card sx={{ height: 'fit-content' }}>
              <CardContent sx={{ ...responsiveSpacing.cardPadding }}>
                <Typography variant="h6" gutterBottom sx={{ fontSize: { xs: '1rem', sm: '1.25rem' } }}>
                  이미지 선택
                </Typography>
                <FormControl fullWidth size={isMobile ? "small" : "medium"}>
                  <InputLabel>이미지 선택</InputLabel>
                  <Select
                    value={selectedImage?.name || ''}
                    onChange={(e) => {
                      const image = folderImages.find(img => img.name === e.target.value);
                      if (image) handleImageSelect(image);
                    }}
                    label="이미지 선택"
                    sx={{ minHeight: { xs: 44, sm: 56 } }}
                  >
                    {folderImages.map((image) => (
                      <MenuItem key={image.name} value={image.name}>
                        {getDisplayImageName(image.name)}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </CardContent>
            </Card>
          </Box>
        </Collapse>
      </Box>

      {/* 이미지 비교 및 편집 섹션 */}
      {selectedImage && selectedRoiFile && (
        <Box sx={{ ...responsiveSpacing.sectionMargin }}>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
            <Typography variant={isMobile ? "h6" : "h5"} sx={{ flexGrow: 1 }}>
              {isMobile ? "ROI 편집" : "이미지 비교 및 ROI 편집"}
            </Typography>
            {selectedImage && (
              <IconButton
                onClick={() => setFullscreenCanvas(!fullscreenCanvas)}
                sx={{ ...touchFriendly.iconButton, ml: 1 }}
              >
                {fullscreenCanvas ? <FullscreenExitIcon /> : <FullscreenIcon />}
              </IconButton>
            )}
          </Box>

          <Box sx={{
            display: { xs: 'flex', md: 'flex' },
            flexDirection: { xs: 'column', md: fullscreenCanvas ? 'column' : 'row' },
            gap: { xs: 2, sm: 3 },
            alignItems: fullscreenCanvas ? 'center' : 'stretch'
          }}>
            {/* 원본 이미지 - Desktop only or fullscreen */}
            {(!isMobile || fullscreenCanvas) && (
              <Box sx={{
                flex: fullscreenCanvas ? 'none' : 1,
                width: fullscreenCanvas ? '100%' : 'auto',
                maxWidth: fullscreenCanvas ? '100vw' : 'none'
              }}>
                <Card sx={{ boxShadow: fullscreenCanvas ? 0 : undefined }}>
                  <CardContent sx={{
                    ...responsiveSpacing.cardPadding,
                    pb: fullscreenCanvas ? 1 : undefined
                  }}>
                    <Typography variant="h6" gutterBottom sx={{
                      fontSize: { xs: '1rem', sm: '1.25rem' },
                      display: fullscreenCanvas ? 'none' : 'block'
                    }}>
                      원본 이미진 ({isMobile ? "상담" : "참고용"})
                    </Typography>
                    <Box
                      sx={{
                        width: '100%',
                        height: fullscreenCanvas
                          ? { xs: 'calc(100vh - 200px)', sm: 'calc(100vh - 150px)' }
                          : { xs: 280, sm: 320, md: 400 },
                        border: 1,
                        borderColor: 'divider',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        bgcolor: 'grey.100',
                        overflow: 'hidden',
                        borderRadius: 1
                      }}
                    >
                      {roiData && roiData.rois ? (
                        <RoiCanvas
                          ref={roiCanvasRef}
                          imageSrc={selectedImage.path}
                          rois={roiData.rois}
                          editable={false}
                          selectedRoiId={selectedRoiId}
                          editMode={roiEditMode}
                          onRoiCreate={handleRoiCreate}
                          onRoiUpdate={handleRoiUpdate}
                          isMobile={isMobile}
                          fullscreen={fullscreenCanvas}
                        />
                      ) : (
                        <img
                          src={selectedImage.path}
                          alt="원본"
                          style={{
                            maxWidth: '100%',
                            maxHeight: '100%',
                            objectFit: 'contain'
                          }}
                        />
                      )}
                    </Box>
                  </CardContent>
                </Card>
              </Box>
            )}

            {/* 편집 가능한 이미지 */}
            <Box sx={{
              flex: fullscreenCanvas ? 'none' : 1,
              width: fullscreenCanvas ? '100%' : 'auto',
              maxWidth: fullscreenCanvas ? '100vw' : 'none'
            }}>
              <Card sx={{ boxShadow: fullscreenCanvas ? 0 : undefined }}>
                <CardContent sx={{
                  ...responsiveSpacing.cardPadding,
                  pb: fullscreenCanvas ? 1 : undefined
                }}>
                  <Typography variant="h6" gutterBottom sx={{
                    fontSize: { xs: '1rem', sm: '1.25rem' },
                    display: fullscreenCanvas ? 'none' : 'block'
                  }}>
                    {isMobile ? "ROI 편집" : "편집 가능한 이미지"}
                  </Typography>
                  <Box
                    sx={{
                      width: '100%',
                      height: fullscreenCanvas
                        ? { xs: 'calc(100vh - 200px)', sm: 'calc(100vh - 150px)' }
                        : { xs: 280, sm: 320, md: 400 },
                      border: 1,
                      borderColor: editMode ? 'primary.main' : 'divider',
                      borderWidth: editMode ? 2 : 1,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      bgcolor: editMode ? 'primary.light' : 'grey.100',
                      backgroundOpacity: editMode ? 0.05 : 1,
                      overflow: 'hidden',
                      position: 'relative',
                      borderRadius: 1,
                      transition: 'all 0.3s ease'
                    }}
                  >
                    {roiData && roiData.rois ? (
                      <RoiCanvas
                        ref={roiCanvasRef}
                        imageSrc={selectedImage.path}
                        rois={roiData.rois}
                        editable={editMode}
                        onRoiClick={handleRoiClick}
                        selectedRoiId={selectedRoiId}
                        editMode={roiEditMode}
                        onRoiCreate={handleRoiCreate}
                        onRoiUpdate={handleRoiUpdate}
                        isMobile={isMobile}
                        fullscreen={fullscreenCanvas}
                      />
                    ) : (
                      <img
                        src={selectedImage.path}
                        alt="편집"
                        style={{
                          maxWidth: '100%',
                          maxHeight: '100%',
                          objectFit: 'contain'
                        }}
                      />
                    )}
                  </Box>

                  {/* 편집 시작 버튼 */}
                  {!editMode && !fullscreenCanvas && (
                    <Box sx={{ mt: 2 }}>
                      <Button
                        variant="contained"
                        startIcon={<EditIcon />}
                        onClick={handleStartEdit}
                        fullWidth
                        disabled={!selectedRoiFile}
                        sx={{
                          ...touchFriendly.button,
                          fontSize: { xs: '0.875rem', sm: '1rem' }
                        }}
                      >
                        편집 시작
                      </Button>
                    </Box>
                  )}

                  {/* 편집 모드 종료 버튼 */}
                  {editMode && !fullscreenCanvas && (
                    <Box sx={{ mt: 2 }}>
                      <Button
                        variant="outlined"
                        color="secondary"
                        onClick={handleEndEdit}
                        fullWidth
                        sx={{
                          ...touchFriendly.button,
                          fontSize: { xs: '0.875rem', sm: '1rem' }
                        }}
                      >
                        {isMobile ? "편집 종료" : "편집 모드 종료"}
                      </Button>
                    </Box>
                  )}
                </CardContent>
              </Card>
            </Box>
          </Box>

          {/* ROI 편집 프레임 */}
          {editMode && (
            <Box sx={{ mt: 4 }}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    ROI 편집 도구
                  </Typography>
                  
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                    {/* ROI 생성 섹션 */}
                    <Box>
                      <Typography variant="subtitle1" gutterBottom>
                        ROI 생성
                      </Typography>
                      
                                             {roiEditMode === 'create' ? (
                         <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                           <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                             <Typography variant="body1" sx={{ whiteSpace: 'nowrap' }}>
                               PARKINGLOCATIONS_
                             </Typography>
                             <TextField
                               label="번호"
                               value={tempRoiNumber}
                               onChange={(e) => {
                                 const value = e.target.value.replace(/[^0-9]/g, '');
                                 setTempRoiNumber(value);
                               }}
                               placeholder="숫자만 입력"
                               fullWidth
                               inputProps={{ inputMode: 'numeric', pattern: '[0-9]*' }}
                             />
                           </Box>
                           <Typography variant="body2" color="text.secondary">
                             이미지에서 클릭하여 ROI를 그리세요. 최소 3개 점이 필요합니다.
                           </Typography>
                           <Box sx={{ display: 'flex', gap: 1 }}>
                                                            <Button
                                 variant="contained"
                                 onClick={handleSaveRoiEdit}
                                 disabled={!tempRoiNumber.trim()}
                                 sx={{ flex: 1 }}
                               >
                                 저장
                               </Button>
                             <Button
                               variant="outlined"
                               onClick={handleCancelRoiEdit}
                               sx={{ flex: 1 }}
                             >
                               취소
                             </Button>
                           </Box>
                         </Box>
                       ) : (
                        <Button
                          variant="outlined"
                          startIcon={<AddIcon />}
                          onClick={handleCreateRoi}
                          fullWidth
                        >
                          ROI 생성
                        </Button>
                      )}
                    </Box>

                    {/* ROI 수정/삭제 섹션 */}
                    {roiData && roiData.rois && Object.keys(roiData.rois).length > 0 && (
                      <Box>
                        <Typography variant="subtitle1" gutterBottom sx={{
                          fontSize: { xs: '1rem', sm: '1.125rem' },
                          fontWeight: 600
                        }}>
                          ROI 수정/삭제
                        </Typography>
                        
                        {roiEditMode === 'update' ? (
                          <Box sx={{ display: 'flex', flexDirection: 'column', gap: { xs: 1.5, sm: 2 } }}>
                            <Typography variant="body2" color="text.secondary" sx={{
                              fontSize: { xs: '0.75rem', sm: '0.875rem' },
                              lineHeight: 1.4
                            }}>
                              <strong>{selectedRoiId}</strong> 수정 중:
                              {isMobile
                                ? " 이미지를 터치하여 새 ROI 영역을 그리세요."
                                : " 이미지에서 클릭하여 새 ROI를 그리세요. 최소 3개 점이 필요합니다."
                              }
                            </Typography>
                            <Box sx={{
                              display: 'flex',
                              flexDirection: { xs: 'column', sm: 'row' },
                              gap: 1
                            }}>
                              <Button
                                variant="contained"
                                onClick={handleSaveRoiEdit}
                                sx={{
                                  ...touchFriendly.button,
                                  flex: 1,
                                  fontSize: { xs: '0.875rem', sm: '1rem' }
                                }}
                              >
                                저장
                              </Button>
                              <Button
                                variant="outlined"
                                onClick={handleCancelRoiEdit}
                                sx={{
                                  ...touchFriendly.button,
                                  flex: 1,
                                  fontSize: { xs: '0.875rem', sm: '1rem' }
                                }}
                              >
                                취소
                              </Button>
                            </Box>
                          </Box>
                        ) : (
                          <Box sx={{
                            display: 'grid',
                            gap: 1,
                            gridTemplateColumns: { xs: '1fr', sm: '1fr', md: '1fr' },
                            maxHeight: fullscreenCanvas ? '20vh' : 'none',
                            overflow: fullscreenCanvas ? 'auto' : 'visible'
                          }}>
                            {roiData.rois && Object.keys(roiData.rois).map((roiId) => (
                              <Box key={roiId} sx={{
                                display: 'flex',
                                flexDirection: { xs: 'column', sm: 'row' },
                                gap: 1,
                                mb: { xs: 1, sm: 0 },
                                p: 1,
                                border: selectedRoiId === roiId ? '2px solid' : '1px solid',
                                borderColor: selectedRoiId === roiId ? 'primary.main' : 'divider',
                                borderRadius: 1,
                                bgcolor: selectedRoiId === roiId ? 'primary.light' : 'transparent',
                                backgroundOpacity: selectedRoiId === roiId ? 0.05 : 1
                              }}>
                                <Typography variant="body2" sx={{
                                  fontSize: { xs: '0.75rem', sm: '0.875rem' },
                                  fontWeight: selectedRoiId === roiId ? 600 : 400,
                                  color: selectedRoiId === roiId ? 'primary.main' : 'text.secondary',
                                  mb: { xs: 0.5, sm: 0 },
                                  alignSelf: 'center'
                                }}>
                                  {roiId.replace('PARKINGLOCATIONS_', 'P')}
                                </Typography>
                                <Box sx={{
                                  display: 'flex',
                                  gap: 1,
                                  flex: 1
                                }}>
                                  <Button
                                    variant="outlined"
                                    startIcon={<EditIcon />}
                                    onClick={() => handleUpdateRoi(roiId)}
                                    size="small"
                                    disabled={roiEditMode !== null}
                                    sx={{
                                      ...touchFriendly.button,
                                      flex: 1,
                                      fontSize: { xs: '0.75rem', sm: '0.875rem' },
                                      minWidth: { xs: 'auto', sm: 80 }
                                    }}
                                  >
                                    {isMobile ? "수정" : `수정`}
                                  </Button>
                                  <Button
                                    variant="outlined"
                                    color="error"
                                    startIcon={<DeleteIcon />}
                                    onClick={() => handleDeleteRoi(roiId)}
                                    size="small"
                                    disabled={roiEditMode !== null}
                                    sx={{
                                      ...touchFriendly.button,
                                      flex: 1,
                                      fontSize: { xs: '0.75rem', sm: '0.875rem' },
                                      minWidth: { xs: 'auto', sm: 80 }
                                    }}
                                  >
                                    삭제
                                  </Button>
                                </Box>
                              </Box>
                            ))}
                          </Box>
                        )}
                      </Box>
                    )}


                  </Box>
                </CardContent>
              </Card>
            </Box>
          )}

          {/* 파일 저장 버튼 */}
          {draftCreated && !fullscreenCanvas && (
            <Box sx={{
              mt: { xs: 3, sm: 4 },
              display: 'flex',
              justifyContent: 'center',
              position: isMobile ? 'sticky' : 'static',
              bottom: isMobile ? 16 : 'auto',
              zIndex: isMobile ? 1200 : 'auto'
            }}>
              <Button
                variant="contained"
                color="success"
                startIcon={<SaveIcon />}
                onClick={handleSaveFile}
                size={isMobile ? "medium" : "large"}
                sx={{
                  ...touchFriendly.button,
                  fontSize: { xs: '1rem', sm: '1.125rem' },
                  px: { xs: 4, sm: 6 },
                  py: { xs: 1.5, sm: 2 },
                  minWidth: { xs: 200, sm: 250 },
                  boxShadow: isMobile ? 3 : undefined
                }}
              >
                {isMobile ? "저장" : "파일 저장"}
              </Button>
            </Box>
          )}
        </Box>
      )}

      {/* Mobile Controls Drawer */}
      {isMobile && (
        <Drawer
          anchor="bottom"
          open={mobileControlsOpen}
          onClose={() => setMobileControlsOpen(false)}
          sx={{
            '& .MuiDrawer-paper': {
              maxHeight: '70vh',
              borderRadius: '16px 16px 0 0',
              p: 2
            }
          }}
        >
          <Box sx={{ textAlign: 'center', mb: 2 }}>
            <Typography variant="h6" gutterBottom>
              빠른 작업
            </Typography>
            <Box sx={{
              width: 40,
              height: 4,
              bgcolor: 'grey.300',
              borderRadius: 2,
              mx: 'auto',
              mb: 2
            }} />
          </Box>

          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            {!editMode && selectedRoiFile && selectedImage && (
              <Button
                variant="contained"
                startIcon={<EditIcon />}
                onClick={() => {
                  handleStartEdit();
                  setMobileControlsOpen(false);
                }}
                fullWidth
                sx={{ ...touchFriendly.button }}
              >
                편집 시작
              </Button>
            )}

            {editMode && (
              <Button
                variant="outlined"
                color="secondary"
                onClick={() => {
                  handleEndEdit();
                  setMobileControlsOpen(false);
                }}
                fullWidth
                sx={{ ...touchFriendly.button }}
              >
                편집 종료
              </Button>
            )}

            {selectedImage && (
              <Button
                variant={fullscreenCanvas ? "contained" : "outlined"}
                startIcon={fullscreenCanvas ? <FullscreenExitIcon /> : <FullscreenIcon />}
                onClick={() => {
                  setFullscreenCanvas(!fullscreenCanvas);
                  setMobileControlsOpen(false);
                }}
                fullWidth
                sx={{ ...touchFriendly.button }}
              >
                {fullscreenCanvas ? "전체화면 끄기" : "전체화면"}
              </Button>
            )}

            {draftCreated && (
              <Button
                variant="contained"
                color="success"
                startIcon={<SaveIcon />}
                onClick={() => {
                  handleSaveFile();
                  setMobileControlsOpen(false);
                }}
                fullWidth
                sx={{
                  ...touchFriendly.button,
                  fontSize: '1.125rem',
                  py: 2
                }}
              >
                파일 저장
              </Button>
            )}
          </Box>
        </Drawer>
      )}

      {/* 로딩 인디케이터 */}
      {loading && (
        <Box
          sx={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            bgcolor: 'rgba(0, 0, 0, 0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 9999
          }}
        >
          <CircularProgress />
        </Box>
      )}

      {/* 성공/에러 알림 Snackbar */}
      <Snackbar
        open={!!success}
        autoHideDuration={4000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert 
          onClose={handleCloseSnackbar} 
          severity="success" 
          sx={{ width: '100%' }}
          elevation={6}
        >
          {success}
        </Alert>
      </Snackbar>

      <Snackbar
        open={!!error}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert 
          onClose={handleCloseSnackbar} 
          severity="error" 
          sx={{ width: '100%' }}
          elevation={6}
        >
          {error}
        </Alert>
      </Snackbar>
    </Container>
  );
};
