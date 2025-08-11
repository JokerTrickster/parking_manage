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
} from '@mui/material';
import {
  ArrowBack as BackIcon,
} from '@mui/icons-material';
import { CctvInfo } from '../models/Learning';
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
  const [error, setError] = useState<string | null>(null);

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
      
      // 이미지 로딩 테스트를 위해 fetch로 실제 요청 보내기
      const [roiResponse, fgMaskResponse] = await Promise.all([
        fetch(roiResultImageUrl, {
          method: 'GET',
          mode: 'cors',
          headers: {
            'Accept': 'image/*',
          },
        }),
        fetch(fgMaskImageUrl, {
          method: 'GET',
          mode: 'cors',
          headers: {
            'Accept': 'image/*',
          },
        })
      ]);
      
      console.log('응답 상태:', { 
        roiStatus: roiResponse.status, 
        roiOk: roiResponse.ok,
        fgMaskStatus: fgMaskResponse.status, 
        fgMaskOk: fgMaskResponse.ok 
      });
      
      if (!roiResponse.ok || !fgMaskResponse.ok) {
        throw new Error(`이미지 로드 실패: ROI=${roiResponse.status} ${roiResponse.statusText}, FGMask=${fgMaskResponse.status} ${fgMaskResponse.statusText}`);
      }
      
      // 이미지 URL을 Blob URL로 변환하여 캐싱
      const roiBlob = await roiResponse.blob();
      const fgMaskBlob = await fgMaskResponse.blob();
      
      console.log('Blob 크기:', { roiSize: roiBlob.size, fgMaskSize: fgMaskBlob.size });
      
      const roiBlobUrl = URL.createObjectURL(roiBlob);
      const fgMaskBlobUrl = URL.createObjectURL(fgMaskBlob);
      
      setCctvImages(prev => new Map(prev).set(cctvId, {
        roiResultImage: roiBlobUrl,
        fgMaskImage: fgMaskBlobUrl,
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
      if (cctv.has_images && !loadedImages.has(cctv.cctv_id)) {
        loadCctvImages(cctv.cctv_id);
      }
    });
  }, [currentPage, loadCctvImages, loadedImages]); // loadedImages 의존성 추가

  // 컴포넌트 언마운트 시 Blob URL 정리
  useEffect(() => {
    return () => {
      cctvImages.forEach((images) => {
        if (images.roiResultImage.startsWith('blob:')) {
          URL.revokeObjectURL(images.roiResultImage);
        }
        if (images.fgMaskImage.startsWith('blob:')) {
          URL.revokeObjectURL(images.fgMaskImage);
        }
      });
    };
  }, [cctvImages]);

  const handlePageChange = (event: React.ChangeEvent<unknown>, value: number) => {
    setCurrentPage(value);
    // 페이지 변경 시 에러 상태 초기화
    setError(null);
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
                      <Chip 
                        label={cctv.has_images ? "이미지 있음" : "이미지 없음"}
                        color={cctv.has_images ? "success" : "default"}
                        size="small"
                      />
                    </Box>

                    {cctv.has_images && (
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
                            <Box>
                              <Typography variant="subtitle2" gutterBottom>
                                ROI 결과 이미지
                              </Typography>
                              <img 
                                src={cctvImages.get(cctv.cctv_id)?.roiResultImage} 
                                alt={`ROI Result - ${cctv.cctv_id}`}
                                style={{ 
                                  width: '100%', 
                                  height: 'auto', 
                                  maxHeight: '200px', 
                                  objectFit: 'contain',
                                  border: '1px solid #e0e0e0',
                                  borderRadius: '4px'
                                }}
                                onError={(e) => {
                                  console.error(`ROI 이미지 로드 실패: ${cctv.cctv_id}`);
                                  e.currentTarget.style.display = 'none';
                                }}
                              />
                            </Box>
                            <Box>
                              <Typography variant="subtitle2" gutterBottom>
                                Foreground 마스크 이미지
                              </Typography>
                              <img 
                                src={cctvImages.get(cctv.cctv_id)?.fgMaskImage} 
                                alt={`Foreground Mask - ${cctv.cctv_id}`}
                                style={{ 
                                  width: '100%', 
                                  height: 'auto', 
                                  maxHeight: '200px', 
                                  objectFit: 'contain',
                                  border: '1px solid #e0e0e0',
                                  borderRadius: '4px'
                                }}
                                onError={(e) => {
                                  console.error(`FGMask 이미지 로드 실패: ${cctv.cctv_id}`);
                                  e.currentTarget.style.display = 'none';
                                }}
                              />
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
        </CardContent>
      </Card>
    </Box>
  );
};

export default LearningResultsPage;
