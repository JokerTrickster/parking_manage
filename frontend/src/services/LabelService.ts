import { apiConfig } from '../config/api';
import { LabelResponse, SaveLabelRequest } from '../models/Label';

class LabelService {
  private api = apiConfig;

  async getLabels(projectId: string, folderPath: string): Promise<LabelResponse> {
    try {
      const response = await fetch(`${this.api.BASE_URL}/v0.1/parking/${projectId}/labels/${folderPath}`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return await response.json();
    } catch (error) {
      console.error('라벨 데이터 조회 실패:', error);
      throw error;
    }
  }

  async saveLabels(request: SaveLabelRequest): Promise<LabelResponse> {
    try {
      const response = await fetch(`${this.api.BASE_URL}/v0.1/parking/${request.projectId}/labels/${request.folderPath}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(request.imageLabels),
      });
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return await response.json();
    } catch (error) {
      console.error('라벨 데이터 저장 실패:', error);
      throw error;
    }
  }
}

export default new LabelService();
