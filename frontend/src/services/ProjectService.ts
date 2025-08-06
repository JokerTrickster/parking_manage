import axios from 'axios';
import { Project, ProjectStats } from '../models/Project';
import { API_ENDPOINTS, axiosConfig } from '../config/api';

const api = axios.create(axiosConfig);

export class ProjectService {
  static async getProjects(): Promise<{ success: boolean; data: Project[] }> {
    try {
      const response = await api.get(API_ENDPOINTS.PROJECTS);
      return response.data;
    } catch (error) {
      console.error('프로젝트 목록 조회 실패:', error);
      throw error;
    }
  }

  static async getProjectStats(projectId: string): Promise<ProjectStats> {
    try {
      const response = await api.get(`/project/${projectId}/stats`);
      return response.data;
    } catch (error) {
      console.error('프로젝트 통계 조회 실패:', error);
      throw error;
    }
  }
} 