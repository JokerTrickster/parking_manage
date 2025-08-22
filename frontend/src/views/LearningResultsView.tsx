import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Grid,
  Pagination,
  Chip,
  CircularProgress,
  Alert,
  Button,
  Modal,
  IconButton,
} from '@mui/material';
import {
  NavigateBefore as PrevIcon,
  NavigateNext as NextIcon,
  Close as CloseIcon,
  ZoomIn as ZoomInIcon,
} from '@mui/icons-material';
import { CctvInfo } from '../models/Learning';
import LearningService from '../services/LearningService';

// CCTV ID에서 _Current 제거하는 함수
const removeCurrentFromCctvId = (cctvId: string): string => {
  if (!cctvId) return cctvId;
  
  // 파일 확장자 분리
  const lastDotIndex = cctvId.lastIndexOf('.');
  if (lastDotIndex === -1) {
    // 확장자가 없는 경우
    return cctvId.replace(/_Current$/, '');
  }
  
  const nameWithoutExt = cctvId.substring(0, lastDotIndex);
  const extension = cctvId.substring(lastDotIndex);
  
  // _Current 제거 후 확장자 다시 붙이기
  const cleanedName = nameWithoutExt.replace(/_Current$/, '');
  return cleanedName + extension;
};

interface LearningResultsViewProps {
  projectId: string;
  folderPath: string;
  cctvList: CctvInfo[];
  timestamp: string;
}

interface CctvImages {
  roiResultImage: string;
  fgMaskImage: string;
}

interface ImageModalData {
  src: string;
  alt: string;
  title: string;
}

const ITEMS_PER_PAGE = 4;

const LearningResultsView: React.FC<LearningResultsViewProps> = ({
  projectId,
  folderPath,
  cctvList,
  timestamp,
}) => {
  const [currentPage, setCurrentPage] = useState(1);
  const [cctvImages, setCctvImages] = useState<Map<string, CctvImages>>(new Map());
  const [loadingImages, setLoadingImages] = useState<Set<string>>(new Set());
  const [error, setError] = useState<string | null>(null);
  const [modalImage, setModalImage] = useState<ImageModalData | null>(null);

  const totalPages = Math.ceil(cctvList.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const endIndex = startIndex + ITEMS_PER_PAGE;
  const currentCctvList = cctvList.slice(startIndex, endIndex);

  const loadCctvImages = async (cctvId: string) => {
    if (cctvImages.has(cctvId) || loadingImages.has(cctvId)) {
      return;
    }

    setLoadingImages(prev => new Set(prev).add(cctvId));
    
    try {
      // CCTV ID에서 _Current 제거
      const cleanedCctvId = removeCurrentFromCctvId(cctvId);
      
      console.log(`CCTV 이미지 경로: ${projectId}/${folderPath}/${cleanedCctvId}`);
      
      const response = await LearningService.getCctvImages(projectId, folderPath, cleanedCctvId);
      setCctvImages(prev => new Map(prev).set(cctvId, {
        roiResultImage: response.data.roi_result_image,
        fgMaskImage: response.data.fg_mask_image,
      }));
    } catch (error) {
      console.error(`CCTV ${cctvId} 이미지 로드 실패:`, error);
      setError(`CCTV ${cctvId} 이미지를 불러오는데 실패했습니다.`);
    } finally {
      setLoadingImages(prev => {
        const newSet = new Set(prev);
        newSet.delete(cctvId);
        return newSet;
      });
    }
  };

  // folderPath나 cctvList가 변경될 때마다 이미지 캐시 초기화
  useEffect(() => {
    // 새로운 히스토리 선택 시 이미지 캐시 초기화
    setCctvImages(new Map());
    setLoadingImages(new Set());
    setCurrentPage(1); // 페이지도 1로 초기화
  }, [folderPath, cctvList]);

  useEffect(() => {
    // 현재 페이지의 CCTV 이미지들을 자동으로 로드
    currentCctvList.forEach(cctv => {
      if (cctv.has_images) {
        loadCctvImages(cctv.cctv_id);
      }
    });
  }, [currentPage, currentCctvList, folderPath]); // folderPath 추가로 히스토리 변경 시 재로드

  const handlePageChange = (event: React.ChangeEvent<unknown>, value: number) => {
    setCurrentPage(value);
  };

  const handleImageClick = (src: string, alt: string, title: string) => {
    setModalImage({ src, alt, title });
  };

  const handleCloseModal = () => {
    setModalImage(null);
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="subtitle1">
          {timestamp}
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

        {/* CCTV 목록 - 한 페이지당 4개, 2x2 그리드 */}
        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: 'repeat(2, 1fr)' }, gap: 3 }}>
          {currentCctvList.map((cctv) => (
            <Box key={cctv.cctv_id}>
              <Card variant="outlined">
                <CardContent>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                    <Typography variant="h6" component="h3">
                      {removeCurrentFromCctvId(cctv.cctv_id)}
                    </Typography>
                    <Chip 
                      label={cctv.has_images ? "이미지 있음" : "이미지 없음"}
                      color={cctv.has_images ? "success" : "default"}
                      size="small"
                    />
                  </Box>

                  {cctv.has_images && (
                    <Box>
                      {loadingImages.has(cctv.cctv_id) ? (
                        <Box sx={{ display: 'flex', justifyContent: 'center', py: 2 }}>
                          <CircularProgress size={40} />
                        </Box>
                      ) : cctvImages.has(cctv.cctv_id) ? (
                        <Box sx={{ display: 'flex', gap: 1 }}>
                          {/* ROI 결과 이미지 - 왼쪽 */}
                          <Box sx={{ flex: 1 }}>
                            <Typography variant="subtitle2" gutterBottom sx={{ fontSize: '0.75rem' }}>
                              ROI 결과
                            </Typography>
                            <Box sx={{ position: 'relative', cursor: 'pointer' }}>
                              <img 
                                src={cctvImages.get(cctv.cctv_id)?.roiResultImage} 
                                alt={`ROI Result - ${cctv.cctv_id}`}
                                style={{ 
                                  width: '100%', 
                                  height: 'auto', 
                                  maxHeight: '150px', 
                                  objectFit: 'contain',
                                  border: '1px solid #e0e0e0',
                                  borderRadius: '4px',
                                  transition: 'opacity 0.2s'
                                }}
                                onError={(e) => {
                                  console.error(`ROI 이미지 로드 실패: ${cctv.cctv_id}`);
                                  e.currentTarget.style.display = 'none';
                                }}
                                onClick={() => handleImageClick(
                                  cctvImages.get(cctv.cctv_id)?.roiResultImage || '',
                                  `ROI Result - ${cctv.cctv_id}`,
                                  `${removeCurrentFromCctvId(cctv.cctv_id)} - ROI 결과`
                                )}
                                onMouseEnter={(e) => e.currentTarget.style.opacity = '0.8'}
                                onMouseLeave={(e) => e.currentTarget.style.opacity = '1'}
                              />
                              <ZoomInIcon 
                                sx={{ 
                                  position: 'absolute', 
                                  top: 4, 
                                  right: 4, 
                                  color: 'white', 
                                  backgroundColor: 'rgba(0,0,0,0.5)', 
                                  borderRadius: '50%', 
                                  padding: '2px',
                                  fontSize: '16px'
                                }} 
                              />
                            </Box>
                          </Box>
                          {/* Foreground 마스크 이미지 - 오른쪽 */}
                          <Box sx={{ flex: 1 }}>
                            <Typography variant="subtitle2" gutterBottom sx={{ fontSize: '0.75rem' }}>
                              Foreground 마스크
                            </Typography>
                            <Box sx={{ position: 'relative', cursor: 'pointer' }}>
                              <img 
                                src={cctvImages.get(cctv.cctv_id)?.fgMaskImage} 
                                alt={`Foreground Mask - ${cctv.cctv_id}`}
                                style={{ 
                                  width: '100%', 
                                  height: 'auto', 
                                  maxHeight: '150px', 
                                  objectFit: 'contain',
                                  border: '1px solid #e0e0e0',
                                  borderRadius: '4px',
                                  transition: 'opacity 0.2s'
                                }}
                                onError={(e) => {
                                  console.error(`Foreground 마스크 이미지 로드 실패: ${cctv.cctv_id}`);
                                  e.currentTarget.style.display = 'none';
                                }}
                                onClick={() => handleImageClick(
                                  cctvImages.get(cctv.cctv_id)?.fgMaskImage || '',
                                  `Foreground Mask - ${cctv.cctv_id}`,
                                  `${removeCurrentFromCctvId(cctv.cctv_id)} - Foreground 마스크`
                                )}
                                onMouseEnter={(e) => e.currentTarget.style.opacity = '0.8'}
                                onMouseLeave={(e) => e.currentTarget.style.opacity = '1'}
                              />
                              <ZoomInIcon 
                                sx={{ 
                                  position: 'absolute', 
                                  top: 4, 
                                  right: 4, 
                                  color: 'white', 
                                  backgroundColor: 'rgba(0,0,0,0.5)', 
                                  borderRadius: '50%', 
                                  padding: '2px',
                                  fontSize: '16px'
                                }} 
                              />
                            </Box>
                          </Box>
                        </Box>
                      ) : (
                        <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center', py: 2 }}>
                          이미지를 로드하는 중...
                        </Typography>
                      )}
                    </Box>
                  )}

                  {!cctv.has_images && (
                    <Typography variant="body2" color="text.secondary">
                      이 CCTV에 대한 이미지가 없습니다.
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

        {/* 이미지 확대 Modal */}
        <Modal
          open={!!modalImage}
          onClose={handleCloseModal}
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Box
            sx={{
              position: 'relative',
              maxWidth: '90vw',
              maxHeight: '90vh',
              bgcolor: 'background.paper',
              boxShadow: 24,
              borderRadius: 2,
              outline: 'none',
            }}
          >
            {modalImage && (
              <>
                <Box sx={{ p: 2, borderBottom: '1px solid #e0e0e0' }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Typography variant="h6" component="h2">
                      {modalImage.title}
                    </Typography>
                    <IconButton onClick={handleCloseModal} size="small">
                      <CloseIcon />
                    </IconButton>
                  </Box>
                </Box>
                <Box sx={{ p: 2, display: 'flex', justifyContent: 'center' }}>
                  <img
                    src={modalImage.src}
                    alt={modalImage.alt}
                    style={{
                      maxWidth: '100%',
                      maxHeight: '70vh',
                      objectFit: 'contain',
                    }}
                  />
                </Box>
              </>
            )}
          </Box>
        </Modal>
    </Box>
  );
};

export default LearningResultsView;
