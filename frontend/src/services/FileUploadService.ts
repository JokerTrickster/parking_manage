import axios from 'axios';
import { FileUploadResponse } from '../models/FileUpload';
import { apiConfig, API_ENDPOINTS } from '../config/api';

const axiosConfig = {
  baseURL: apiConfig.BASE_URL,
  timeout: 300000, // 5분 타임아웃
};

const api = axios.create(axiosConfig);

export interface FolderInfo {
  name: string;
  path: string;
  fileCount: number;
}

export class FileUploadService {
  // 기존 폴더 조회
  static async getExistingFolders(projectId: string, fileType: 'learning' | 'test' | 'roi'): Promise<FolderInfo[]> {
    try {
      let endpoint: string;
      switch (fileType) {
        case 'learning':
          endpoint = API_ENDPOINTS.GET_LEARNING_FOLDERS(projectId);
          break;
        case 'test':
          endpoint = API_ENDPOINTS.GET_TEST_FOLDERS(projectId);
          break;
        case 'roi':
          endpoint = API_ENDPOINTS.GET_ROI_FOLDERS(projectId);
          break;
        default:
          throw new Error('지원하지 않는 파일 타입입니다.');
      }
      
      const response = await api.get(endpoint);
      return response.data.folders || [];
    } catch (error) {
      console.error('폴더 조회 실패:', error);
      return [];
    }
  }

  // 파일 업로드 (ROI 파일용)
  static async uploadFile(file: File, projectId: string, fileType: 'roi'): Promise<FileUploadResponse> {
    try {
      const formData = new FormData();
      formData.append('files', file);
      
      const endpoint = API_ENDPOINTS.UPLOAD_ROI(projectId);
      const response = await api.post(endpoint, formData);
      return response.data;
    } catch (error) {
      console.error('파일 업로드 실패:', error);
      throw error;
    }
  }

  // 파일 업로드 (진행률 포함)
  static async uploadFileWithProgress(
    file: File, 
    projectId: string, 
    fileType: 'roi',
    onProgress?: (progress: number) => void
  ): Promise<FileUploadResponse> {
    try {
      const formData = new FormData();
      formData.append('files', file);
      
      const endpoint = API_ENDPOINTS.UPLOAD_ROI(projectId);
      const response = await api.post(endpoint, formData, {
        onUploadProgress: (progressEvent) => {
          if (progressEvent.total && onProgress) {
            const progress = Math.round((progressEvent.loaded * 100) / progressEvent.total);
            onProgress(progress);
          }
        },
      });
      return response.data;
    } catch (error) {
      console.error('파일 업로드 실패:', error);
      throw error;
    }
  }

  // 폴더 업로드 (학습/테스트 이미지용)
  static async uploadFolder(
    files: FileList | File[], 
    projectId: string, 
    fileType: 'learning' | 'test'
  ): Promise<FileUploadResponse> {
    try {
      const formData = new FormData();
      
      // 모든 파일을 FormData에 추가
      if (files instanceof FileList) {
        for (let i = 0; i < files.length; i++) {
          formData.append('files', files[i]);
        }
      } else {
        for (const file of files) {
          formData.append('files', file);
        }
      }
      
      const endpoint = API_ENDPOINTS.UPLOAD_LEARNING(projectId);
      const response = await api.post(endpoint, formData);
      return response.data;
    } catch (error) {
      console.error('폴더 업로드 실패:', error);
      throw error;
    }
  }

  // 파일/폴더 삭제
  static async deleteFileOrFolder(
    projectId: string, 
    fileType: 'learning' | 'test' | 'roi', 
    folderName: string
  ): Promise<{ success: boolean; message: string }> {
    try {
      const endpoint = API_ENDPOINTS.DELETE_FILE_OR_FOLDER(projectId, fileType, folderName);
      const response = await api.delete(endpoint);
      return response.data;
    } catch (error) {
      console.error('파일/폴더 삭제 실패:', error);
      throw error;
    }
  }
} 