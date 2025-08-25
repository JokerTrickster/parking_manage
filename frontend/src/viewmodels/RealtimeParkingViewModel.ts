import { FileUploadService } from '../services/FileUploadService';
import LearningService from '../services/LearningService';
import { API_ENDPOINTS, apiConfig } from '../config/api';

export interface RealtimeSettings {
  learningImageFolder: string;
  roiFile: string;
  varThreshold: number;
  learningRate: number;
  iterations: number;
}

export class RealtimeParkingViewModel {
  static async loadAvailableFolders(projectId: string) {
    try {
      const [learningFolders, roiFiles] = await Promise.all([
        FileUploadService.getFolders(projectId, 'learning'),
        FileUploadService.getFolders(projectId, 'roi')
      ]);

      return {
        learning: learningFolders || [],
        roi: roiFiles || []
      };
    } catch (error) {
      console.error('폴더 목록 로드 실패:', error);
      throw error;
    }
  }

  static async batchImageDownload(projectId: string) {
    try {
      const response = await fetch(`${apiConfig.BASE_URL}${API_ENDPOINTS.BATCH_IMAGES(projectId)}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        }
      });

      if (!response.ok) {
        throw new Error('배치 이미지 다운로드 실패');
      }

      return await response.json();
    } catch (error) {
      console.error('배치 이미지 다운로드 실패:', error);
      throw error;
    }
  }

  static async startRealtimeLearning(projectId: string, settings: RealtimeSettings) {
    try {
      const response = await fetch(`${apiConfig.BASE_URL}${API_ENDPOINTS.LEARNING_LIVE(projectId)}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          projectId: projectId,
          learningPath: settings.learningImageFolder,
          roiPath: settings.roiFile,
          varThreshold: settings.varThreshold,
          learningRate: settings.learningRate,
          iterations: settings.iterations
        })
      });

      if (!response.ok) {
        throw new Error('실시간 학습 시작 실패');
      }

      return await response.json();
    } catch (error) {
      console.error('실시간 학습 시작 실패:', error);
      throw error;
    }
  }

  static async getRealtimeResults(projectId: string) {
    try {
      const response = await fetch(`${apiConfig.BASE_URL}${API_ENDPOINTS.LEARNING_LIVE(projectId)}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        }
      });

      if (!response.ok) {
        throw new Error('실시간 결과 조회 실패');
      }

      return await response.json();
    } catch (error) {
      console.error('실시간 결과 조회 실패:', error);
      throw error;
    }
  }

  static async getRealtimeCctvImage(projectId: string, cctvId: string, imageType: string): Promise<string> {
    try {
      // 캐시 방지를 위한 타임스탬프 추가
      const timestamp = new Date().getTime();
      const url = `${apiConfig.BASE_URL}${API_ENDPOINTS.REALTIME_CCTV_IMAGE(projectId, cctvId, imageType)}?t=${timestamp}`;
      
      const response = await fetch(url, {
        method: 'GET',
        cache: 'no-cache', // 캐시 사용 안함
        headers: {
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          'Pragma': 'no-cache',
          'Expires': '0'
        }
      });

      if (!response.ok) {
        throw new Error(`실시간 CCTV ${imageType} 이미지 조회 실패`);
      }

      // 이미지 데이터를 Blob으로 받아서 URL 생성
      const blob = await response.blob();
      return URL.createObjectURL(blob);
    } catch (error) {
      console.error(`실시간 CCTV ${imageType} 이미지 조회 실패:`, error);
      throw error;
    }
  }

  static async getRealtimeCctvImages(projectId: string, cctvId: string) {
    try {
      // ROI 결과와 Foreground 마스크 이미지를 병렬로 가져오기
      const [roiResultUrl, fgMaskUrl] = await Promise.all([
        this.getRealtimeCctvImage(projectId, cctvId, 'roi_result'),
        this.getRealtimeCctvImage(projectId, cctvId, 'fgmask')
      ]);

      return {
        roiResultImage: roiResultUrl,
        fgMaskImage: fgMaskUrl
      };
    } catch (error) {
      console.error('실시간 CCTV 이미지 조회 실패:', error);
      throw error;
    }
  }
}
