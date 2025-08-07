import { Project, ProjectStats } from '../models/Project';
import { ParkingTestRequest, ParkingTestResponse } from '../models/ParkingTest';
import { LearningRequest, LearningResponse, LearningResultsData, LearningStatistics } from '../models/Learning';
import { ProjectService } from '../services/ProjectService';
import { ParkingTestService } from '../services/ParkingTestService';
import LearningService from '../services/LearningService';

export interface ParkingTestState {
  loading: boolean;
  stats: ProjectStats | null;
  varThreshold: number;
  learningRate: number;
  iterations: number;
  testResult: ParkingTestResponse | null;
  learningResult: LearningResponse | null;
  learningResultsData: LearningResultsData | null;
  learningStatistics: LearningStatistics | null;
  showResults: boolean;
  error: string | null;
  // 선택된 파일/폴더 경로
  selectedLearningPath: string;
  selectedTestPath: string;
  selectedRoiPath: string;
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
  async loadProjectStats(): Promise<void> {
    try {
      this._setState(prev => ({ ...prev, loading: true }));
      const stats = await ProjectService.getProjectStats(this._project.id);
      this._setState(prev => ({ ...prev, stats, loading: false }));
    } catch (error) {
      console.error('프로젝트 통계 로드 실패:', error);
      this._setState(prev => ({ 
        ...prev, 
        error: '프로젝트 통계를 불러오는데 실패했습니다.',
        loading: false 
      }));
    }
  }

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
        learningStatistics: null,
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
      
      if (response.success) {
        this._setState(prev => ({ 
          ...prev, 
          learningResult: response, 
          loading: false 
        }));
        await this.loadLearningResults(); // Load results after successful learning
      } else {
        this._setState(prev => ({
          ...prev,
          error: response.message || '학습 실행 중 오류가 발생했습니다.',
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

  async loadLearningResults(): Promise<void> {
    try {
      // 결과 데이터 로드
      const resultsData = await LearningService.getLearningResults(this._project.id, this.getCurrentTimestamp());
      
      // 통계 계산
      const statistics = this.calculateStatistics(resultsData);
      
      this._setState(prev => ({
        ...prev,
        learningResultsData: resultsData,
        learningStatistics: statistics,
        showResults: true
      }));
    } catch (error) {
      console.error('학습 결과 로드 실패:', error);
      this._setState(prev => ({
        ...prev,
        error: '학습 결과를 불러오는데 실패했습니다.'
      }));
    }
  }

  private calculateStatistics(resultsData: LearningResultsData): LearningStatistics {
    const cctvStats = new Map<string, { learningImages: number; roiCount: number; vehicleCount: number }>();
    
    resultsData.results.forEach(result => {
      const cctvId = result.cctv_id;
      const currentStats = cctvStats.get(cctvId) || { learningImages: 0, roiCount: 0, vehicleCount: 0 };
      
      // ROI 개수 추가
      currentStats.roiCount += result.roi_results.length;
      
      // 차량이 있는 ROI 개수 계산 (foreground_ratio >= 0.4)
      const vehicleRois = result.roi_results.filter(roi => roi.foreground_ratio >= 0.4);
      currentStats.vehicleCount += vehicleRois.length;
      
      cctvStats.set(cctvId, currentStats);
    });

    const totalTests = resultsData.total_tests;
    const totalRois = Array.from(cctvStats.values()).reduce((sum, stats) => sum + stats.roiCount, 0);
    const totalVehicles = Array.from(cctvStats.values()).reduce((sum, stats) => sum + stats.vehicleCount, 0);

    return {
      totalTests,
      totalRois,
      totalVehicles,
      cctvStats: Array.from(cctvStats.entries()).map(([cctvId, stats]) => ({
        cctvId,
        learningImages: stats.learningImages,
        roiCount: stats.roiCount,
        vehicleCount: stats.vehicleCount
      }))
    };
  }

  private getCurrentTimestamp(): string {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    const seconds = String(now.getSeconds()).padStart(2, '0');
    const milliseconds = String(now.getMilliseconds()).padStart(3, '0');
    
    return `${year}${month}${day}_${hours}${minutes}${seconds}_${milliseconds}`;
  }
} 