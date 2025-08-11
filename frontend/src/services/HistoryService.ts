import { apiConfig } from '../config/api';
import { HistoryResponse } from '../models/History';

class HistoryService {
  private api = apiConfig;

  async getHistory(projectId: string): Promise<HistoryResponse> {
    try {
      const response = await fetch(`${this.api.BASE_URL}/v0.1/parking/${projectId}/history`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return await response.json();
    } catch (error) {
      console.error('히스토리 조회 실패:', error);
      throw error;
    }
  }
}

export default new HistoryService();
