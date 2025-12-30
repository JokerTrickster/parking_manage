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
  Collapse,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  DialogContentText,
  Stack,
  Chip,
  List,
  ListItem,
  ListItemText
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
  FullscreenExit as FullscreenExitIcon,
  Undo as UndoIcon
} from '@mui/icons-material';
import { RoiService } from '../services/RoiService';
import { FileStorageService } from '../services/FileStorageService';
import {
  ImageFile,
  ReadRoiResponse
} from '../models/Roi';
import RoiCanvas, { RoiCanvasRef } from '../components/RoiCanvas';
import { touchFriendly, responsiveSpacing, responsiveGrid } from '../styles/responsive';
import { CctvTemplateService } from '../services/CctvTemplateService';
import { CctvTemplate } from '../models/CctvTemplate';
import { RoiData as RoiFileData } from '../models/RoiData';

interface RoiWorkViewProps {
  projectId: string;
  onBack?: () => void;
}

export const RoiWorkView: React.FC<RoiWorkViewProps> = ({ projectId, onBack }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const isSmallMobile = useMediaQuery(theme.breakpoints.down('sm'));

  // 상태 관리
  const [roiFiles, setRoiFiles] = useState<string[]>([]);
  const [selectedRoiFile, setSelectedRoiFile] = useState<string>('');
  const [roiFileData, setRoiFileData] = useState<RoiFileData | null>(null);
  const [originalRoiFileData, setOriginalRoiFileData] = useState<RoiFileData | null>(null); // 롤백용 원본 데이터
  const [cctvTemplate, setCctvTemplate] = useState<CctvTemplate | null>(null);
  const [cctvList, setCctvList] = useState<string[]>([]);
  const [selectedCctv, setSelectedCctv] = useState<string>('');
  const [cctvImageUrl, setCctvImageUrl] = useState<string>('');
  const [selectedImage, setSelectedImage] = useState<ImageFile | null>(null);
  const [roiData, setRoiData] = useState<any>(null);
  const [originalRoiData, setOriginalRoiData] = useState<any>(null); // 롤백용 선택된 CCTV의 원본 ROI 데이터
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

  // 다이얼로그 상태
  const [saveDialogOpen, setSaveDialogOpen] = useState(false);
  const [newFileName, setNewFileName] = useState('');
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);
  const [pendingRoiFile, setPendingRoiFile] = useState<string>('');

  // 수정된 CCTV 추적
  const [modifiedCctvs, setModifiedCctvs] = useState<Set<string>>(new Set());

  // Snackbar 닫기 핸들러
  const handleCloseSnackbar = () => {
    setSuccess('');
    setError('');
  };

  // CCTV가 수정되었는지 확인하는 함수
  const checkCctvModified = (cctvId: string): boolean => {
    if (!originalRoiFileData || !roiFileData) return false;

    const originalData = (originalRoiFileData as any)[cctvId];
    const currentData = (roiFileData as any)[cctvId];

    // 둘 중 하나가 없으면 다른 것
    if (!originalData && currentData) return true;
    if (originalData && !currentData) return true;
    if (!originalData && !currentData) return false;

    // ROI 개수가 다르면 수정됨
    const originalRois = originalData.rois || {};
    const currentRois = currentData.rois || {};
    if (Object.keys(originalRois).length !== Object.keys(currentRois).length) return true;

    // ROI 좌표가 다르면 수정됨
    for (const roiId in currentRois) {
      if (!originalRois[roiId]) return true;
      const originalCoords = JSON.stringify(originalRois[roiId]);
      const currentCoords = JSON.stringify(currentRois[roiId]);
      if (originalCoords !== currentCoords) return true;
    }

    return false;
  };

  // 수정된 CCTV 목록 업데이트
  const updateModifiedCctvs = () => {
    if (!cctvList || !roiFileData || !originalRoiFileData) {
      setModifiedCctvs(new Set());
      return;
    }

    const modified = new Set<string>();
    cctvList.forEach(cctvId => {
      if (checkCctvModified(cctvId)) {
        modified.add(cctvId);
      }
    });
    setModifiedCctvs(modified);
  };

  useEffect(() => {
    // console.log('🚀 RoiWorkView 컴포넌트 마운트됨!');
    loadRoiFiles();
    loadCctvTemplate();
  }, [projectId]);

  // ROI 데이터가 변경될 때마다 수정된 CCTV 목록 업데이트
  useEffect(() => {
    updateModifiedCctvs();
  }, [roiData, roiFileData, cctvList]);

  // CCTV 템플릿 로드
  const loadCctvTemplate = () => {
    try {
      // console.log('🔧 loadCctvTemplate 호출됨, projectId:', projectId);
      const template = CctvTemplateService.getTemplateByProjectId(projectId);
      // console.log('📋 가져온 템플릿:', template);
      if (template) {
        setCctvTemplate(template);
        // console.log('✅ CCTV 템플릿 로드 성공, CCTV 개수:', template.cctvList.length);
      } else {
        console.error(`❌ 프로젝트 "${projectId}"의 CCTV 템플릿을 찾을 수 없습니다.`);
        setError(`프로젝트 "${projectId}"의 CCTV 템플릿을 찾을 수 없습니다.`);
      }
    } catch (error) {
      console.error('❌ CCTV 템플릿 로드 실패:', error);
      setError('CCTV 템플릿을 불러올 수 없습니다.');
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

  // ROI 파일 선택 - JSON 읽어서 전체 데이터 저장하고 banpo.json의 모든 CCTV 목록 표시
  const handleRoiFileSelect = async (fileName: string) => {
    if (!fileName) return;

    // 기존 작업이 있으면 확인 다이얼로그 표시
    if (selectedRoiFile && roiData && Object.keys(roiData.rois || {}).length > 0) {
      setPendingRoiFile(fileName);
      setConfirmDialogOpen(true);
      return;
    }

    loadRoiFile(fileName);
  };

  const loadRoiFile = async (fileName: string) => {
    try {
      setLoading(true);
      setError('');

      setSelectedRoiFile(fileName);

      // ROI 파일 다운로드 및 파싱
      const blob = await FileStorageService.downloadFile(projectId, 'roi', fileName);
      const text = await blob.text();
      const data = JSON.parse(text);

      // ROI 파일 전체를 저장 (IP 주소를 키로 하는 객체 구조)
      setRoiFileData(data);
      setOriginalRoiFileData(JSON.parse(JSON.stringify(data))); // 원본 데이터 깊은 복사

      // banpo.json의 모든 CCTV 목록을 표시
      if (cctvTemplate && cctvTemplate.cctvList) {
        const allCctvIds = cctvTemplate.cctvList.map(cctv => cctv.cctvId);
        setCctvList(allCctvIds);
      } else {
        console.warn('⚠️ CCTV 템플릿이 없습니다.');
        setError('CCTV 템플릿을 불러올 수 없습니다.');
      }

    } catch (err) {
      console.error('❌ ROI 파일 선택 에러:', err);
      setError(`ROI 파일 '${fileName}'을 불러오는데 실패했습니다.`);
      setRoiFileData(null);
      setOriginalRoiFileData(null);
      setCctvList([]);
      setSelectedCctv('');
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

  // CCTV 선택 - 템플릿에서 이미지 URL 가져오고 ROI 데이터 찾기
  const handleCctvSelect = (cctvId: string) => {
    // console.log('🎯 handleCctvSelect 호출됨, cctvId:', cctvId);
    setSelectedCctv(cctvId);
    setError('');

    if (!cctvTemplate) {
      console.error('❌ cctvTemplate이 null입니다!');
      setError('CCTV 템플릿이 로드되지 않았습니다.');
      return;
    }

    // console.log('🔍 템플릿에서 CCTV 찾기:', cctvTemplate.cctvList.map(c => c.cctvId));
    const cctv = cctvTemplate.cctvList.find(c => c.cctvId === cctvId);
    if (!cctv) {
      console.error(`❌ CCTV "${cctvId}"를 템플릿에서 찾을 수 없습니다.`);
      setError(`CCTV "${cctvId}"를 템플릿에서 찾을 수 없습니다.`);
      return;
    }

    // console.log('✅ CCTV 찾음:', cctv);
    const originalImage = cctv.images.find(img => img.type === 'original');
    if (!originalImage) {
      console.error(`❌ CCTV "${cctvId}"의 원본 이미지를 찾을 수 없습니다.`);
      setError(`CCTV "${cctvId}"의 원본 이미지를 찾을 수 없습니다.`);
      return;
    }

    // console.log('✅ 원본 이미지 찾음:', originalImage.endpoint);
    const timestamp = new Date().getTime();
    const imageUrl = `${originalImage.endpoint}?t=${timestamp}`;
    setCctvImageUrl(imageUrl);

    // 이미지 객체 생성 (기존 로직 호환용)
    const imageFile: ImageFile = {
      name: `${cctvId}.jpg`,
      path: imageUrl,
      size: 0,
      cctvId: cctvId
    };
    // console.log('📸 이미지 파일 객체 생성:', imageFile);
    setSelectedImage(imageFile);

    // ROI 파일에서 선택된 CCTV ID에 맞는 ROI 데이터 찾기
    if (roiFileData) {
      // console.log('🔍 ROI 파일에서 cctv_id 찾기:', cctvId);

      // ROI 파일 구조 감지 및 변환
      let foundRoiData: any = null;

      // 1. IP 주소를 키로 하는 구조 확인
      // { "172.19.32.96": { "cctv_id": "P1_B5_3_1", "matches": [...] } }
      for (const [key, data] of Object.entries(roiFileData)) {
        if (data && typeof data === 'object' && 'cctv_id' in data) {
          if (data.cctv_id === cctvId) {
            // console.log(`✅ IP ${key}에서 ROI 데이터 찾음:`, data);

            // matches 배열을 RoiCanvas 형식으로 변환
            // { [roiId: string]: number[] }
            const rois: { [roiId: string]: number[] } = {};
            if ('matches' in data && Array.isArray(data.matches)) {
              data.matches.forEach((match: any, index: number) => {
                // original_roi를 상하좌우 반전
                if (match.original_roi && Array.isArray(match.original_roi)) {
                  const roiId = match.parking_id || `ROI_${String(index + 1).padStart(2, '0')}`;
                  // 이미지 크기 - 640x640 기준
                  const imgWidth = 640;
                  const imgHeight = 640;

                  // 좌표 상하좌우 반전
                  const flippedCoords: number[] = [];
                  for (let i = 0; i < match.original_roi.length; i += 2) {
                    flippedCoords.push(imgWidth - match.original_roi[i]);  // X 좌우 반전
                    flippedCoords.push(imgHeight - match.original_roi[i + 1]);  // Y 상하 반전
                  }
                  rois[roiId] = flippedCoords;
                } else if (match.img_center_roi && Array.isArray(match.img_center_roi)) {
                  // original_roi가 없으면 img_center_roi를 사용하되, 좌표 변환
                  const roiId = match.parking_id || `ROI_${String(index + 1).padStart(2, '0')}`;
                  // img_center_roi는 이미지 중심 기준이므로 변환 필요
                  // 이미지 크기를 알아야 변환 가능 - 임시로 1920x1080 가정
                  const imgWidth = 1920;
                  const imgHeight = 1080;
                  const centerX = imgWidth / 2;
                  const centerY = imgHeight / 2;

                  const convertedCoords: number[] = [];
                  for (let i = 0; i < match.img_center_roi.length; i += 2) {
                    // img_center_roi를 절대 좌표로 변환 후 상하좌우 반전
                    const x = centerX - match.img_center_roi[i];  // X 좌우 반전 (중심 기준이므로 빼기)
                    const y = centerY - match.img_center_roi[i + 1];  // Y 상하 반전 (중심 기준이므로 빼기)
                    convertedCoords.push(x);
                    convertedCoords.push(y);
                  }
                  rois[roiId] = convertedCoords;
                }
              });
            }

            foundRoiData = {
              cctv_id: cctvId,
              rois: rois
            };
            break;
          }
        }
      }

      // 2. 직접 구조 확인 (이미 RoiData 형식)
      // { "cctv_id": "P1_B2_3", "rois": [{roi_id: "ROI_01", coords: [...]}] }
      if (!foundRoiData && 'cctv_id' in roiFileData && roiFileData.cctv_id === cctvId) {
        // console.log('✅ 직접 구조 ROI 데이터 찾음:', roiFileData);

        // rois 배열을 객체로 변환
        const rois: { [roiId: string]: number[] } = {};
        if ('rois' in roiFileData && Array.isArray(roiFileData.rois)) {
          roiFileData.rois.forEach((roi: any) => {
            if (roi.roi_id && roi.coords) {
              rois[roi.roi_id] = roi.coords;
            }
          });
        }

        foundRoiData = {
          cctv_id: cctvId,
          rois: rois
        };
      }

      if (foundRoiData) {
        // console.log('📊 변환된 ROI 데이터:', foundRoiData);
        setRoiData(foundRoiData);
        setOriginalRoiData(JSON.parse(JSON.stringify(foundRoiData))); // 원본 데이터 깊은 복사
      } else {
        console.warn(`⚠️ CCTV "${cctvId}"에 대한 ROI 데이터를 찾을 수 없습니다.`);
        setRoiData(null);
        setOriginalRoiData(null);
      }
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

  // ROI 데이터 로드 (Draft 모드 지원)
  const loadRoiData = async (image: ImageFile, roiFile: string) => {
    try {
      setLoading(true);
      setError('');

      const cctvId = image.cctvId || selectedCctv || getDisplayImageName(image.name).split('.')[0];

      if (draftCreated) {
        // Draft 모드: 저장된 Draft 데이터 사용
        if (draftRoiData[cctvId]) {
          setRoiData(draftRoiData[cctvId]);
        } else {
          // Draft 데이터가 없으면 현재 roiFileData 사용
          if (roiFileData) {
            setRoiData(roiFileData);
            setDraftRoiData(prev => ({
              ...prev,
              [cctvId]: roiFileData
            }));
          }
        }
      } else {
        // 일반 모드: roiFileData 사용
        if (roiFileData) {
          setRoiData(roiFileData);
        }
      }
    } catch (err) {
      console.error('ROI 데이터 로드 에러:', err);
      setError(`ROI 데이터를 불러오는데 실패했습니다.`);
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

  // 롤백 기능 - 선택된 CCTV의 원본 ROI 데이터로 복원
  const handleRollback = () => {
    if (!originalRoiData) {
      setError('롤백할 원본 데이터가 없습니다.');
      return;
    }

    // 원본 데이터로 복원
    setRoiData(JSON.parse(JSON.stringify(originalRoiData))); // 깊은 복사
    setRoiEditMode(null);
    setSelectedRoiId('');
    setSuccess('원본 ROI 데이터로 롤백되었습니다.');
  };

  // 최종 저장 다이얼로그 열기
  const handleOpenSaveDialog = () => {
    setSaveDialogOpen(true);
    setNewFileName('');
  };

  const handleCloseSaveDialog = () => {
    setSaveDialogOpen(false);
    setNewFileName('');
  };

  // 최종 저장 - 파일명 입력 후 다운로드
  const handleFinalSave = async () => {
    if (!selectedRoiFile || !newFileName.trim()) {
      setError('파일명을 입력해주세요.');
      return;
    }

    try {
      setLoading(true);

      // 파일명에 .json 확장자 추가 (없으면)
      const filename = newFileName.endsWith('.json') ? newFileName : `${newFileName}.json`;

      // 현재 roiFileData를 JSON으로 변환
      const file = new File(
        [JSON.stringify(roiFileData, null, 2)],
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

      // 서버에도 업로드
      await FileStorageService.uploadFiles(
        projectId,
        'roi',
        [file]
      );

      setOriginalRoiFileData(JSON.parse(JSON.stringify(roiFileData))); // 원본 데이터 업데이트
      setSuccess(`ROI 파일이 저장되었습니다: ${filename}`);
      setSaveDialogOpen(false);
      setError('');

      // ROI 파일 목록 새로고침
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

        {/* 최종 저장 버튼 */}
        {!isMobile && selectedRoiFile && (
          <Button
            variant="contained"
            color="success"
            startIcon={<SaveIcon />}
            onClick={handleOpenSaveDialog}
            size="large"
            sx={{ mr: 1 }}
          >
            최종 저장
          </Button>
        )}

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
              sm: 'repeat(2, 1fr)'
            }
          }}>
            {/* ROI 파일 선택 */}
            <Card sx={{ height: 'fit-content' }}>
              <CardContent sx={{ ...responsiveSpacing.cardPadding }}>
                <Typography variant="h6" gutterBottom sx={{ fontSize: { xs: '1rem', sm: '1.25rem' } }}>
                  ROI 파일
                </Typography>
                <FormControl fullWidth size={isMobile ? "small" : "medium"}>
                  <InputLabel>ROI 파일 선택</InputLabel>
                  <Select
                    value={selectedRoiFile}
                    onChange={(e) => handleRoiFileSelect(e.target.value)}
                    label="ROI 파일 선택"
                    sx={{ minHeight: { xs: 44, sm: 56 } }}
                  >
                    {roiFiles.map((file) => (
                      <MenuItem key={file} value={file}>
                        {file.replace(/\.json$/, '')}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </CardContent>
            </Card>

            {/* CCTV 선택 */}
            <Card sx={{ height: 'fit-content' }}>
              <CardContent sx={{ ...responsiveSpacing.cardPadding }}>
                <Typography variant="h6" gutterBottom sx={{ fontSize: { xs: '1rem', sm: '1.25rem' } }}>
                  CCTV 선택
                </Typography>
                <FormControl fullWidth size={isMobile ? "small" : "medium"}>
                  <InputLabel>CCTV 선택</InputLabel>
                  <Select
                    value={selectedCctv}
                    onChange={(e) => handleCctvSelect(e.target.value)}
                    label="CCTV 선택"
                    disabled={!selectedRoiFile || cctvList.length === 0}
                    sx={{ minHeight: { xs: 44, sm: 56 } }}
                  >
                    {cctvList.map((cctvId) => (
                      <MenuItem key={cctvId} value={cctvId}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, width: '100%' }}>
                          <span>{cctvId}</span>
                          {modifiedCctvs.has(cctvId) && (
                            <Chip
                              label="수정됨"
                              size="small"
                              color="warning"
                              sx={{ ml: 'auto', height: 20, fontSize: '0.7rem' }}
                            />
                          )}
                        </Box>
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>

                {/* 수정된 CCTV 목록 */}
                {modifiedCctvs.size > 0 && (
                  <Box sx={{ mt: 2 }}>
                    <Alert severity="warning" sx={{ mb: 1 }}>
                      <Typography variant="body2" fontWeight="bold">
                        수정된 CCTV ({modifiedCctvs.size}개)
                      </Typography>
                    </Alert>
                    <List dense sx={{ bgcolor: 'warning.light', borderRadius: 1, py: 0.5 }}>
                      {Array.from(modifiedCctvs).map((cctvId) => (
                        <ListItem
                          key={cctvId}
                          sx={{
                            py: 0.5,
                            cursor: 'pointer',
                            '&:hover': { bgcolor: 'warning.main' },
                            bgcolor: selectedCctv === cctvId ? 'warning.main' : 'transparent'
                          }}
                          onClick={() => handleCctvSelect(cctvId)}
                        >
                          <ListItemText
                            primary={cctvId}
                            primaryTypographyProps={{
                              fontSize: '0.875rem',
                              fontWeight: selectedCctv === cctvId ? 'bold' : 'normal'
                            }}
                          />
                        </ListItem>
                      ))}
                    </List>
                  </Box>
                )}
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
                      원본 이미지 ({isMobile ? "참고용" : "참고용"})
                  </Typography>
                  <Box
                    sx={{
                      width: '100%',
                      height: fullscreenCanvas
                        ? { xs: 'calc(100vh - 200px)', sm: 'calc(100vh - 150px)' }
                        : { xs: 400, sm: 500, md: 600, lg: 700 },
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
                    {(() => {
                      // console.log('🖼️ 편집 가능한 이미지 렌더링 체크');
                      // console.log('  roiData:', roiData);
                      // console.log('  roiData?.rois:', roiData?.rois);
                      // console.log('  조건:', roiData && roiData.rois);
                      return roiData && roiData.rois ? (
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
                            width: '100%',
                            height: '100%',
                            objectFit: 'fill'
                          }}
                        />
                      );
                    })()}
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
                        : { xs: 400, sm: 500, md: 600, lg: 700 },
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
                    {(() => {
                      // console.log('🖼️ 편집 가능한 이미지 렌더링 체크');
                      // console.log('  roiData:', roiData);
                      // console.log('  roiData?.rois:', roiData?.rois);
                      // console.log('  조건:', roiData && roiData.rois);
                      return roiData && roiData.rois ? (
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
                            width: '100%',
                            height: '100%',
                            objectFit: 'fill'
                          }}
                        />
                      );
                    })()}
                  </Box>

                  {/* 편집 버튼들 - 생성/수정/삭제/롤백 */}
                  {selectedCctv && !fullscreenCanvas && (
                    <Stack direction="row" spacing={1} sx={{ mt: 2 }}>
                      <Button
                        variant="outlined"
                        startIcon={<AddIcon />}
                        onClick={handleCreateRoi}
                        size="small"
                        fullWidth
                        disabled={roiEditMode !== null}
                        sx={{ ...touchFriendly.button }}
                      >
                        생성
                      </Button>
                      <Button
                        variant="outlined"
                        startIcon={<EditIcon />}
                        onClick={() => {
                          if (selectedRoiId) {
                            handleUpdateRoi(selectedRoiId);
                          } else {
                            setError('수정할 ROI를 먼저 선택해주세요.');
                          }
                        }}
                        disabled={roiEditMode !== null}
                        size="small"
                        fullWidth
                        sx={{ ...touchFriendly.button }}
                      >
                        수정
                      </Button>
                      <Button
                        variant="outlined"
                        color="error"
                        startIcon={<DeleteIcon />}
                        onClick={() => {
                          if (selectedRoiId) {
                            handleDeleteRoi(selectedRoiId);
                          } else {
                            setError('삭제할 ROI를 먼저 선택해주세요.');
                          }
                        }}
                        disabled={roiEditMode !== null}
                        size="small"
                        fullWidth
                        sx={{ ...touchFriendly.button }}
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
                        sx={{ ...touchFriendly.button }}
                      >
                        롤백
                      </Button>
                    </Stack>
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

            {selectedRoiFile && (
              <Button
                variant="contained"
                color="success"
                startIcon={<SaveIcon />}
                onClick={() => {
                  handleOpenSaveDialog();
                  setMobileControlsOpen(false);
                }}
                fullWidth
                sx={{
                  ...touchFriendly.button,
                  fontSize: '1.125rem',
                  py: 2
                }}
              >
                최종 저장
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
