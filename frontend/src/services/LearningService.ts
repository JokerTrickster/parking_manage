import axios from 'axios';
import { LearningRequest, LearningResponse, LearningResultsData } from '../models/Learning';
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

  async getLearningResults(projectId: string, timestamp: string): Promise<LearningResultsData> {
    try {
      const response = await this.api.get(`/results/${projectId}/${timestamp}/parking_results.json`);
      return response.data;
    } catch (error) {
      console.error('학습 결과 조회 실패:', error);
      throw error;
    }
  }

  async getFgMaskImage(projectId: string, timestamp: string, cctvId: string): Promise<string> {
    try {
      const response = await this.api.get(`/results/${projectId}/${timestamp}/${cctvId}_fgmask.jpg`, {
        responseType: 'blob'
      });
      return URL.createObjectURL(response.data);
    } catch (error) {
      console.error('Foreground 마스크 이미지 조회 실패:', error);
      throw error;
    }
  }
}

const learningService = new LearningService();
export default learningService; 