import React, { useState, useEffect, useCallback } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Pagination,
  Chip,
  CircularProgress,
  Alert,
  Button,
  Modal,
  IconButton,
} from '@mui/material';
import {
  ArrowBack as BackIcon,
  Close as CloseIcon,
  ZoomIn as ZoomInIcon,
  Edit as EditIcon,
} from '@mui/icons-material';
import { CctvInfo } from '../models/Learning';
import LabelDataModal from '../components/LabelDataModal';
import LearningService from '../services/LearningService';
import { apiConfig } from '../config/api';

interface LearningResultsPageProps {
  projectId: string;
  folderPath: string;
  cctvList: CctvInfo[];
  timestamp: string;
  onBack: () => void;
}

interface CctvImages {
  roiResultImage: string;
  fgMaskImage: string;
}

interface ModalState {
  open: boolean;
  imageUrl: string;
  imageTitle: string;
}

const ITEMS_PER_PAGE = 4;

const LearningResultsPage: React.FC<LearningResultsPageProps> = ({
  projectId,
  folderPath,
  cctvList,
  timestamp,
  onBack,
}) => {
  const [currentPage, setCurrentPage] = useState(1);
  const [cctvImages, setCctvImages] = useState<Map<string, CctvImages>>(new Map());
  const [loadingImages, setLoadingImages] = useState<Set<string>>(new Set());
  const [loadedImages, setLoadedImages] = useState<Set<string>>(new Set()); // 이미 로드된 이미지 추적
  const [imageErrors, setImageErrors] = useState<Set<string>>(new Set()); // 이미지 로드 실패한 CCTV 추적
  const [error, setError] = useState<string | null>(null);
  const [modalState, setModalState] = useState<ModalState>({
    open: false,
    imageUrl: '',
    imageTitle: '',
  });
  const [labelModalOpen, setLabelModalOpen] = useState(false);
  const [selectedCctvId, setSelectedCctvId] = useState<string>('');

  const totalPages = Math.ceil(cctvList.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const endIndex = startIndex + ITEMS_PER_PAGE;
  const currentCctvList = cctvList.slice(startIndex, endIndex);

  const loadCctvImages = useCallback(async (cctvId: string) => {
    if (loadedImages.has(cctvId) || loadingImages.has(cctvId)) {
      return;
    }

    setLoadingImages(prev => new Set(prev).add(cctvId));
    
    try {
      // 새로운 이미지 API 사용하여 실제 이미지 데이터 가져오기
      const baseUrl = apiConfig.BASE_URL;
      const roiResultImageUrl = `${baseUrl}/v0.1/parking/${projectId}/${folderPath}/${cctvId}/images/roi_result`;
      const fgMaskImageUrl = `${baseUrl}/v0.1/parking/${projectId}/${folderPath}/${cctvId}/images/fgmask`;
      
      console.log('이미지 URL:', { roiResultImageUrl, fgMaskImageUrl });
      
      // 이미지 URL을 직접 사용 (Blob URL 생성하지 않음)
      setCctvImages(prev => new Map(prev).set(cctvId, {
        roiResultImage: roiResultImageUrl,
        fgMaskImage: fgMaskImageUrl,
      }));
      
      // 로드 완료 상태 추가
      setLoadedImages(prev => new Set(prev).add(cctvId));
      
      console.log(`CCTV ${cctvId} 이미지 로드 성공`);
    } catch (error) {
      console.error(`CCTV ${cctvId} 이미지 로드 실패:`, error);
      
      // error 타입 안전하게 처리
      const errorMessage = error instanceof Error ? error.message : String(error);
      const errorName = error instanceof Error ? error.name : 'Unknown Error';
      const errorStack = error instanceof Error ? error.stack : undefined;
      
      console.error('에러 상세:', {
        name: errorName,
        message: errorMessage,
        stack: errorStack
      });
      setError(`CCTV ${cctvId} 이미지를 불러오는데 실패했습니다: ${errorMessage}`);
      
      // 이미지 로드 실패 상태 추가
      setImageErrors(prev => new Set(prev).add(cctvId));
    } finally {
      setLoadingImages(prev => {
        const newSet = new Set(prev);
        newSet.delete(cctvId);
        return newSet;
      });
    }
  }, [projectId, folderPath, loadedImages, loadingImages]);

  useEffect(() => {
    // 현재 페이지의 CCTV 이미지들을 자동으로 로드 (이미 로드된 것은 제외)
    currentCctvList.forEach(cctv => {
      if (cctv.has_images && !loadedImages.has(cctv.cctv_id) && !imageErrors.has(cctv.cctv_id)) {
        loadCctvImages(cctv.cctv_id);
      }
    });
  }, [currentPage, loadCctvImages]); // loadedImages 의존성 제거하여 무한 루프 방지



  const handlePageChange = (event: React.ChangeEvent<unknown>, value: number) => {
    setCurrentPage(value);
    // 페이지 변경 시 에러 상태 초기화
    setError(null);
  };

  const handleImageClick = (imageUrl: string, imageTitle: string) => {
    setModalState({
      open: true,
      imageUrl,
      imageTitle,
    });
  };

  const handleCloseModal = () => {
    setModalState({
      open: false,
      imageUrl: '',
      imageTitle: '',
    });
  };

  const handleOpenLabelModal = (cctvId: string) => {
    setSelectedCctvId(cctvId);
    setLabelModalOpen(true);
  };

  const handleCloseLabelModal = () => {
    setLabelModalOpen(false);
    setSelectedCctvId('');
  };

  // CCTV에 실제로 이미지가 있는지 확인하는 함수
  const hasValidImages = (cctvId: string): boolean => {
    // 이미지 로드 실패한 경우
    if (imageErrors.has(cctvId)) {
      return false;
    }
    
    // 이미지가 로드된 경우
    if (cctvImages.has(cctvId)) {
      const images = cctvImages.get(cctvId);
      return !!(images?.roiResultImage && images?.fgMaskImage);
    }
    
    // 아직 로드되지 않은 경우
    return false;
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
          주차면 테스트로
        </Button>
        <Typography variant="h4" component="h1">
          학습 결과 상세 - {timestamp}
        </Typography>
      </Box>

      <Card>
        <CardContent>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
            <Typography variant="h6">
              CCTV 결과 목록
            </Typography>
            <Chip 
              label={`총 ${cctvList.length}개 CCTV`} 
              color="primary" 
              variant="outlined" 
            />
          </Box>

          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}

          {/* CCTV 목록 */}
          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)' }, gap: 3 }}>
            {currentCctvList.map((cctv) => (
              <Box key={cctv.cctv_id}>
                <Card variant="outlined">
                  <CardContent>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                      <Typography variant="h6" component="h3">
                        {cctv.cctv_id}
                      </Typography>
                      <Button
                        variant="outlined"
                        size="small"
                        startIcon={<EditIcon />}
                        onClick={() => handleOpenLabelModal(cctv.cctv_id)}
                      >
                        라벨 데이터
                      </Button>
                    </Box>

                    {hasValidImages(cctv.cctv_id) && (
                      <Box>
                        {loadingImages.has(cctv.cctv_id) ? (
                          <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', py: 2 }}>
                            <CircularProgress size={40} sx={{ mb: 1 }} />
                            <Typography variant="body2" color="text.secondary">
                              이미지 로딩 중...
                            </Typography>
                          </Box>
                        ) : cctvImages.has(cctv.cctv_id) ? (
                          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                            <Typography variant="subtitle2" gutterBottom>
                              CCTV 이미지
                            </Typography>
                            <Box sx={{ display: 'flex', gap: 2, justifyContent: 'space-between' }}>
                              <Box sx={{ flex: 1, position: 'relative' }}>
                                <img 
                                  src={cctvImages.get(cctv.cctv_id)?.roiResultImage} 
                                  alt={`ROI Result - ${cctv.cctv_id}`}
                                  style={{ 
                                    width: '100%', 
                                    height: 'auto', 
                                    maxHeight: '200px', 
                                    objectFit: 'contain',
                                    border: '1px solid #e0e0e0',
                                    borderRadius: '4px',
                                    cursor: 'pointer',
                                    transition: 'transform 0.2s ease-in-out',
                                  }}
                                  onMouseOver={(e) => {
                                    e.currentTarget.style.transform = 'scale(1.02)';
                                  }}
                                  onMouseOut={(e) => {
                                    e.currentTarget.style.transform = 'scale(1)';
                                  }}
                                  onClick={() => handleImageClick(
                                    cctvImages.get(cctv.cctv_id)?.roiResultImage || '',
                                    `ROI 결과 - ${cctv.cctv_id}`
                                  )}
                                  onError={(e) => {
                                    console.error(`ROI 이미지 로드 실패: ${cctv.cctv_id}`);
                                    e.currentTarget.style.display = 'none';
                                  }}
                                />
                                <Box sx={{ 
                                  position: 'absolute', 
                                  top: 8, 
                                  right: 8, 
                                  backgroundColor: 'rgba(0,0,0,0.5)', 
                                  borderRadius: '50%',
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  width: 32,
                                  height: 32,
                                }}>
                                  <ZoomInIcon sx={{ color: 'white', fontSize: 16 }} />
                                </Box>
                                <Typography variant="caption" display="block" textAlign="center" sx={{ mt: 1 }}>
                                  ROI 결과
                                </Typography>
                              </Box>
                              <Box sx={{ flex: 1, position: 'relative' }}>
                                <img 
                                  src={cctvImages.get(cctv.cctv_id)?.fgMaskImage} 
                                  alt={`Foreground Mask - ${cctv.cctv_id}`}
                                  style={{ 
                                    width: '100%', 
                                    height: 'auto', 
                                    maxHeight: '200px', 
                                    objectFit: 'contain',
                                    border: '1px solid #e0e0e0',
                                    borderRadius: '4px',
                                    cursor: 'pointer',
                                    transition: 'transform 0.2s ease-in-out',
                                  }}
                                  onMouseOver={(e) => {
                                    e.currentTarget.style.transform = 'scale(1.02)';
                                  }}
                                  onMouseOut={(e) => {
                                    e.currentTarget.style.transform = 'scale(1)';
                                  }}
                                  onClick={() => handleImageClick(
                                    cctvImages.get(cctv.cctv_id)?.fgMaskImage || '',
                                    `Foreground 마스크 - ${cctv.cctv_id}`
                                  )}
                                  onError={(e) => {
                                    console.error(`FGMask 이미지 로드 실패: ${cctv.cctv_id}`);
                                    e.currentTarget.style.display = 'none';
                                  }}
                                />
                                <Box sx={{ 
                                  position: 'absolute', 
                                  top: 8, 
                                  right: 8, 
                                  backgroundColor: 'rgba(0,0,0,0.5)', 
                                  borderRadius: '50%',
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  width: 32,
                                  height: 32,
                                }}>
                                  <ZoomInIcon sx={{ color: 'white', fontSize: 16 }} />
                                </Box>
                                <Typography variant="caption" display="block" textAlign="center" sx={{ mt: 1 }}>
                                  Foreground 마스크
                                </Typography>
                              </Box>
                            </Box>
                          </Box>
                        ) : (
                          <Button 
                            variant="outlined" 
                            onClick={() => loadCctvImages(cctv.cctv_id)}
                            fullWidth
                            sx={{ py: 1 }}
                          >
                            이미지 로드
                          </Button>
                        )}
                      </Box>
                    )}

                    {!hasValidImages(cctv.cctv_id) && !loadingImages.has(cctv.cctv_id) && (
                      <Typography variant="body2" color="text.secondary">
                        이 CCTV에 대한 이미지를 불러올 수 없습니다.
                      </Typography>
                    )}
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
        </CardContent>
      </Card>

      {/* 이미지 모달 */}
      <Modal
        open={modalState.open}
        onClose={handleCloseModal}
        aria-labelledby="image-modal-title"
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          p: 2,
        }}
      >
        <Box sx={{
          position: 'relative',
          bgcolor: 'background.paper',
          borderRadius: 2,
          boxShadow: 24,
          maxWidth: '90vw',
          maxHeight: '90vh',
          overflow: 'hidden',
        }}>
          {/* 모달 헤더 */}
          <Box sx={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            p: 2,
            borderBottom: '1px solid #e0e0e0',
            bgcolor: 'background.paper',
          }}>
            <Typography variant="h6" component="h2">
              {modalState.imageTitle}
            </Typography>
            <IconButton
              onClick={handleCloseModal}
              size="large"
              sx={{ color: 'text.secondary' }}
            >
              <CloseIcon />
            </IconButton>
          </Box>

          {/* 이미지 컨테이너 */}
          <Box sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            p: 2,
            maxHeight: 'calc(90vh - 80px)',
            overflow: 'auto',
          }}>
            <img
              src={modalState.imageUrl}
              alt={modalState.imageTitle}
              style={{
                maxWidth: '100%',
                maxHeight: '100%',
                objectFit: 'contain',
                borderRadius: '4px',
              }}
            />
          </Box>
        </Box>
      </Modal>

      {/* 라벨 데이터 모달 */}
      <LabelDataModal
        open={labelModalOpen}
        onClose={handleCloseLabelModal}
        projectId={projectId}
        folderPath={folderPath}
        cctvId={selectedCctvId}
        roiResultImageUrl={cctvImages.get(selectedCctvId)?.roiResultImage || ''}
      />
    </Box>
  );
};

export default LearningResultsPage;
