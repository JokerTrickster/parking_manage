import { Project } from '../models/Project';
import { ParkingTestRequest, ParkingTestResponse } from '../models/ParkingTest';
import { LearningRequest, LearningResponse, LearningResultsData, LearningResultsResponse } from '../models/Learning';

import { ParkingTestService } from '../services/ParkingTestService';
import LearningService from '../services/LearningService';

export interface ParkingTestState {
  loading: boolean;
  varThreshold: number;
  learningRate: number;
  iterations: number;
  testResult: ParkingTestResponse | null;
  learningResult: LearningResponse | null;
  learningResultsData: LearningResultsData | null;
  showResults: boolean;
  error: string | null;
  // 선택된 파일/폴더 경로
  selectedLearningPath: string;
  selectedTestPath: string;
  selectedRoiPath: string;
  // 최근 학습 정보
  lastLearningFolderPath: string | null;
  // 새로운 필드들
  selectedLearningFolder: string;
  selectedRoiFile: string;
  selectedTestFolder: string;
  learningHistory: any[];
  selectedHistoryResults: LearningResultsData | null;
}

export class ParkingTestViewModel {
  private _project: Project;
  private _setState: React.Dispatch<React.SetStateAction<ParkingTestState>>;

  constructor(project: Project, state: ParkingTestState, setState: React.Dispatch<React.SetStateAction<ParkingTestState>>) {
    this._project = project;
    this._setState = setState;
  }

  static getInitialState(): ParkingTestState {
    return {
      loading: false,
      varThreshold: 50.0,
      learningRate: 0.001,
      iterations: 1000,
      testResult: null,
      learningResult: null,
      learningResultsData: null,
      showResults: false,
      error: null,
      selectedLearningPath: '',
      selectedTestPath: '',
      selectedRoiPath: '',
      lastLearningFolderPath: null,
      selectedLearningFolder: '',
      selectedRoiFile: '',
      selectedTestFolder: '',
      learningHistory: [],
      selectedHistoryResults: null,
    };
  }

  // Setters
  setSelectedLearningPath(path: string): void {
    this._setState(prev => ({ ...prev, selectedLearningPath: path }));
  }

  setSelectedTestPath(path: string): void {
    this._setState(prev => ({ ...prev, selectedTestPath: path }));
  }

  setSelectedRoiPath(path: string): void {
    this._setState(prev => ({ ...prev, selectedRoiPath: path }));
  }

  // Methods

  async startLearning(currentState: ParkingTestState): Promise<void> {
    try {
      // 필수 경로 검증
      if (!currentState.selectedLearningPath || !currentState.selectedTestPath || !currentState.selectedRoiPath) {
        this._setState(prev => ({
          ...prev,
          error: '학습 이미지, 테스트 이미지, ROI 파일을 모두 선택해주세요.',
          loading: false,
        }));
        return;
      }

      this._setState(prev => ({ 
        ...prev, 
        loading: true, 
        error: null, 
        learningResult: null,
        learningResultsData: null,
        showResults: false
      }));

      const request: LearningRequest = {
        projectId: this._project.id,
        learningRate: currentState.learningRate,
        iterations: currentState.iterations,
        varThreshold: currentState.varThreshold,
        learningPath: currentState.selectedLearningPath,
        testPath: currentState.selectedTestPath,
        roiPath: currentState.selectedRoiPath,
      };

      const response = await LearningService.executeLearning(request);
      
      if (response.folder_path) {
        // 전체 경로에서 폴더명만 추출
        const folderName = this.extractFolderName(response.folder_path);
        
        this._setState(prev => ({ 
          ...prev, 
          learningResult: response, 
          lastLearningFolderPath: folderName,
          loading: false 
        }));
      } else {
        this._setState(prev => ({
          ...prev,
          error: '학습 실행 중 오류가 발생했습니다.',
          loading: false,
        }));
      }
    } catch (error) {
      this._setState(prev => ({
        ...prev,
        error: '학습 실행 중 오류가 발생했습니다.',
        loading: false,
      }));
    }
  }

  async loadLearningResults(folderPath: string): Promise<LearningResultsData | null> {
    try {
      // 결과 데이터 로드
      const response = await LearningService.getLearningResults(this._project.id, folderPath);
      
      if (response.success) {
        this._setState(prev => ({
          ...prev,
          learningResultsData: response.data,
          showResults: true
        }));
        return response.data;
      } else {
        this._setState(prev => ({
          ...prev,
          error: response.message || '학습 결과를 불러오는데 실패했습니다.'
        }));
        return null;
      }
    } catch (error) {
      console.error('학습 결과 로드 실패:', error);
      this._setState(prev => ({
        ...prev,
        error: '학습 결과를 불러오는데 실패했습니다.'
      }));
      return null;
    }
  }



  private extractFolderName(fullPath: string): string {
    // 경로에서 마지막 폴더명만 추출
    const pathParts = fullPath.split('/');
    return pathParts[pathParts.length - 1];
  }

  // 정적 메서드들
  static async startLearning(
    projectId: string,
    learningFolder: string,
    roiFile: string,
    testFolder: string,
    varThreshold: number,
    learningRate: number,
    iterations: number
  ): Promise<LearningResponse> {
    const request: LearningRequest = {
      projectId,
      learningRate,
      iterations,
      varThreshold,
      learningPath: learningFolder,
      testPath: testFolder,
      roiPath: roiFile,
    };

    return await LearningService.executeLearning(request);
  }

  static async loadLearningResults(projectId: string, folderPath: string): Promise<LearningResultsData | null> {
    try {
      const response = await LearningService.getLearningResults(projectId, folderPath);
      return response.success ? response.data : null;
    } catch (error) {
      console.error('학습 결과 로드 실패:', error);
      return null;
    }
  }

  static async loadLearningHistory(projectId: string): Promise<any[]> {
    try {
      console.log('ParkingTestViewModel.loadLearningHistory 호출됨, projectId:', projectId);
      const response = await LearningService.getLearningHistory(projectId);
      console.log('히스토리 응답 전체:', response);
      console.log('히스토리 응답 data:', response.data);
      console.log('히스토리 응답 타입:', typeof response.data);
      console.log('히스토리 응답 길이:', Array.isArray(response.data) ? response.data.length : 'Not array');
      
      // 응답 데이터 구조에 따라 적절히 반환
      if (response.data && Array.isArray(response.data)) {
        return response.data;
      } else if (response.data && response.data.results && Array.isArray(response.data.results)) {
        return response.data.results;
      } else if (response && Array.isArray(response)) {
        return response;
      } else {
        console.log('예상하지 못한 응답 구조:', response);
        return [];
      }
    } catch (error) {
      console.error('학습 히스토리 로드 실패:', error);
      return [];
    }
  }

} 