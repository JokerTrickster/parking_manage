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
      const response = await this.api.get(`/v0.1/parking/${projectId}/${folderPath}/${cctvId}/images`);
      return response.data;
    } catch (error) {
      console.error('CCTV 이미지 조회 실패:', error);
      throw error;
    }
  }

  async getFgMaskImage(projectId: string, folderPath: string, cctvId: string): Promise<string> {
    try {
      const response = await this.api.get(`/v0.1/parking/${projectId}/${folderPath}/${cctvId}/images`);
      return response.data.data.fg_mask_image;
    } catch (error) {
      console.error('Foreground 마스크 이미지 조회 실패:', error);
      throw error;
    }
  }
}

const learningService = new LearningService();
export default learningService; 