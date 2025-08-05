import axios from 'axios';
import { Project, ProjectStats } from '../models/Project';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8080/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
});

export class ProjectService {
  static async getProjects(): Promise<{ success: boolean; data: Project[] }> {
    try {
      const response = await api.get('/projects');
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