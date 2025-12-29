import { FileStorageService } from '../services/FileStorageService';
import { API_ENDPOINTS, apiConfig } from '../config/api';
import { CctvTemplateService } from '../services/CctvTemplateService';
import { CctvTemplate } from '../models/CctvTemplate';

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
      const [learningResponse, roiResponse] = await Promise.all([
        FileStorageService.listFolders(projectId, 'learning'),
        FileStorageService.listFiles(projectId, 'roi')
      ]);

      // 폴더만 필터링하여 이름 추출
      const learningFolders = learningResponse.data.items
        .filter(item => item.isFolder)
        .map(folder => folder.name);

      // ROI 파일 목록에서 파일명 추출
      const roiFiles = roiResponse.data.files.map(file => file.filename);

      return {
        learning: learningFolders,
        roi: roiFiles
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
      
      // GET 요청으로 이미지 존재 확인
      const response = await fetch(url, {
        method: 'GET',
        cache: 'no-cache'
      });

      if (!response.ok) {
        throw new Error(`실시간 CCTV ${imageType} 이미지 조회 실패: ${response.status}`);
      }

      // 직접 URL 반환
      return url;
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

  /**
   * 프로젝트의 CCTV 템플릿 조회
   */
  static getCctvTemplate(projectId: string): CctvTemplate | null {
    return CctvTemplateService.getTemplateByProjectId(projectId);
  }

  /**
   * 템플릿 기반 CCTV 이미지 URL 생성 (JSON endpoint 직접 사용)
   */
  static getTemplateBasedImageUrl(
    projectId: string,
    cctvId: string,
    imageType: string
  ): string {
    const template = this.getCctvTemplate(projectId);
    if (!template) {
      throw new Error(`프로젝트 "${projectId}"의 템플릿을 찾을 수 없습니다.`);
    }

    const cctv = template.cctvList.find(c => c.cctvId === cctvId);
    if (!cctv) {
      throw new Error(`CCTV "${cctvId}"를 찾을 수 없습니다.`);
    }

    const imageConfig = cctv.images.find(img => img.type === imageType);
    if (!imageConfig) {
      throw new Error(`이미지 타입 "${imageType}"을 찾을 수 없습니다.`);
    }

    // JSON에 정의된 endpoint를 직접 사용 (캐시 방지 타임스탬프 추가)
    const timestamp = new Date().getTime();
    return `${imageConfig.endpoint}?t=${timestamp}`;
  }

  /**
   * 템플릿 기반 CCTV 이미지 조회 (JSON에서 endpoint URL 직접 사용)
   */
  static getTemplateBasedCctvImages(
    projectId: string,
    cctvId: string
  ): Record<string, string> {
    const template = this.getCctvTemplate(projectId);
    if (!template) {
      throw new Error(`프로젝트 "${projectId}"의 템플릿을 찾을 수 없습니다.`);
    }

    const cctv = template.cctvList.find(c => c.cctvId === cctvId);
    if (!cctv) {
      throw new Error(`CCTV "${cctvId}"를 찾을 수 없습니다.`);
    }

    // JSON에서 endpoint URL을 직접 읽어서 반환 (캐시 방지 타임스탬프 추가)
    const images: Record<string, string> = {};
    const timestamp = new Date().getTime();

    cctv.images.forEach(imageConfig => {
      images[imageConfig.type] = `${imageConfig.endpoint}?t=${timestamp}`;
    });

    return images;
  }
}
