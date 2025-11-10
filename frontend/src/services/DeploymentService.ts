import { apiConfig } from '../config/api';
import {
  DeploymentListResponse,
  DeploymentDetailResponse,
  DeploymentStatsResponse,
  DeploymentResult,
} from '../models/Deployment';

class DeploymentService {
  private api = apiConfig;

  async getDeployments(projectId: string): Promise<DeploymentListResponse> {
    try {
      const response = await fetch(`${this.api.BASE_URL}/v0.1/parking/${projectId}/deployments`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return await response.json();
    } catch (error) {
      console.error('배포 결과 목록 조회 실패:', error);
      throw error;
    }
  }

  async getDeploymentById(projectId: string, deploymentId: number): Promise<DeploymentDetailResponse> {
    try {
      const response = await fetch(`${this.api.BASE_URL}/v0.1/parking/${projectId}/deployments/${deploymentId}`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return await response.json();
    } catch (error) {
      console.error('배포 결과 상세 조회 실패:', error);
      throw error;
    }
  }

  async getDeploymentStats(projectId: string): Promise<DeploymentStatsResponse> {
    try {
      const response = await fetch(`${this.api.BASE_URL}/v0.1/parking/${projectId}/deployments/stats`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return await response.json();
    } catch (error) {
      console.error('배포 통계 조회 실패:', error);
      throw error;
    }
  }

  async createDeployment(projectId: string, deployment: Partial<DeploymentResult>): Promise<DeploymentDetailResponse> {
    try {
      const response = await fetch(`${this.api.BASE_URL}/v0.1/parking/${projectId}/deployments`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(deployment),
      });
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return await response.json();
    } catch (error) {
      console.error('배포 결과 생성 실패:', error);
      throw error;
    }
  }

  async updateDeployment(projectId: string, deploymentId: number, deployment: Partial<DeploymentResult>): Promise<DeploymentDetailResponse> {
    try {
      const response = await fetch(`${this.api.BASE_URL}/v0.1/parking/${projectId}/deployments/${deploymentId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(deployment),
      });
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return await response.json();
    } catch (error) {
      console.error('배포 결과 수정 실패:', error);
      throw error;
    }
  }

  async deleteDeployment(projectId: string, deploymentId: number): Promise<void> {
    try {
      const response = await fetch(`${this.api.BASE_URL}/v0.1/parking/${projectId}/deployments/${deploymentId}`, {
        method: 'DELETE',
      });
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
    } catch (error) {
      console.error('배포 결과 삭제 실패:', error);
      throw error;
    }
  }
}

export default new DeploymentService();
