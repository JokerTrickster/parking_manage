import React, { useState, useEffect, useRef, useContext } from 'react';
import {
  Box,
  Typography,
  Button,
  IconButton,
  List,
  ListItemText,
  ListItemButton,
  ListItemIcon,
  Divider,
  useTheme,
  Alert,
  AppBar,
  Toolbar,
  Drawer,
  styled,
  Paper,
  Chip,
  alpha,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField
} from '@mui/material';
import {
  Videocam as CctvIcon,
  Save as SaveIcon,
  Delete as DeleteIcon,
  Add as AddIcon,
  Close as CloseIcon,
  ArrowBack as ArrowBackIcon,
  ChevronLeft as ChevronLeftIcon,
  ChevronRight as ChevronRightIcon,
  Compare as CompareIcon,
  Info as InfoIcon,
  LightMode as LightModeIcon,
  DarkMode as DarkModeIcon,
  Edit as EditIcon,
  FolderOpen as FolderIcon
} from '@mui/icons-material';
import { useParams, useNavigate } from 'react-router-dom';
import { ThemeContext } from '../App';
import { GRADIENTS, SHADOWS } from '../styles/theme';
import '../index.css';

import { RoiService } from '../services/RoiService';
import { FileStorageService } from '../services/FileStorageService';
import { CctvTemplateService } from '../services/CctvTemplateService';
import { RoiData as RoiFileData } from '../models/RoiData';
import { CctvTemplate } from '../models/CctvTemplate';
import RoiCanvas, { RoiCanvasRef } from '../components/RoiCanvas';

// --- Types ---
interface RoiWorkViewProps {
  projectId?: string;
  onBack?: () => void;
}

// --- Constants ---
const DRAWER_WIDTH = 260;
const RIGHT_DRAWER_WIDTH = 300;
const HEADER_HEIGHT = 40; // Minimal header
const CONTROL_BAR_HEIGHT = 56; // Workspace control bar

// Styled Components
const Main = styled('main', { shouldForwardProp: (prop) => prop !== 'openLeft' && prop !== 'openRight' })<{
  openLeft?: boolean;
  openRight?: boolean;
}>(({ theme, openLeft, openRight }) => ({
  flexGrow: 1,
  height: '100vh',
  marginTop: 0,
  transition: theme.transitions.create(['margin', 'width'], {
    easing: theme.transitions.easing.sharp,
    duration: theme.transitions.duration.leavingScreen,
  }),
  marginLeft: -DRAWER_WIDTH,
  marginRight: -RIGHT_DRAWER_WIDTH,
  backgroundColor: theme.palette.background.default,
  display: 'flex',
  flexDirection: 'column',
  overflow: 'hidden',
  position: 'relative',
  ...(openLeft && {
    transition: theme.transitions.create(['margin', 'width'], {
      easing: theme.transitions.easing.easeOut,
      duration: theme.transitions.duration.enteringScreen,
    }),
    marginLeft: 0,
  }),
  ...(openRight && {
    transition: theme.transitions.create(['margin', 'width'], {
      easing: theme.transitions.easing.easeOut,
      duration: theme.transitions.duration.enteringScreen,
    }),
    marginRight: 0,
  }),
}));

export const RoiWorkView: React.FC<RoiWorkViewProps> = ({ projectId: propProjectId, onBack }) => {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';
  const { mode, toggleTheme } = useContext(ThemeContext);
  const params = useParams<{ projectId: string }>();
  const navigate = useNavigate();

  const projectId = params.projectId || propProjectId || '';

  // --- State ---
  const [roiFiles, setRoiFiles] = useState<string[]>([]);
  const [selectedRoiFile, setSelectedRoiFile] = useState<string>('');

  const [cctvTemplate, setCctvTemplate] = useState<CctvTemplate | null>(null);
  const [cctvList, setCctvList] = useState<string[]>([]);
  const [selectedCctv, setSelectedCctv] = useState<string>('');

  const [roiFileData, setRoiFileData] = useState<RoiFileData | null>(null);
  const [roiData, setRoiData] = useState<any>(null);
  // CCTV별 작업 내용을 저장하는 Map (cctvId -> roiData)
  const [cctvRoiDataMap, setCctvRoiDataMap] = useState<Map<string, any>>(new Map());
  // CCTV별 원본 데이터를 저장하는 Map (변경사항 비교용)
  const [originalCctvDataMap, setOriginalCctvDataMap] = useState<Map<string, any>>(new Map());
  // 변경사항이 있는 CCTV ID Set
  const [cctvWithChanges, setCctvWithChanges] = useState<Set<string>>(new Set());

  const [cctvImageUrl, setCctvImageUrl] = useState<string>('');
  const [originalImageUrl, setOriginalImageUrl] = useState<string>('');

  const [error, setError] = useState<string>('');
  const [success, setSuccess] = useState<string>(''); // eslint-disable-line @typescript-eslint/no-unused-vars
  const [leftDrawerOpen, setLeftDrawerOpen] = useState(true);
  const [rightDrawerOpen, setRightDrawerOpen] = useState(true);
  const [showDualView, setShowDualView] = useState(true);

  const [roiEditMode, setRoiEditMode] = useState<'create' | 'update' | 'delete' | null>(null);
  const [selectedRoiId, setSelectedRoiId] = useState<string>('');
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const roiCanvasRef = useRef<RoiCanvasRef>(null);

  const [showRoiIdDialog, setShowRoiIdDialog] = useState(false);
  const [newRoiId, setNewRoiId] = useState<string>('');
  const [pendingCreatePoints, setPendingCreatePoints] = useState<number[] | null>(null);
  const [currentDrawingPoints, setCurrentDrawingPoints] = useState<number[]>([]);

  // 파일 저장 다이얼로그 상태
  const [showSaveDialog, setShowSaveDialog] = useState(false);
  const [saveFileName, setSaveFileName] = useState<string>('');

  // 수정 모드 관련 상태
  const [isSelectingRoiForEdit, setIsSelectingRoiForEdit] = useState(false);
  const [editingRoiId, setEditingRoiId] = useState<string>('');
  const [editingOriginalRoi, setEditingOriginalRoi] = useState<number[] | null>(null);

  // --- Layout Sizing Logic ---
  const referenceContainerRef = useRef<HTMLDivElement>(null);
  const workspaceContainerRef = useRef<HTMLDivElement>(null);
  const [referenceSize, setReferenceSize] = useState<{ w: number, h: number } | null>(null);
  const [workspaceSize, setWorkspaceSize] = useState<{ w: number, h: number } | null>(null);

  useEffect(() => {
    const observer = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const { width, height } = entry.contentRect;
        if (entry.target === referenceContainerRef.current) {
          setReferenceSize({ w: width, h: height });
        } else if (entry.target === workspaceContainerRef.current) {
          setWorkspaceSize({ w: width, h: height });
        }
      }
    });

    if (referenceContainerRef.current) observer.observe(referenceContainerRef.current);
    if (workspaceContainerRef.current) observer.observe(workspaceContainerRef.current);

    return () => observer.disconnect();
  }, [showDualView, leftDrawerOpen, rightDrawerOpen]);

  // Helper to get maximized square style - 두 컨테이너 모두 같은 높이 사용
  const getUnifiedSquareStyle = () => {
    if (!referenceSize || !workspaceSize) {
      return {
        reference: { width: '100%' as string | number, height: '100%' as string | number },
        workspace: { width: '100%' as string | number, height: '100%' as string | number }
      };
    }

    // 두 컨테이너의 높이 중 더 작은 값을 공통 높이로 사용
    const commonHeight = Math.min(referenceSize.h, workspaceSize.h);

    // 각 컨테이너의 너비를 기준으로 정사각형 크기 계산 (공통 높이 사용)
    const refSide = Math.min(referenceSize.w, commonHeight);
    const workSide = Math.min(workspaceSize.w, commonHeight);

    // 두 정사각형 중 더 작은 크기를 공통으로 사용하여 높이를 완전히 동일하게
    const finalSide = Math.min(refSide, workSide);

    return {
      reference: { width: finalSide as string | number, height: finalSide as string | number },
      workspace: { width: finalSide as string | number, height: finalSide as string | number }
    };
  };

  const unifiedSizes = getUnifiedSquareStyle();

  // --- Effects ---
  useEffect(() => {
    if (!projectId) { setError('Invalid Project ID'); return; }
    loadInitialData();
  }, [projectId]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (cctvTemplate) setCctvList(cctvTemplate.cctvList.map(c => c.cctvId));
  }, [cctvTemplate]);

  // roiData가 변경될 때마다 현재 CCTV의 작업 내용을 Map에 저장하고 변경사항 확인
  useEffect(() => {
    if (selectedCctv && roiData) {
      // 작업 내용 저장
      setCctvRoiDataMap(prevMap => {
        const newMap = new Map(prevMap);
        newMap.set(selectedCctv, { ...roiData });
        return newMap;
      });

      // 변경사항 확인 (원본 데이터와 비교)
      const originalData = originalCctvDataMap.get(selectedCctv);
      if (originalData) {
        const hasChanges = JSON.stringify(originalData.rois) !== JSON.stringify(roiData.rois);
        setCctvWithChanges(prevSet => {
          const newSet = new Set(prevSet);
          if (hasChanges) {
            newSet.add(selectedCctv);
          } else {
            newSet.delete(selectedCctv);
          }
          return newSet;
        });
      }
    }
  }, [roiData, selectedCctv, originalCctvDataMap]);



  // --- Logic ---
  const loadInitialData = async () => {
    try { await Promise.all([loadRoiLists(), loadTemplate()]); } catch { }
  };

  const loadRoiLists = async () => {
    try {
      const res = await FileStorageService.listFiles(projectId, 'roi');
      setRoiFiles(res.data.files.map(f => f.filename));
    } catch { setError('ROI 파일 목록 로드 실패'); }
  };

  const loadTemplate = async () => {
    try {
      const t = CctvTemplateService.getTemplateByProjectId(projectId);
      if (t) setCctvTemplate(t);
    } catch { }
  };

  const handleRoiFileSelect = async (fileName: string) => {
    if (selectedRoiFile === fileName) return;

    console.log('📄 handleRoiFileSelect - Selected file:', fileName);

    try {
      setSelectedRoiFile(fileName);
      setError('');

      // 1. timestamp 제거한 기본 파일명 추출
      const baseFileName = fileName.replace(/\.json$/, '').replace(/_\d+$/, '');
      console.log('📄 handleRoiFileSelect - Base filename:', baseFileName);

      // 2. 초안 생성 (실제 선택한 파일 전체 이름으로)
      try {
        const fileNameWithoutExt = fileName.replace(/\.json$/, '');
        console.log('📄 Creating draft from:', fileNameWithoutExt);
        await RoiService.createDraftRoi(projectId, fileNameWithoutExt);
        console.log('📄 Draft created successfully');
      } catch (err) {
        // 이미 초안이 있으면 무시
        console.log('📄 Draft creation skipped:', err);
      }

      // 3. 초안 파일 직접 다운로드 (draft 폴더에서)
      try {
        const draftFileName = `draft/${baseFileName}_draft.json`;
        console.log('📄 Loading draft file:', draftFileName);
        const blob = await FileStorageService.downloadFile(projectId, 'roi', draftFileName);
        const text = await blob.text();
        setRoiFileData(JSON.parse(text));
        console.log('📄 Draft file loaded successfully');
      } catch (err) {
        // 초안 로드 실패 시 원본 파일 로드
        console.log('📄 Draft load failed, loading original:', fileName, err);
        const blob = await FileStorageService.downloadFile(projectId, 'roi', fileName);
        const text = await blob.text();
        setRoiFileData(JSON.parse(text));
        console.log('📄 Original file loaded');
      }

      setHasUnsavedChanges(false);
      setSelectedCctv('');
      setRoiData(null);
      setCctvImageUrl('');
      setOriginalImageUrl('');
      // ROI 파일 변경 시 모든 Map과 Set 초기화
      setCctvRoiDataMap(new Map());
      setOriginalCctvDataMap(new Map());
      setCctvWithChanges(new Set());
    } catch { setError(`파일 '${fileName}' 로드 실패`); }
  };

  const handleCctvSelect = (cctvId: string) => {
    if (selectedCctv === cctvId) return;

    // 1. 현재 CCTV의 작업 내용을 Map에 저장 (이전 CCTV가 있는 경우)
    if (selectedCctv && roiData) {
      setCctvRoiDataMap(prevMap => {
        const newMap = new Map(prevMap);
        newMap.set(selectedCctv, { ...roiData });
        return newMap;
      });
    }

    // 2. 새로운 CCTV 선택
    setSelectedCctv(cctvId);
    setError('');

    if (!cctvTemplate) return;
    const cctv = cctvTemplate.cctvList.find(c => c.cctvId === cctvId);
    if (!cctv) { setError('CCTV 정보 없음'); return; }

    const timestamp = new Date().getTime();

    // Configs
    const originalConfig = cctv.images.find(img => img.type === 'original');
    if (originalConfig) setOriginalImageUrl(`${originalConfig.endpoint}?t=${timestamp}`);

    const viewConfig = cctv.images.find(img => img.type === 'original') || cctv.images[0];
    if (viewConfig) setCctvImageUrl(`${viewConfig.endpoint}?t=${timestamp}`);
    else { setError('이미지 설정 없음'); return; }

    // 3. 새로운 CCTV의 작업 내용 확인
    const savedRoiData = cctvRoiDataMap.get(cctvId);
    if (savedRoiData) {
      // Map에 저장된 작업 내용이 있으면 복원
      setRoiData(savedRoiData);
    } else {
      // 저장된 작업 내용이 없으면 파일에서 추출
      extractRoiDataForCctv(cctvId, roiFileData);
    }
  };

  const extractRoiDataForCctv = (cctvId: string, currentFileData: any) => {
    if (!currentFileData) {
      setRoiData({ cctv_id: cctvId, rois: {} });
      return;
    }
    let foundData = null;

    // 1. Search Matches
    for (const data of Object.values(currentFileData)) {
      if (data && typeof data === 'object' && (data as any).cctv_id === cctvId) {
        const rois: { [id: string]: number[] } = {};
        const matches = (data as any).matches || [];
        matches.forEach((match: any, idx: number) => {
          const roiId = match.parking_id || `ROI_${String(idx + 1).padStart(2, '0')}`;
          const imgWidth = 640;
          const imgHeight = 640;
          const coords: number[] = [];
          if (match.original_roi) {
            for (let i = 0; i < match.original_roi.length; i += 2) {
              coords.push(imgWidth - match.original_roi[i]);
              coords.push(imgHeight - match.original_roi[i + 1]);
            }
            rois[roiId] = coords;
          }
        });
        foundData = { cctv_id: cctvId, rois };
        break;
      }
    }
    // 2. Fallback
    if (!foundData && currentFileData.cctv_id === cctvId) {
      const rois: { [id: string]: number[] } = {};
      (currentFileData.rois || []).forEach((r: any) => {
        if (r.roi_id && r.coords) rois[r.roi_id] = r.coords;
      });
      foundData = { cctv_id: cctvId, rois };
    }

    const finalData = foundData || { cctv_id: cctvId, rois: {} };
    setRoiData(finalData);

    // 원본 데이터 저장 (변경사항 비교용)
    setOriginalCctvDataMap(prevMap => {
      const newMap = new Map(prevMap);
      newMap.set(cctvId, JSON.parse(JSON.stringify(finalData)));
      return newMap;
    });
  };

  // Actions
  // CCTV별 임시 저장 (초안에 저장 후 정식 파일로 저장)
  const handleSave = async () => {
    if (!selectedRoiFile || !hasUnsavedChanges) return;
    console.log('💾 handleSave - Selected file:', selectedRoiFile);

    try {
      // timestamp 제거한 기본 파일명으로 저장
      const baseFileName = selectedRoiFile.replace(/\.json$/, '').replace(/_\d+$/, '');
      console.log('💾 handleSave - Saving draft with baseFileName:', baseFileName);

      await RoiService.saveDraftRoi(projectId, baseFileName);
      setSuccess('저장 완료');
      setHasUnsavedChanges(false);
      setCctvWithChanges(new Set()); // 변경사항 초기화
      loadRoiLists();
    } catch (err) {
      console.error('💾 handleSave - Save failed:', err);
      setError('저장 실패');
    }
  };

  // 최종 저장 (새 파일 이름으로 저장)
  const handleFinalSave = () => {
    setSaveFileName(selectedRoiFile || '');
    setShowSaveDialog(true);
  };

  const handleConfirmSave = async () => {
    if (!saveFileName.trim()) {
      setError('파일 이름을 입력해주세요');
      return;
    }

    try {
      // timestamp 제거한 기본 파일명으로 저장
      const baseFileName = saveFileName.trim().replace(/\.json$/, '').replace(/_\d+$/, '');
      await RoiService.saveDraftRoi(projectId, baseFileName);
      setSuccess(`${baseFileName} 파일로 저장 완료`);
      setHasUnsavedChanges(false);
      // CCTV별 변경사항 초기화
      setCctvWithChanges(new Set());
      setShowSaveDialog(false);
      setSaveFileName('');
      loadRoiLists();
    } catch (err) {
      setError('저장 실패: ' + (err as Error).message);
    }
  };

  const handleCreateRoi = (points: number[]) => {
    if (points.length < 6) {
      setError('최소 3개 이상의 점을 선택해주세요');
      return;
    }
    setPendingCreatePoints(points);

    // 다음 번호 자동 계산
    const existingNumbers = Object.keys(roiData?.rois || {})
      .filter(id => id.startsWith('ParkingLocations_'))
      .map(id => parseInt(id.replace('ParkingLocations_', ''), 10))
      .filter(num => !isNaN(num));

    const nextNumber = existingNumbers.length > 0
      ? Math.max(...existingNumbers) + 1
      : 1;

    setNewRoiId(nextNumber.toString());
    setShowRoiIdDialog(true);
    setCurrentDrawingPoints([]);
  };

  const handleConfirmRoiId = async () => {
    if (!newRoiId.trim()) {
      setError('ROI 번호를 입력해주세요');
      return;
    }
    if (!roiData || !pendingCreatePoints || !selectedRoiFile || !selectedCctv) return;

    // 숫자 검증
    const number = parseInt(newRoiId.trim(), 10);
    if (isNaN(number) || number < 1) {
      setError('1 이상의 숫자를 입력해주세요');
      return;
    }

    // ParkingLocations_ + 숫자로 ID 생성
    const id = `ParkingLocations_${number}`;
    if (roiData.rois[id]) {
      setError('이미 존재하는 ROI 번호입니다');
      return;
    }

    const roundedPoints = pendingCreatePoints.map(Math.round);
    const newRois = { ...roiData.rois, [id]: roundedPoints };
    setRoiData({ ...roiData, rois: newRois });
    setRoiEditMode(null);
    setSelectedRoiId(id);
    setHasUnsavedChanges(true);

    // 초안 파일에 즉시 생성
    try {
      const baseFileName = selectedRoiFile.replace(/\.json$/, '').replace(/_\d+$/, '');
      await RoiService.createRoi(projectId, {
        roi_id: id,
        cctv_id: selectedCctv,
        roi_file: baseFileName,
        coords: roundedPoints
      });
    } catch (err) {
      console.error('Failed to create ROI in draft:', err);
      setError('ROI 생성 실패');
    }

    setShowRoiIdDialog(false);
    setPendingCreatePoints(null);
    setNewRoiId('');
  };

  const handleUpdateRoi = async (id: string, points: number[]) => {
    if (!roiData || !selectedRoiFile || !selectedCctv) return;

    const roundedPoints = points.map(Math.round);
    const newRois = { ...roiData.rois, [id]: roundedPoints };
    setRoiData({ ...roiData, rois: newRois });
    setRoiEditMode(null);
    setHasUnsavedChanges(true);

    // 초안 파일에 즉시 업데이트
    try {
      const baseFileName = selectedRoiFile.replace(/\.json$/, '').replace(/_\d+$/, '');
      await RoiService.updateRoi(projectId, {
        roi_id: id,
        cctv_id: selectedCctv,
        roi_file: baseFileName,
        coords: roundedPoints
      });
    } catch (err) {
      console.error('Failed to update ROI in draft:', err);
      setError('ROI 업데이트 실패');
    }

    // 수정 모드 상태 초기화
    setSelectedRoiId(''); // 선택된 ROI 초기화 - 다음 수정 시 새로운 선택 가능
    setEditingRoiId('');
    setEditingOriginalRoi(null);
    setCurrentDrawingPoints([]);
  };

  const handleDeleteRoi = async (id: string) => {
    if (!roiData || !selectedRoiFile || !selectedCctv) return;

    const newRois = { ...roiData.rois };
    delete newRois[id];
    setRoiData({ ...roiData, rois: newRois });
    if (selectedRoiId === id) setSelectedRoiId('');
    setHasUnsavedChanges(true);

    // 초안 파일에서 즉시 삭제
    try {
      const baseFileName = selectedRoiFile.replace(/\.json$/, '').replace(/_\d+$/, '');
      await RoiService.deleteRoi(projectId, {
        roi_id: id,
        cctv_id: selectedCctv,
        roi_file: baseFileName
      });
    } catch (err) {
      console.error('Failed to delete ROI in draft:', err);
      setError('ROI 삭제 실패');
    }
  };

  const handleRollback = () => {
    // 현재 CCTV만 원본 데이터로 롤백
    if (!selectedCctv) return;

    // 현재 CCTV의 원본 데이터 가져오기
    const originalData = originalCctvDataMap.get(selectedCctv);
    if (originalData) {
      // 현재 CCTV의 roiData를 원본으로 복구
      setRoiData(JSON.parse(JSON.stringify(originalData)));

      // cctvRoiDataMap에서 해당 CCTV 데이터 업데이트
      setCctvRoiDataMap(prevMap => {
        const newMap = new Map(prevMap);
        newMap.set(selectedCctv, JSON.parse(JSON.stringify(originalData)));
        return newMap;
      });

      // 변경사항 Set에서 제거
      setCctvWithChanges(prevSet => {
        const newSet = new Set(prevSet);
        newSet.delete(selectedCctv);
        return newSet;
      });

      // hasUnsavedChanges 재계산 (다른 CCTV에 변경사항이 있는지 확인)
      setCctvWithChanges(currentSet => {
        const hasOtherChanges = Array.from(currentSet).some(id => id !== selectedCctv);
        setHasUnsavedChanges(hasOtherChanges);
        return currentSet;
      });

      setSuccess(`${selectedCctv} CCTV의 변경사항이 롤백되었습니다`);
      setTimeout(() => setSuccess(''), 3000);
    }
  };

  return (
    <Box sx={{ display: 'flex', height: '100vh', bgcolor: 'background.default', overflow: 'hidden', position: 'relative' }}>

      {/* Left Sidebar */}
      <Drawer
        variant="persistent"
        anchor="left"
        open={leftDrawerOpen}
        sx={{
          width: DRAWER_WIDTH,
          flexShrink: 0,
          '& .MuiDrawer-paper': {
            width: DRAWER_WIDTH,
            boxSizing: 'border-box',
            top: 0,
            height: '100%',
            bgcolor: 'background.paper',
            borderRight: '1px solid',
            borderColor: 'divider',
            color: 'text.primary'
          },
        }}
      >
        <Box sx={{ overflow: 'auto' }}>
          <Paper
            elevation={0}
            sx={{
              p: 2,
              pb: 1,
              bgcolor: isDark ? alpha(theme.palette.primary.main, 0.05) : alpha(theme.palette.primary.main, 0.03),
              borderRadius: 0
            }}
          >
            <Typography variant="overline" sx={{
              color: 'primary.main',
              fontWeight: 700,
              letterSpacing: 1
            }}>
              ROI FILES
            </Typography>
          </Paper>
          <List dense disablePadding>
            {roiFiles.map(f => (
              <ListItemButton
                key={f}
                selected={selectedRoiFile === f}
                onClick={() => handleRoiFileSelect(f)}
                className={selectedRoiFile === f ? 'animate-fade-in' : ''}
                sx={{
                  pl: 3,
                  borderLeft: selectedRoiFile === f ? `3px solid ${theme.palette.primary.main}` : '3px solid transparent',
                  transition: 'all 0.2s ease',
                  '&.Mui-selected': {
                    bgcolor: alpha(theme.palette.primary.main, 0.1),
                    '&:hover': {
                      bgcolor: alpha(theme.palette.primary.main, 0.15)
                    }
                  },
                  '&:hover': {
                    bgcolor: alpha(theme.palette.action.hover, 0.05)
                  }
                }}
              >
                <ListItemText
                  primary={f}
                  primaryTypographyProps={{
                    fontSize: 13,
                    color: selectedRoiFile === f ? 'primary.main' : 'text.secondary',
                    fontWeight: selectedRoiFile === f ? 600 : 400
                  }}
                />
              </ListItemButton>
            ))}
          </List>

          <Divider sx={{ my: 2 }} />

          <Paper
            elevation={0}
            sx={{
              p: 2,
              pb: 1,
              bgcolor: isDark ? alpha(theme.palette.secondary.main, 0.05) : alpha(theme.palette.secondary.main, 0.03),
              borderRadius: 0
            }}
          >
            <Typography variant="overline" sx={{
              color: 'secondary.main',
              fontWeight: 700,
              letterSpacing: 1
            }}>
              CCTV CAMERAS
            </Typography>
          </Paper>
          <List dense disablePadding>
            {cctvList.map(id => (
              <ListItemButton
                key={id}
                selected={selectedCctv === id}
                onClick={() => handleCctvSelect(id)}
                disabled={!selectedRoiFile}
                className={selectedCctv === id ? 'animate-fade-in' : ''}
                sx={{
                  pl: 3,
                  borderLeft: selectedCctv === id ? `3px solid ${theme.palette.secondary.main}` : '3px solid transparent',
                  transition: 'all 0.2s ease',
                  '&.Mui-selected': {
                    bgcolor: alpha(theme.palette.secondary.main, 0.1),
                    '&:hover': {
                      bgcolor: alpha(theme.palette.secondary.main, 0.15)
                    }
                  },
                  '&:hover': {
                    bgcolor: alpha(theme.palette.action.hover, 0.05)
                  },
                  '&.Mui-disabled': {
                    opacity: 0.5
                  }
                }}
              >
                <ListItemIcon sx={{ minWidth: 28 }}>
                  <CctvIcon
                    fontSize="small"
                    sx={{
                      color: selectedCctv === id ? 'secondary.main' : 'text.disabled',
                      transition: 'color 0.2s'
                    }}
                  />
                </ListItemIcon>
                <ListItemText
                  primary={id}
                  primaryTypographyProps={{
                    fontSize: 13,
                    color: selectedCctv === id ? 'secondary.main' : 'text.secondary',
                    fontWeight: selectedCctv === id ? 600 : 400
                  }}
                />
                {cctvWithChanges.has(id) && (
                  <Chip
                    label="변경됨"
                    size="small"
                    sx={{
                      height: 18,
                      fontSize: '0.65rem',
                      fontWeight: 600,
                      bgcolor: alpha(theme.palette.warning.main, 0.15),
                      color: 'warning.main',
                      border: `1px solid ${alpha(theme.palette.warning.main, 0.3)}`,
                      '& .MuiChip-label': {
                        px: 0.75,
                        py: 0,
                      },
                    }}
                  />
                )}
              </ListItemButton>
            ))}
          </List>
        </Box>
      </Drawer>

      {/* Main Content */}
      <Main openLeft={leftDrawerOpen} openRight={rightDrawerOpen} sx={{ height: '100vh', marginTop: 0 }}>

        {/* Header Bar */}
        <Paper
          elevation={0}
          sx={{
            px: 2,
            py: 1,
            borderBottom: '1px solid',
            borderColor: 'divider',
            bgcolor: isDark ? alpha(theme.palette.background.paper, 0.5) : theme.palette.background.paper,
            display: 'flex',
            alignItems: 'center',
            gap: 2,
            zIndex: 5,
            flexShrink: 0
          }}
        >
          <IconButton
            size="small"
            onClick={() => {
              if (hasUnsavedChanges) {
                if (window.confirm('저장하지 않은 변경사항이 있습니다. 나가시겠습니까?')) {
                  navigate(-1);
                }
              } else {
                navigate(-1);
              }
            }}
            sx={{
              color: 'text.secondary',
              '&:hover': {
                color: 'primary.main',
                bgcolor: alpha(theme.palette.primary.main, 0.1)
              }
            }}
          >
            <ArrowBackIcon />
          </IconButton>
          <Typography variant="h6" sx={{
            fontWeight: 700,
            color: 'text.primary'
          }}>
            ROI 편집기
          </Typography>
          {selectedRoiFile && (
            <>
              <Typography variant="body2" sx={{
                color: 'text.secondary',
                ml: 'auto'
              }}>
                {selectedRoiFile}
              </Typography>
              <Button
                variant="contained"
                size="small"
                startIcon={<SaveIcon />}
                onClick={handleFinalSave}
                sx={{
                  fontSize: '0.75rem',
                  py: 0.5,
                  px: 1.5,
                  ml: 1.5,
                  background: GRADIENTS.primary,
                  boxShadow: '0 2px 8px rgba(59, 130, 246, 0.3)',
                  '&:hover': {
                    background: 'linear-gradient(135deg, #2563eb 0%, #3b82f6 100%)',
                    boxShadow: '0 4px 12px rgba(59, 130, 246, 0.4)'
                  }
                }}
              >
                최종 저장
              </Button>
            </>
          )}
        </Paper>

        {/* Helper/Expand Button (Left) - 세로 중앙 */}
        <Box sx={{ position: 'absolute', top: '50%', left: 10, transform: 'translateY(-50%)', zIndex: 10 }}>
          <IconButton
            size="small"
            onClick={() => setLeftDrawerOpen(!leftDrawerOpen)}
            className="hover-lift"
            sx={{
              bgcolor: 'background.paper',
              border: '1px solid',
              borderColor: 'divider',
              color: 'text.secondary',
              boxShadow: isDark ? SHADOWS.dark.sm : SHADOWS.light.sm,
              '&:hover': {
                bgcolor: 'background.paper',
                color: 'primary.main',
                borderColor: 'primary.main',
                boxShadow: isDark ? SHADOWS.dark.md : SHADOWS.light.md
              }
            }}
          >
            {leftDrawerOpen ? <ChevronLeftIcon /> : <ChevronRightIcon />}
          </IconButton>
        </Box>

        {/* Properties Panel Toggle Button (Right) - 세로 중앙 */}
        <Box sx={{ position: 'absolute', top: '50%', right: 10, transform: 'translateY(-50%)', zIndex: 10 }}>
          <IconButton
            size="small"
            onClick={() => setRightDrawerOpen(!rightDrawerOpen)}
            className="hover-lift"
            sx={{
              bgcolor: 'background.paper',
              border: '1px solid',
              borderColor: 'divider',
              color: 'text.secondary',
              boxShadow: isDark ? SHADOWS.dark.sm : SHADOWS.light.sm,
              '&:hover': {
                bgcolor: 'background.paper',
                color: 'info.main',
                borderColor: 'info.main',
                boxShadow: isDark ? SHADOWS.dark.md : SHADOWS.light.md
              }
            }}
          >
            {rightDrawerOpen ? <ChevronRightIcon /> : <ChevronLeftIcon />}
          </IconButton>
        </Box>

        {/* Canvas Area (Top Aligned) */}
        <Box sx={{
          flex: 1,
          display: 'flex',
          bgcolor: isDark ? '#0a0a0a' : '#f5f5f5',
          position: 'relative',
          overflow: 'hidden',
          alignItems: 'flex-start'
        }}>

          {showDualView && (
            <Box sx={{
              flex: 1,
              height: '100%',
              borderRight: '1px solid',
              borderColor: 'divider',
              display: 'flex',
              flexDirection: 'column',
              overflow: 'hidden'
            }}>
              <Paper
                elevation={0}
                sx={{
                  px: 2,
                  height: 40,
                  borderBottom: '1px solid',
                  borderColor: 'divider',
                  borderRadius: 0,
                  bgcolor: isDark ? alpha(theme.palette.background.paper, 0.5) : theme.palette.background.paper,
                  display: 'flex',
                  alignItems: 'center'
                }}
              >
                <Typography variant="caption" sx={{
                  color: 'text.secondary',
                  fontWeight: 600,
                  letterSpacing: 1
                }}>
                  REFERENCE
                </Typography>
              </Paper>
              <Box ref={referenceContainerRef} sx={{
                flex: 1,
                position: 'relative',
                bgcolor: isDark ? '#000' : '#fafafa',
                overflow: 'hidden',
                display: 'flex',
                alignItems: 'flex-start',
                justifyContent: 'center',
                pt: 2
              }}>
                {originalImageUrl ? (
                  <Box sx={{
                    width: unifiedSizes.reference.width,
                    height: unifiedSizes.reference.height,
                    display: 'flex',
                    flexDirection: 'column',
                    flexShrink: 0
                  }}>
                    <RoiCanvas
                      imageSrc={originalImageUrl}
                      rois={originalCctvDataMap.get(selectedCctv)?.rois || {}}
                      editable={false}
                      onRoiClick={(id) => { setSelectedRoiId(id); setRightDrawerOpen(true); }}
                      selectedRoiId={selectedRoiId}
                      isMobile={false}
                      fullscreen={false}
                    />
                  </Box>
                ) : (
                  <Box sx={{
                    mt: 10,
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center'
                  }}>
                    <Typography color="text.disabled">No Image</Typography>
                  </Box>
                )}
              </Box>
            </Box>
          )}

          <Box sx={{
            flex: 1,
            height: '100%',
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden'
          }}>
            <Paper
              elevation={0}
              sx={{
                px: 2,
                height: 40,
                borderBottom: '1px solid',
                borderColor: 'divider',
                borderRadius: 0,
                bgcolor: isDark ? alpha(theme.palette.primary.main, 0.05) : alpha(theme.palette.primary.main, 0.02),
                display: 'flex',
                alignItems: 'center',
                gap: 1
              }}
            >
              <Typography variant="caption" sx={{
                color: 'primary.main',
                fontWeight: 600,
                letterSpacing: 1
              }}>
                WORKSPACE
              </Typography>
              {hasUnsavedChanges && (
                <Chip
                  label="Editing"
                  size="small"
                  className="animate-pulse-glow"
                  sx={{
                    height: 20,
                    fontSize: '0.7rem',
                    bgcolor: alpha(theme.palette.warning.main, 0.2),
                    color: 'warning.main',
                    border: '1px solid',
                    borderColor: alpha(theme.palette.warning.main, 0.3)
                  }}
                />
              )}
            </Paper>
            <Box ref={workspaceContainerRef} sx={{
              flex: 1,
              position: 'relative',
              bgcolor: isDark ? '#000' : '#fafafa',
              overflow: 'hidden',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'flex-start',
              pt: 2
            }}>
              {cctvImageUrl ? (
                <>
                  <Box sx={{
                    width: unifiedSizes.workspace.width,
                    height: unifiedSizes.workspace.height,
                    display: 'flex',
                    flexDirection: 'column',
                    boxSizing: 'border-box',
                    position: 'relative',
                    flexShrink: 0
                  }}>
                    <RoiCanvas
                      ref={roiCanvasRef}
                      imageSrc={cctvImageUrl}
                      rois={editingRoiId && roiEditMode === 'update'
                        ? Object.fromEntries(Object.entries(roiData?.rois || {}).filter(([id]) => id !== editingRoiId))
                        : roiData?.rois || {}
                      }
                      editable={true}
                      onRoiClick={(id) => {
                        if (isSelectingRoiForEdit) {
                          // ROI 선택 모드: 선택한 ROI를 편집 모드로 전환
                          setSelectedRoiId(id);
                          setEditingRoiId(id);
                          setEditingOriginalRoi([...roiData.rois[id]]);
                          setRoiEditMode('update');
                          setIsSelectingRoiForEdit(false);
                        } else {
                          // 일반 모드: ROI 선택만
                          setSelectedRoiId(id);
                          setRightDrawerOpen(true);
                        }
                      }}
                      selectedRoiId={selectedRoiId}
                      editMode={roiEditMode}
                      onRoiCreate={handleCreateRoi}
                      onRoiUpdate={handleUpdateRoi}
                      onPointsChange={setCurrentDrawingPoints}
                      isMobile={false}
                      fullscreen={false}
                      isSelectingForEdit={isSelectingRoiForEdit}
                    />
                  </Box>

                  {/* Workspace Control Bar - 고정된 위치, 이미지 바로 아래 */}
                  <Paper
                    elevation={2}
                    sx={{
                      width: '100%',
                      maxWidth: 'calc(100% - 32px)',
                      mx: 2,
                      mt: 2,
                      px: 2,
                      py: 1.5,
                      bgcolor: isDark ? alpha(theme.palette.background.paper, 0.95) : 'background.paper',
                      borderRadius: 1,
                      border: '1px solid',
                      borderColor: 'divider',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      gap: 2,
                      zIndex: 10,
                      flexWrap: 'wrap',
                      flexShrink: 0
                    }}
                  >
                    {/* Left: ROI Actions */}
                    <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                      {(roiEditMode === 'create' || roiEditMode === 'update') && currentDrawingPoints.length >= 6 ? (
                        <>
                          <Button
                            variant="contained"
                            size="small"
                            onClick={() => {
                              roiCanvasRef.current?.completeRoi();
                            }}
                            sx={{
                              bgcolor: theme.palette.success.main,
                              color: '#fff',
                              '&:hover': {
                                bgcolor: theme.palette.success.dark,
                                boxShadow: `0 2px 8px ${alpha(theme.palette.success.main, 0.3)}`
                              }
                            }}
                          >
                            완료
                          </Button>
                          <Button
                            variant="outlined"
                            size="small"
                            onClick={() => {
                              roiCanvasRef.current?.cancelRoiEdit();
                              if (roiEditMode === 'update' && editingOriginalRoi && editingRoiId) {
                                // 수정 모드 취소: 원본 ROI 복원
                                const newRois = { ...roiData!.rois, [editingRoiId]: editingOriginalRoi };
                                setRoiData({ ...roiData!, rois: newRois });
                                setEditingRoiId('');
                                setEditingOriginalRoi(null);
                              }
                              setRoiEditMode(null);
                              setSelectedRoiId(''); // 선택 초기화
                              setCurrentDrawingPoints([]);
                            }}
                            sx={{
                              borderColor: alpha(theme.palette.error.main, 0.5),
                              color: 'error.main',
                              '&:hover': {
                                borderColor: 'error.main',
                                bgcolor: alpha(theme.palette.error.main, 0.1)
                              }
                            }}
                          >
                            취소
                          </Button>
                        </>
                      ) : (
                        <Button
                          variant="contained"
                          size="small"
                          startIcon={<AddIcon />}
                          onClick={() => { setRoiEditMode('create'); setSelectedRoiId(''); setCurrentDrawingPoints([]); }}
                          disabled={roiEditMode === 'create'}
                          sx={{
                            bgcolor: roiEditMode === 'create' ? theme.palette.action.disabled : theme.palette.success.main,
                            color: '#fff',
                            '&:hover': {
                              bgcolor: roiEditMode === 'create' ? theme.palette.action.disabled : theme.palette.success.dark,
                              boxShadow: roiEditMode === 'create' ? 'none' : `0 2px 8px ${alpha(theme.palette.success.main, 0.3)}`
                            }
                          }}
                        >
                          {roiEditMode === 'create' ? '점 3개 이상 클릭하세요' : '추가'}
                        </Button>
                      )}

                      <Button
                        variant="contained"
                        size="small"
                        startIcon={<EditIcon />}
                        onClick={() => {
                          if (selectedRoiId && roiData?.rois[selectedRoiId]) {
                            // 수정할 ROI 선택 완료 - 편집 모드 시작
                            setEditingRoiId(selectedRoiId);
                            setEditingOriginalRoi([...roiData.rois[selectedRoiId]]); // 원본 저장
                            setRoiEditMode('update');
                            setIsSelectingRoiForEdit(false);
                          } else {
                            // ROI 선택 모드 시작
                            setIsSelectingRoiForEdit(true);
                            setError('수정할 ROI를 클릭하세요');
                            setTimeout(() => setError(''), 3000);
                          }
                        }}
                        disabled={!roiData || Object.keys(roiData?.rois || {}).length === 0}
                        sx={{
                          bgcolor: isSelectingRoiForEdit ? theme.palette.warning.main : theme.palette.primary.main,
                          color: '#fff',
                          '&:hover': {
                            bgcolor: isSelectingRoiForEdit ? theme.palette.warning.dark : theme.palette.primary.dark,
                            boxShadow: `0 2px 8px ${alpha(isSelectingRoiForEdit ? theme.palette.warning.main : theme.palette.primary.main, 0.3)}`
                          },
                          '&.Mui-disabled': {
                            bgcolor: alpha(theme.palette.action.disabled, 0.5),
                            color: theme.palette.action.disabled
                          }
                        }}
                      >
                        {isSelectingRoiForEdit ? 'ROI 선택 중...' : '수정'}
                      </Button>

                      <Button
                        variant="contained"
                        size="small"
                        startIcon={<DeleteIcon />}
                        onClick={() => handleDeleteRoi(selectedRoiId)}
                        disabled={!selectedRoiId}
                        sx={{
                          bgcolor: theme.palette.error.main,
                          color: '#fff',
                          '&:hover': {
                            bgcolor: theme.palette.error.dark,
                            boxShadow: `0 2px 8px ${alpha(theme.palette.error.main, 0.3)}`
                          },
                          '&.Mui-disabled': {
                            bgcolor: alpha(theme.palette.action.disabled, 0.5),
                            color: theme.palette.action.disabled
                          }
                        }}
                      >
                        삭제
                      </Button>
                    </Box>

                    {/* Right: Save/Rollback */}
                    <Box sx={{ display: 'flex', gap: 1, alignItems: 'center', flexWrap: 'wrap' }}>
                      {hasUnsavedChanges && (
                        <Chip
                          label="변경사항 있음"
                          size="small"
                          color="warning"
                          sx={{ fontSize: '0.75rem' }}
                        />
                      )}

                      <Button
                        variant="contained"
                        size="small"
                        onClick={handleRollback}
                        disabled={!hasUnsavedChanges}
                        sx={{
                          bgcolor: alpha(theme.palette.warning.main, 0.15),
                          color: 'warning.main',
                          border: `1px solid ${alpha(theme.palette.warning.main, 0.3)}`,
                          '&:hover': {
                            bgcolor: alpha(theme.palette.warning.main, 0.25),
                            borderColor: theme.palette.warning.main,
                            boxShadow: `0 2px 8px ${alpha(theme.palette.warning.main, 0.2)}`
                          },
                          '&.Mui-disabled': {
                            bgcolor: alpha(theme.palette.action.disabled, 0.5),
                            color: theme.palette.action.disabled,
                            border: `1px solid ${alpha(theme.palette.action.disabled, 0.3)}`
                          }
                        }}
                      >
                        롤백
                      </Button>

                      <Button
                        variant="contained"
                        size="small"
                        startIcon={<SaveIcon />}
                        onClick={handleSave}
                        disabled={!hasUnsavedChanges}
                        sx={{
                          background: GRADIENTS.primary,
                          boxShadow: '0 2px 8px rgba(59, 130, 246, 0.3)',
                          '&:hover': {
                            background: 'linear-gradient(135deg, #2563eb 0%, #3b82f6 100%)',
                            boxShadow: '0 4px 12px rgba(59, 130, 246, 0.4)'
                          },
                          '&.Mui-disabled': {
                            opacity: 0.5
                          }
                        }}
                      >
                        저장
                      </Button>
                    </Box>
                  </Paper>
                </>
              ) : (
                <Box sx={{ mt: 10 }}><Typography color="text.disabled">CCTV를 선택하세요</Typography></Box>
              )}
            </Box>
          </Box>
        </Box>
      </Main>

      {/* Right Sidebar */}
      <Drawer
        sx={{
          width: RIGHT_DRAWER_WIDTH,
          flexShrink: 0,
          '& .MuiDrawer-paper': {
            width: RIGHT_DRAWER_WIDTH,
            bgcolor: 'background.paper',
            borderLeft: '1px solid',
            borderColor: 'divider',
            color: 'text.primary',
            height: '100%',
            top: 0
          },
        }}
        variant="persistent"
        anchor="right"
        open={rightDrawerOpen}
      >
        <Paper
          elevation={0}
          sx={{
            p: 2,
            borderBottom: '1px solid',
            borderColor: 'divider',
            bgcolor: isDark ? alpha(theme.palette.info.main, 0.05) : alpha(theme.palette.info.main, 0.03),
            borderRadius: 0
          }}
        >
          <Typography variant="button" sx={{
            fontWeight: 700,
            color: 'info.main',
            letterSpacing: 1
          }}>
            PROPERTIES
          </Typography>
        </Paper>

        <Box sx={{ display: 'flex', flexDirection: 'column', overflowY: 'auto', flex: 1 }}>
          <Box sx={{ p: 2 }}>
            {selectedRoiId ? (
              <>
                <Box sx={{ mb: 2 }}>
                  <Typography variant="caption" sx={{
                    color: 'text.secondary',
                    fontSize: '0.75rem',
                    fontWeight: 600,
                    textTransform: 'uppercase'
                  }}>
                    ID
                  </Typography>
                  <Typography variant="h6" sx={{
                    color: 'text.primary',
                    fontWeight: 700,
                    letterSpacing: '-0.01em'
                  }}>
                    {selectedRoiId}
                  </Typography>
                </Box>
              </>
            ) : (
              <Typography variant="body2" sx={{
                color: 'text.disabled',
                fontStyle: 'italic'
              }}>
                Select an ROI to view details.
              </Typography>
            )}
          </Box>
          <Divider />
          <List dense>
            {Object.keys(roiData?.rois || {}).map(id => (
              <ListItemButton
                key={id}
                selected={selectedRoiId === id}
                onClick={() => setSelectedRoiId(id)}
                className={selectedRoiId === id ? 'animate-fade-in' : ''}
                sx={{
                  borderLeft: selectedRoiId === id ? `3px solid ${theme.palette.info.main}` : '3px solid transparent',
                  transition: 'all 0.2s ease',
                  bgcolor: selectedRoiId === id ? alpha(theme.palette.info.main, 0.1) : 'transparent',
                  '&:hover': {
                    bgcolor: selectedRoiId === id
                      ? alpha(theme.palette.info.main, 0.15)
                      : alpha(theme.palette.action.hover, 0.05)
                  }
                }}
              >
                <ListItemText
                  primary={id}
                  secondary="Polygon"
                  primaryTypographyProps={{
                    color: selectedRoiId === id ? 'info.main' : 'text.primary',
                    fontWeight: selectedRoiId === id ? 600 : 400,
                    fontSize: '0.875rem'
                  }}
                  secondaryTypographyProps={{
                    color: 'text.secondary',
                    fontSize: '0.75rem'
                  }}
                />
              </ListItemButton>
            ))}
          </List>
        </Box>
      </Drawer>

      {/* Alerts */}
      {error && (
        <Alert
          severity="error"
          onClose={() => setError('')}
          className="animate-slide-up"
          sx={{
            position: 'fixed',
            bottom: 24,
            left: '50%',
            transform: 'translateX(-50%)',
            zIndex: 9999,
            boxShadow: isDark ? SHADOWS.dark.lg : SHADOWS.light.lg,
            border: '1px solid',
            borderColor: alpha(theme.palette.error.main, 0.3)
          }}
        >
          {error}
        </Alert>
      )}
      {success && (
        <Alert
          severity="success"
          onClose={() => setSuccess('')}
          className="animate-slide-up"
          sx={{
            position: 'fixed',
            bottom: 24,
            left: '50%',
            transform: 'translateX(-50%)',
            zIndex: 9999,
            boxShadow: isDark ? SHADOWS.dark.lg : SHADOWS.light.lg,
            border: '1px solid',
            borderColor: alpha(theme.palette.success.main, 0.3)
          }}
        >
          {success}
        </Alert>
      )}

      {/* ROI ID 입력 다이얼로그 */}
      <Dialog open={showRoiIdDialog} onClose={() => setShowRoiIdDialog(false)} maxWidth="xs" fullWidth>
        <DialogTitle sx={{ fontWeight: 700, color: 'primary.main' }}>
          ROI 번호 입력
        </DialogTitle>
        <DialogContent sx={{ pt: 2 }}>
          <Typography variant="body2" sx={{ mb: 2, color: 'text.secondary' }}>
            새로운 ROI의 번호를 입력하세요
          </Typography>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Typography variant="body1" sx={{ color: 'text.primary', fontWeight: 600 }}>
              ParkingLocations_
            </Typography>
            <TextField
              autoFocus
              size="small"
              type="number"
              label="번호"
              placeholder="1"
              value={newRoiId}
              onChange={(e) => setNewRoiId(e.target.value)}
              onKeyPress={(e) => {
                if (e.key === 'Enter') {
                  handleConfirmRoiId();
                }
              }}
              inputProps={{ min: 1 }}
              sx={{
                flex: 1,
                '& .MuiOutlinedInput-root': {
                  borderColor: 'primary.main',
                }
              }}
            />
          </Box>
        </DialogContent>
        <DialogActions sx={{ p: 2, gap: 1 }}>
          <Button
            variant="outlined"
            onClick={() => {
              setShowRoiIdDialog(false);
              setPendingCreatePoints(null);
              setNewRoiId('');
              setRoiEditMode(null);
              roiCanvasRef.current?.cancelRoiEdit();
              setCurrentDrawingPoints([]);
            }}
          >
            취소
          </Button>
          <Button
            variant="contained"
            onClick={handleConfirmRoiId}
            sx={{
              background: GRADIENTS.primary,
              '&:hover': {
                background: 'linear-gradient(135deg, #2563eb 0%, #3b82f6 100%)'
              }
            }}
          >
            확인
          </Button>
        </DialogActions>
      </Dialog>

      {/* 파일 저장 다이얼로그 */}
      <Dialog open={showSaveDialog} onClose={() => setShowSaveDialog(false)} maxWidth="xs" fullWidth>
        <DialogTitle sx={{ fontWeight: 700, color: 'primary.main' }}>
          ROI 파일 저장
        </DialogTitle>
        <DialogContent sx={{ pt: 2 }}>
          <Typography variant="body2" sx={{ mb: 2, color: 'text.secondary' }}>
            저장할 파일 이름을 입력하세요
          </Typography>
          <TextField
            autoFocus
            fullWidth
            size="small"
            label="파일 이름"
            placeholder="예: parking_roi_v1.json"
            value={saveFileName}
            onChange={(e) => setSaveFileName(e.target.value)}
            onKeyPress={(e) => {
              if (e.key === 'Enter') {
                handleConfirmSave();
              }
            }}
            sx={{
              '& .MuiOutlinedInput-root': {
                borderColor: 'primary.main',
              }
            }}
          />
        </DialogContent>
        <DialogActions sx={{ p: 2, gap: 1 }}>
          <Button
            variant="outlined"
            onClick={() => {
              setShowSaveDialog(false);
              setSaveFileName('');
            }}
          >
            취소
          </Button>
          <Button
            variant="contained"
            onClick={handleConfirmSave}
            sx={{
              background: GRADIENTS.primary,
              '&:hover': {
                background: 'linear-gradient(135deg, #2563eb 0%, #3b82f6 100%)'
              }
            }}
          >
            저장
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};
export default RoiWorkView;
