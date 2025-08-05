import axios from 'axios';
import { FileUploadResponse, FileType } from '../models/FileUpload';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8080/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
});

export class FileUploadService {
  static async uploadFile(
    file: File,
    projectId: string,
    fileType: FileType
  ): Promise<FileUploadResponse> {
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('project_id', projectId);
      formData.append('file_type', fileType);

      const response = await api.post('/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data;
    } catch (error) {
      console.error('파일 업로드 실패:', error);
      throw error;
    }
  }

  static async uploadFileWithProgress(
    file: File,
    projectId: string,
    fileType: FileType,
    onProgress?: (progress: number) => void
  ): Promise<FileUploadResponse> {
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('project_id', projectId);
      formData.append('file_type', fileType);

      const response = await api.post('/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
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
} 