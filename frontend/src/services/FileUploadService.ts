import axios from 'axios';
import { FileUploadResponse, FileType } from '../models/FileUpload';
import { apiConfig, API_ENDPOINTS, axiosConfig } from '../config/api';

const api = axios.create(axiosConfig);

export interface FolderInfo {
  name: string;
  path: string;
  fileCount: number;
}

export class FileUploadService {
  static async getExistingFolders(
    projectId: string,
    fileType: FileType
  ): Promise<FolderInfo[]> {
    // 임시로 하드코딩된 데이터 반환
    // 실제로는 백엔드 API에서 가져와야 함
    if (projectId === 'banpo' && fileType === 'learning') {
      return [
        {
          name: 'P1_B2_1_1',
          path: 'shared/banpo/uploads/learningImages/P1_B2_1_1',
          fileCount: 25
        },
        {
          name: 'P1_B2_1_2',
          path: 'shared/banpo/uploads/learningImages/P1_B2_1_2',
          fileCount: 30
        },
        {
          name: 'P1_B2_1_3',
          path: 'shared/banpo/uploads/learningImages/P1_B2_1_3',
          fileCount: 199
        },
        {
          name: 'P1_B2_1_4',
          path: 'shared/banpo/uploads/learningImages/P1_B2_1_4',
          fileCount: 56
        },
        {
          name: 'P1_B2_1_5',
          path: 'shared/banpo/uploads/learningImages/P1_B2_1_5',
          fileCount: 29
        },
        {
          name: 'P1_B2_1_6',
          path: 'shared/banpo/uploads/learningImages/P1_B2_1_6',
          fileCount: 42
        }
      ];
    } else if (projectId === 'banpo' && fileType === 'test') {
      return [
        {
          name: 'test_folder_1',
          path: 'shared/banpo/uploads/testImages/test_folder_1',
          fileCount: 15
        },
        {
          name: 'test_folder_2',
          path: 'shared/banpo/uploads/testImages/test_folder_2',
          fileCount: 20
        }
      ];
    }
    
    return [];
  }

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

      // fileType에 따라 올바른 API 엔드포인트 선택
      let endpoint: string;
      if (fileType === 'learning') {
        endpoint = API_ENDPOINTS.UPLOAD_LEARNING(projectId);
      } else if (fileType === 'test') {
        endpoint = API_ENDPOINTS.UPLOAD_TEST(projectId);
      } else {
        throw new Error('지원하지 않는 파일 타입입니다.');
      }

      const response = await api.post(endpoint, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data;
    } catch (error) {
      console.error('파일 업로드 실패:', error);
      return {
        success: false,
        message: '파일 업로드 중 오류가 발생했습니다.'
      };
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
      return {
        success: false,
        message: '파일 업로드 중 오류가 발생했습니다.'
      };
    }
  }

  static async uploadFolder(
    files: File[],
    projectId: string,
    fileType: FileType,
    onProgress?: (progress: number) => void
  ): Promise<FileUploadResponse> {
    try {
      const formData = new FormData();
      
      // 모든 파일을 FormData에 추가 (폴더 구조 정보 포함)
      files.forEach((file, index) => {
        // 파일의 상대 경로를 포함하여 추가
        // File 객체의 webkitRelativePath 속성을 사용하여 폴더 구조 정보 유지
        const relativePath = (file as any).webkitRelativePath || file.name;
        formData.append('files', file, relativePath);
      });
      
      formData.append('project_id', projectId);
      formData.append('file_type', fileType);

      // fileType에 따라 올바른 API 엔드포인트 선택
      let endpoint: string;
      if (fileType === 'learning') {
        endpoint = API_ENDPOINTS.UPLOAD_LEARNING(projectId);
      } else if (fileType === 'test') {
        endpoint = API_ENDPOINTS.UPLOAD_TEST(projectId);
      } else {
        throw new Error('지원하지 않는 파일 타입입니다.');
      }

      const response = await api.post(endpoint, formData, {
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
      console.error('폴더 업로드 실패:', error);
      return {
        success: false,
        message: '폴더 업로드 중 오류가 발생했습니다.'
      };
    }
  }
} 