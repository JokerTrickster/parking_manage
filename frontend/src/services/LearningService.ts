import axios from 'axios';
import { LearningRequest, LearningResponse, LearningResultsData, LearningResultsResponse } from '../models/Learning';
import { apiConfig, API_ENDPOINTS } from '../config/api';

const axiosConfig = {
  baseURL: apiConfig.BASE_URL,
  timeout: 300000, // 5분 타임아웃
};

class LearningService {
  private api = axios.create(axiosConfig);

  async executeLearning(request: LearningRequest): Promise<LearningResponse> {
    try {
      const response = await this.api.post(API_ENDPOINTS.LEARNING(request.projectId), request);
      return response.data;
    } catch (error) {
      console.error('학습 실행 실패:', error);
      throw error;
    }
  }

  async getLearningResults(projectId: string, folderPath: string): Promise<LearningResultsResponse> {
    try {
      const url = API_ENDPOINTS.LEARNING_RESULTS(projectId, folderPath);
      console.log('학습 결과 API 호출 URL:', url);
      console.log('요청 파라미터:', { projectId, folderPath });
      
      const response = await this.api.get(url);
      console.log('학습 결과 API 응답:', response.data);
      return response.data;
    } catch (error) {
      console.error('학습 결과 조회 실패:', error);
      console.error('에러 상세:', error);
      throw error;
    }
  }

  async getCctvImages(projectId: string, folderPath: string, cctvId: string): Promise<any> {
    try {
      console.log(`CCTV 이미지 로드 시작: ${projectId}/${folderPath}/${cctvId}`);
      
      // ROI 결과 이미지와 Foreground 마스크 이미지를 각각 가져오기
      const roiResultUrl = API_ENDPOINTS.CCTV_IMAGE(projectId, folderPath, cctvId, 'roi_result');
      const fgMaskUrl = API_ENDPOINTS.CCTV_IMAGE(projectId, folderPath, cctvId, 'fgmask');
      
      console.log('ROI 결과 이미지 URL:', roiResultUrl);
      console.log('FG 마스크 이미지 URL:', fgMaskUrl);
      
      const [roiResultResponse, fgMaskResponse] = await Promise.all([
        this.api.get(roiResultUrl, { responseType: 'blob' }),
        this.api.get(fgMaskUrl, { responseType: 'blob' })
      ]);

      // Blob URL 생성
      const roiResultBlob = new Blob([roiResultResponse.data], { type: 'image/jpeg' });
      const fgMaskBlob = new Blob([fgMaskResponse.data], { type: 'image/jpeg' });

      const result = {
        data: {
          roi_result_image: URL.createObjectURL(roiResultBlob),
          fg_mask_image: URL.createObjectURL(fgMaskBlob)
        }
      };
      
      console.log('CCTV 이미지 로드 완료:', cctvId);
      return result;
    } catch (error) {
      console.error(`CCTV 이미지 조회 실패 (${cctvId}):`, error);
      throw error;
    }
  }

  async getFgMaskImage(projectId: string, folderPath: string, cctvId: string): Promise<string> {
    try {
      const response = await this.api.get(`/v0.1/parking/${projectId}/${folderPath}/${cctvId}/images/fgmask`, {
        responseType: 'blob'
      });
      
      const blob = new Blob([response.data], { type: 'image/jpeg' });
      return URL.createObjectURL(blob);
    } catch (error) {
      console.error('Foreground 마스크 이미지 조회 실패:', error);
      throw error;
    }
  }

  async getLearningHistory(projectId: string): Promise<any> {
    try {
      const url = API_ENDPOINTS.LEARNING_HISTORY(projectId);
      const response = await this.api.get(url);
      // axios는 response.data에 실제 응답 데이터가 있음
      return response.data;
    } catch (error) {
      console.error('학습 히스토리 조회 실패:', error);
      throw error;
    }
  }
}

const learningService = new LearningService();
export default learningService; 