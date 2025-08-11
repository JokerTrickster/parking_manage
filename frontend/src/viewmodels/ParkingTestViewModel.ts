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
}

export class ParkingTestViewModel {
  private _project: Project;
  private _setState: React.Dispatch<React.SetStateAction<ParkingTestState>>;

  constructor(project: Project, state: ParkingTestState, setState: React.Dispatch<React.SetStateAction<ParkingTestState>>) {
    this._project = project;
    this._setState = setState;
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

} 