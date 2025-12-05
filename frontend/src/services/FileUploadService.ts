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
  // 기존 폴더 조회 (FileStorage API 사용)
  static async getExistingFolders(projectId: string, fileType: 'learning' | 'test' | 'roi'): Promise<FolderInfo[]> {
    try {
      const endpoint = API_ENDPOINTS.FILE_STORAGE.LIST_FOLDERS(projectId, fileType);
      const response = await api.get(endpoint);

      console.log('[FileUploadService] Folders response:', response.data);

      if (response.data.success && response.data.data && response.data.data.folders) {
        // NestedFolderNode[] to FolderInfo[] conversion
        return response.data.data.folders.map((folder: any) => ({
          name: folder.name,
          path: folder.path,
          fileCount: folder.file_count || 0
        }));
      }

      return [];
    } catch (error) {
      console.error('폴더 조회 실패:', error);
      return [];
    }
  }

  // 폴더 목록 조회 (간단한 문자열 배열 반환)
  static async getFolders(projectId: string, fileType: 'learning' | 'test' | 'roi'): Promise<string[]> {
    try {
      const folders = await this.getExistingFolders(projectId, fileType);
      return folders.map(folder => folder.name);
    } catch (error) {
      console.error('폴더 목록 조회 실패:', error);
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

      // 선택된 파일 수 로그
      const fileCount = files instanceof FileList ? files.length : files.length;
      console.log(`[FileUploadService] 총 선택된 파일 수: ${fileCount}`);

      // 모든 파일을 FormData에 추가
      let addedCount = 0;
      if (files instanceof FileList) {
        for (let i = 0; i < files.length; i++) {
          formData.append('files', files[i]);
          addedCount++;
          console.log(`[FileUploadService] 파일 추가 ${addedCount}/${fileCount}: ${files[i].name} (${files[i].size} bytes)`);
        }
      } else {
        for (const file of files) {
          formData.append('files', file);
          addedCount++;
          console.log(`[FileUploadService] 파일 추가 ${addedCount}/${fileCount}: ${file.name} (${file.size} bytes)`);
        }
      }

      console.log(`[FileUploadService] FormData에 추가된 파일 수: ${addedCount}`);

      // fileType에 따라 적절한 엔드포인트 선택
      let endpoint: string;
      switch (fileType) {
        case 'learning':
          endpoint = API_ENDPOINTS.UPLOAD_LEARNING(projectId);
          break;
        case 'test':
          endpoint = API_ENDPOINTS.UPLOAD_TEST(projectId);
          break;
        default:
          throw new Error('지원하지 않는 파일 타입입니다.');
      }

      console.log(`[FileUploadService] 업로드 시작: ${endpoint}`);
      const response = await api.post(endpoint, formData);
      console.log(`[FileUploadService] 업로드 응답:`, response.data);
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
      // fileType에 따라 folderPath 결정 (백엔드 실제 폴더 경로와 일치)
      let folderPath: string;
      switch (fileType) {
        case 'learning':
          folderPath = 'learningImages';
          break;
        case 'test':
          folderPath = 'testImages';
          break;
        case 'roi':
          folderPath = 'roi';
          break;
        default:
          throw new Error('지원하지 않는 파일 타입입니다.');
      }
      
      const endpoint = API_ENDPOINTS.DELETE_FILE_OR_FOLDER(projectId, folderPath);
      const response = await api.delete(endpoint, {
        data: {
          deleteName: folderName
        }
      });
      return response.data;
    } catch (error) {
      console.error('파일/폴더 삭제 실패:', error);
      throw error;
    }
  }
} 