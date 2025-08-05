import { Project, ProjectStats } from '../models/Project';
import { ParkingTestRequest, ParkingTestResponse } from '../models/ParkingTest';
import { ProjectService } from '../services/ProjectService';
import { ParkingTestService } from '../services/ParkingTestService';

export interface ParkingTestState {
  loading: boolean;
  stats: ProjectStats | null;
  varThreshold: number;
  testResult: ParkingTestResponse | null;
  error: string | null;
}

export class ParkingTestViewModel {
  private state: ParkingTestState;
  private setState: React.Dispatch<React.SetStateAction<ParkingTestState>>;
  private _project: Project;

  constructor(
    project: Project,
    state: ParkingTestState,
    setState: React.Dispatch<React.SetStateAction<ParkingTestState>>
  ) {
    this._project = project;
    this.state = state;
    this.setState = setState;
  }

  async loadProjectStats(): Promise<void> {
    try {
      const statsData = await ProjectService.getProjectStats(this._project.id);
      this.setState(prev => ({ ...prev, stats: statsData }));
    } catch (error) {
      console.error('프로젝트 통계 로드 실패:', error);
      // 임시 데이터
      this.setState(prev => ({
        ...prev,
        stats: {
          learning_images_count: 150,
          test_images_count: 25,
          matched_count: 23,
        },
      }));
    }
  }

  async startTest(): Promise<void> {
    try {
      this.setState(prev => ({ 
        ...prev, 
        loading: true, 
        error: null, 
        testResult: null 
      }));

      const request: ParkingTestRequest = {
        cctv_id: this._project.id,
        var_threshold: this.state.varThreshold,
        learning_path: `../../shared/uploads/learningImages/${this._project.id}`,
        test_image_path: `../../shared/uploads/testImages/${this._project.id}.jpg`,
        json_path: `../../data/json/matched_rois_and_parkings_250707.json`,
      };

      const response = await ParkingTestService.detectParking(request);
      
      if (response.success) {
        this.setState(prev => ({ 
          ...prev, 
          testResult: response, 
          loading: false 
        }));
      } else {
        this.setState(prev => ({
          ...prev,
          error: response.message || '테스트 실행 중 오류가 발생했습니다.',
          loading: false,
        }));
      }
    } catch (error) {
      console.error('테스트 실행 실패:', error);
      this.setState(prev => ({
        ...prev,
        error: '서버 연결에 실패했습니다. 서버가 실행 중인지 확인해주세요.',
        loading: false,
      }));
    }
  }

  setVarThreshold(value: number): void {
    this.setState(prev => ({ ...prev, varThreshold: value }));
  }

  get loading(): boolean {
    return this.state.loading;
  }

  get stats(): ProjectStats | null {
    return this.state.stats;
  }

  get varThreshold(): number {
    return this.state.varThreshold;
  }

  get testResult(): ParkingTestResponse | null {
    return this.state.testResult;
  }

  get error(): string | null {
    return this.state.error;
  }

  get project(): Project {
    return this._project;
  }
} 