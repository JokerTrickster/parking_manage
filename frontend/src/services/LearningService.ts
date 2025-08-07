import axios from 'axios';
import { API_ENDPOINTS, axiosConfig } from '../config/api';
import { LearningRequest, LearningResponse } from '../models/Learning';

const api = axios.create(axiosConfig);

export class LearningService {
  static async executeLearning(request: LearningRequest): Promise<LearningResponse> {
    try {
      const response = await api.post<LearningResponse>(
        API_ENDPOINTS.LEARNING(request.projectId),
        request
      );
      return response.data;
    } catch (error: any) {
      console.error('학습 실행 실패:', error);
      return {
        success: false,
        message: error.response?.data?.message || '학습 실행 중 오류가 발생했습니다.'
      };
    }
  }
} 