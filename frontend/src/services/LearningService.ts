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
      const response = await this.api.get(API_ENDPOINTS.LEARNING_RESULTS(projectId, folderPath));
      return response.data;
    } catch (error) {
      console.error('학습 결과 조회 실패:', error);
      throw error;
    }
  }

  async getCctvImages(projectId: string, folderPath: string, cctvId: string): Promise<any> {
    try {
      // ROI 결과 이미지와 Foreground 마스크 이미지를 각각 가져오기
      const roiResultResponse = await this.api.get(`/v0.1/parking/${projectId}/${folderPath}/${cctvId}/images/roi_result`, {
        responseType: 'blob'
      });
      
      const fgMaskResponse = await this.api.get(`/v0.1/parking/${projectId}/${folderPath}/${cctvId}/images/fgmask`, {
        responseType: 'blob'
      });

      // Blob URL 생성
      const roiResultBlob = new Blob([roiResultResponse.data], { type: 'image/jpeg' });
      const fgMaskBlob = new Blob([fgMaskResponse.data], { type: 'image/jpeg' });

      return {
        data: {
          roi_result_image: URL.createObjectURL(roiResultBlob),
          fg_mask_image: URL.createObjectURL(fgMaskBlob)
        }
      };
    } catch (error) {
      console.error('CCTV 이미지 조회 실패:', error);
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
}

const learningService = new LearningService();
export default learningService; 