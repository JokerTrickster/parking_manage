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
} from '@mui/material';
import {
  NavigateBefore as PrevIcon,
  NavigateNext as NextIcon,
} from '@mui/icons-material';
import { CctvInfo } from '../models/Learning';
import LearningService from '../services/LearningService';

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
      const response = await LearningService.getCctvImages(projectId, folderPath, cctvId);
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

  useEffect(() => {
    // 현재 페이지의 CCTV 이미지들을 로드
    currentCctvList.forEach(cctv => {
      if (cctv.has_images) {
        loadCctvImages(cctv.cctv_id);
      }
    });
  }, [currentPage, currentCctvList]);

  const handlePageChange = (event: React.ChangeEvent<unknown>, value: number) => {
    setCurrentPage(value);
  };

  return (
    <Card sx={{ mt: 3 }}>
      <CardContent>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Typography variant="h6">
            학습 결과 상세 - {timestamp}
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
        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', md: 'repeat(2, 1fr)' }, gap: 3 }}>
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
                        <Box sx={{ display: 'flex', justifyContent: 'center', py: 2 }}>
                          <CircularProgress size={40} />
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
                              style={{ width: '100%', height: 'auto', maxHeight: '200px', objectFit: 'contain' }}
                            />
                          </Box>
                          <Box>
                            <Typography variant="subtitle2" gutterBottom>
                              Foreground 마스크 이미지
                            </Typography>
                            <img 
                              src={cctvImages.get(cctv.cctv_id)?.fgMaskImage} 
                              alt={`Foreground Mask - ${cctv.cctv_id}`}
                              style={{ width: '100%', height: 'auto', maxHeight: '200px', objectFit: 'contain' }}
                            />
                          </Box>
                        </Box>
                      ) : (
                        <Button 
                          variant="outlined" 
                          onClick={() => loadCctvImages(cctv.cctv_id)}
                          fullWidth
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
  );
};

export default LearningResultsView;
