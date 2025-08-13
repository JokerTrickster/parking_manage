import React, { useState, useEffect } from 'react';
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
  MenuItem
} from '@mui/material';
import {
  Edit as EditIcon,
  Save as SaveIcon,
  Cancel as CancelIcon,
  Add as AddIcon,
  Delete as DeleteIcon,
  ArrowBack as BackIcon
} from '@mui/icons-material';
import { RoiService } from '../services/RoiService';
import { 
  ImageFile, 
  ReadRoiResponse
} from '../models/Roi';
import RoiCanvas from '../components/RoiCanvas';

interface RoiWorkViewProps {
  projectId: string;
  onBack?: () => void;
}

export const RoiWorkView: React.FC<RoiWorkViewProps> = ({ projectId, onBack }) => {
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

  // ROI 편집 상태
  const [editingRoi, setEditingRoi] = useState<string>('');
  const [newRoiId, setNewRoiId] = useState('');
  const [newRoiCoords, setNewRoiCoords] = useState<number[]>([]);
  const [editMode, setEditMode] = useState(false);
  const [draftCreated, setDraftCreated] = useState(false);
  const [selectedRoiId, setSelectedRoiId] = useState<string>('');

  useEffect(() => {
    loadTestFolders();
    loadRoiFiles();
  }, [projectId]);

  // 테스트 폴더 목록 로드
  const loadTestFolders = async () => {
    try {
      setLoading(true);
      const folders = await RoiService.getTestFolders(projectId);
      setTestFolders(folders);
    } catch (err) {
      setError('테스트 폴더 목록을 불러오는데 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  // ROI 파일 목록 로드
  const loadRoiFiles = async () => {
    try {
      setLoading(true);
      const files = await RoiService.getRoiFiles(projectId);
      setRoiFiles(files);
    } catch (err) {
      setError('ROI 파일 목록을 불러오는데 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  // 폴더 선택 - 이미지 목록 로드
  const handleFolderSelect = async (folderName: string) => {
    try {
      setLoading(true);
      setSelectedFolder(folderName);
      const response = await RoiService.getTestImages(projectId, folderName);
      setFolderImages(response.images);
    } catch (err) {
      setError('이미지 목록을 불러오는데 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  // 이미지 선택
  const handleImageSelect = async (image: ImageFile) => {
    try {
      setLoading(true);
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
      setError('이미지를 불러오는데 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  // ROI 파일 선택
  const handleRoiFileSelect = (fileName: string) => {
    // 확장자 제거 (.json)
    const roiFileName = fileName.replace(/\.json$/, '');
    setSelectedRoiFile(roiFileName);
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
      
      // 항상 readRoi API 사용 (백엔드에서 draft 파일 유무에 따라 처리)
      const response = await RoiService.readRoi(projectId, {
        cctv_id: getDisplayImageName(image.name).split('.')[0], // 이미지 이름에서 CCTV ID 추출 (_Current 제거 후)
        project_id: projectId,
        roi_file: roiFile
      });
      setRoiData(response);
    } catch (err) {
      setError('ROI 데이터를 불러오는데 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  // ROI 생성
  const handleCreateRoi = () => {
    setEditingRoi('create');
    setNewRoiId('');
    setNewRoiCoords([]);
  };

  // ROI 수정
  const handleUpdateRoi = (roiId: string) => {
    setEditingRoi('update');
    setNewRoiId(roiId);
    setNewRoiCoords(roiData?.rois[roiId] || []);
  };

  // ROI 삭제
  const handleDeleteRoi = async (roiId: string) => {
    if (!selectedImage || !selectedRoiFile || !roiData) return;

    try {
      setLoading(true);
      await RoiService.deleteRoi(projectId, {
        roi_id: roiId,
        cctv_id: roiData.cctv_id,
        project_id: projectId,
        roi_file: selectedRoiFile
      });
      
      // ROI 데이터 새로고침
      await loadRoiData(selectedImage, selectedRoiFile);
    } catch (err) {
      setError('ROI 삭제에 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  // ROI 저장
  const handleSaveRoi = async () => {
    if (!selectedImage || !selectedRoiFile || !roiData) return;

    try {
      setLoading(true);
      
      if (editingRoi === 'create') {
        await RoiService.createRoi(projectId, {
          roi_id: newRoiId,
          cctv_id: roiData.cctv_id,
          project_id: projectId,
          roi_file: selectedRoiFile,
          coords: newRoiCoords
        });
      } else if (editingRoi === 'update') {
        await RoiService.updateRoi(projectId, {
          roi_id: newRoiId,
          cctv_id: roiData.cctv_id,
          project_id: projectId,
          roi_file: selectedRoiFile,
          coords: newRoiCoords
        });
      }

      // ROI 데이터 새로고침
      await loadRoiData(selectedImage, selectedRoiFile);
      setEditingRoi('');
    } catch (err) {
      setError('ROI 저장에 실패했습니다.');
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

  // 편집 취소
  const handleCancelEdit = () => {
    setEditingRoi('');
    setNewRoiId('');
    setNewRoiCoords([]);
  };

  // 편집 모드 종료
  const handleEndEdit = async () => {
    setEditMode(false);
    setDraftCreated(false);
    setEditingRoi('');
    setNewRoiId('');
    setNewRoiCoords([]);
    
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
      // 확장자 제거된 파일명 사용
      await RoiService.saveDraftRoi(projectId, selectedRoiFile);
      setError('');
      alert('파일이 성공적으로 저장되었습니다.');
      setDraftCreated(false);
      setEditMode(false);
    } catch (err) {
      setError('파일 저장에 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container maxWidth="xl">
      {/* 헤더 */}
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 4 }}>
        {onBack && (
          <Button
            startIcon={<BackIcon />}
            onClick={onBack}
            sx={{ mr: 2 }}
          >
            대시보드로
          </Button>
        )}
        <Typography variant="h4" component="h1">
          ROI 작업
        </Typography>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {/* 파일 선택 섹션 */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h5" gutterBottom>
          파일 선택
        </Typography>
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 3 }}>
          {/* 테스트 폴더 선택 */}
          <Box sx={{ flex: '1 1 300px', minWidth: 0 }}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  테스트 폴더
                </Typography>
                <FormControl fullWidth>
                  <InputLabel>폴더 선택</InputLabel>
                  <Select
                    value={selectedFolder}
                    onChange={(e) => handleFolderSelect(e.target.value)}
                    label="폴더 선택"
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
          </Box>

          {/* ROI 파일 선택 */}
          <Box sx={{ flex: '1 1 300px', minWidth: 0 }}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  ROI 파일
                </Typography>
                <FormControl fullWidth>
                  <InputLabel>ROI 파일 선택</InputLabel>
                  <Select
                    value={selectedRoiFile ? selectedRoiFile + '.json' : ''}
                    onChange={(e) => handleRoiFileSelect(e.target.value)}
                    label="ROI 파일 선택"
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
          </Box>

          {/* 이미지 선택 */}
          <Box sx={{ flex: '1 1 300px', minWidth: 0 }}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  이미지 선택
                </Typography>
                <FormControl fullWidth>
                  <InputLabel>이미지 선택</InputLabel>
                  <Select
                    value={selectedImage?.name || ''}
                    onChange={(e) => {
                      const image = folderImages.find(img => img.name === e.target.value);
                      if (image) handleImageSelect(image);
                    }}
                    label="이미지 선택"
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
        </Box>
      </Box>

      {/* 이미지 비교 및 편집 섹션 */}
      {selectedImage && selectedRoiFile && (
        <Box sx={{ mb: 4 }}>
          <Typography variant="h5" gutterBottom>
            이미지 비교 및 ROI 편집
          </Typography>
          
          <Box sx={{ display: 'flex', gap: 3 }}>
            {/* 왼쪽 - 원본 이미지 */}
            <Box sx={{ flex: 1 }}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    원본 이미지
                  </Typography>
                  <Box
                    sx={{
                      width: '100%',
                      height: 400,
                      border: 1,
                      borderColor: 'divider',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      bgcolor: 'grey.100',
                      overflow: 'hidden'
                    }}
                  >
                    {roiData && roiData.rois ? (
                      <RoiCanvas
                        imageSrc={selectedImage.path}
                        rois={roiData.rois}
                        editable={false}
                        selectedRoiId={selectedRoiId}
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

            {/* 오른쪽 - 편집 가능한 이미지 */}
            <Box sx={{ flex: 1 }}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    편집 가능한 이미지
                  </Typography>
                  <Box
                    sx={{
                      width: '100%',
                      height: 400,
                      border: 1,
                      borderColor: 'divider',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      bgcolor: 'grey.100',
                      overflow: 'hidden',
                      position: 'relative'
                    }}
                  >
                    {roiData && roiData.rois ? (
                      <RoiCanvas
                        imageSrc={selectedImage.path}
                        rois={roiData.rois}
                        editable={editMode}
                        onRoiClick={handleRoiClick}
                        selectedRoiId={selectedRoiId}
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
                  {!editMode && (
                    <Box sx={{ mt: 2 }}>
                      <Button
                        variant="contained"
                        startIcon={<EditIcon />}
                        onClick={handleStartEdit}
                        fullWidth
                      >
                        편집 시작
                      </Button>
                    </Box>
                  )}

                  {/* ROI 편집 컨트롤 */}
                  {editMode && (
                    <Box sx={{ mt: 2 }}>
                      <Typography variant="subtitle1" gutterBottom>
                        ROI 편집
                      </Typography>
                      
                      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                        <Button
                          variant="outlined"
                          startIcon={<AddIcon />}
                          onClick={handleCreateRoi}
                          fullWidth
                        >
                          ROI 생성
                        </Button>
                        
                        {roiData && Object.keys(roiData.rois).map((roiId) => (
                          <Box key={roiId} sx={{ display: 'flex', gap: 1 }}>
                            <Button
                              variant="outlined"
                              startIcon={<EditIcon />}
                              onClick={() => handleUpdateRoi(roiId)}
                              sx={{ flex: 1 }}
                            >
                              수정: {roiId}
                            </Button>
                            <Button
                              variant="outlined"
                              color="error"
                              startIcon={<DeleteIcon />}
                              onClick={() => handleDeleteRoi(roiId)}
                              sx={{ flex: 1 }}
                            >
                              삭제
                            </Button>
                          </Box>
                        ))}

                        {/* 편집 모드 종료 버튼 */}
                        <Button
                          variant="outlined"
                          color="secondary"
                          onClick={handleEndEdit}
                          fullWidth
                        >
                          편집 모드 종료
                        </Button>
                      </Box>
                    </Box>
                  )}
                </CardContent>
              </Card>
            </Box>
          </Box>

          {/* ROI 편집 폼 */}
          {editingRoi && (
            <Card sx={{ mt: 2 }}>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  {editingRoi === 'create' ? 'ROI 생성' : 'ROI 수정'}
                </Typography>
                
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                  <TextField
                    label="ROI ID"
                    value={newRoiId}
                    onChange={(e) => setNewRoiId(e.target.value)}
                    fullWidth
                  />
                  
                  <TextField
                    label="좌표 (쉼표로 구분)"
                    value={newRoiCoords.join(', ')}
                    onChange={(e) => {
                      const coords = e.target.value.split(',').map(c => parseInt(c.trim())).filter(n => !isNaN(n));
                      setNewRoiCoords(coords);
                    }}
                    fullWidth
                    placeholder="예: 100, 200, 300, 400"
                  />
                  
                  <Box sx={{ display: 'flex', gap: 2 }}>
                    <Button
                      variant="contained"
                      startIcon={<SaveIcon />}
                      onClick={handleSaveRoi}
                      sx={{ flex: 1 }}
                    >
                      저장
                    </Button>
                    
                    <Button
                      variant="outlined"
                      startIcon={<CancelIcon />}
                      onClick={handleCancelEdit}
                      sx={{ flex: 1 }}
                    >
                      취소
                    </Button>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          )}

          {/* 파일 저장 버튼 */}
          {draftCreated && (
            <Box sx={{ mt: 2, display: 'flex', justifyContent: 'center' }}>
              <Button
                variant="contained"
                color="success"
                startIcon={<SaveIcon />}
                onClick={handleSaveFile}
                size="large"
              >
                파일 저장
              </Button>
            </Box>
          )}
        </Box>
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
    </Container>
  );
};
