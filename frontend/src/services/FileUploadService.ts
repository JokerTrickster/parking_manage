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

  // 폴더 업로드 (학습/테스트 이미지용) - 청크 단위로 업로드
  static async uploadFolder(
    files: FileList | File[],
    projectId: string,
    fileType: 'learning' | 'test'
  ): Promise<FileUploadResponse> {
    try {
      const filesArray = files instanceof FileList ? Array.from(files) : files;
      const fileCount = filesArray.length;
      console.log(`[FileUploadService] 총 선택된 파일 수: ${fileCount}`);

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

      // 청크 크기: 500개씩 나눠서 업로드
      const CHUNK_SIZE = 500;
      const chunks = [];
      for (let i = 0; i < filesArray.length; i += CHUNK_SIZE) {
        chunks.push(filesArray.slice(i, i + CHUNK_SIZE));
      }

      console.log(`[FileUploadService] 총 ${chunks.length}개 청크로 분할 (청크당 최대 ${CHUNK_SIZE}개 파일)`);

      let totalSuccess = 0;
      let totalFailed = 0;

      // 각 청크를 순차적으로 업로드
      for (let chunkIndex = 0; chunkIndex < chunks.length; chunkIndex++) {
        const chunk = chunks[chunkIndex];
        console.log(`[FileUploadService] 청크 ${chunkIndex + 1}/${chunks.length} 업로드 중... (${chunk.length}개 파일)`);

        const formData = new FormData();
        chunk.forEach(file => {
          formData.append('files', file);
        });

        try {
          const response = await api.post(endpoint, formData);
          console.log(`[FileUploadService] 청크 ${chunkIndex + 1} 업로드 완료:`, response.data);

          if (response.data.success) {
            totalSuccess += response.data.success_count || 0;
            totalFailed += response.data.failed || 0;
          }
        } catch (error) {
          console.error(`[FileUploadService] 청크 ${chunkIndex + 1} 업로드 실패:`, error);
          totalFailed += chunk.length;
        }
      }

      console.log(`[FileUploadService] 전체 업로드 완료: 성공 ${totalSuccess}개, 실패 ${totalFailed}개`);

      return {
        success: totalSuccess > 0,
        message: `${totalSuccess}개 파일 업로드 성공${totalFailed > 0 ? `, ${totalFailed}개 실패` : ''}`,
        total_files: fileCount,
        success_count: totalSuccess,
        failed: totalFailed
      };
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