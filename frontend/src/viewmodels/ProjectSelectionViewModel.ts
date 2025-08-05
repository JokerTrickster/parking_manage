import { Project } from '../models/Project';

export interface ProjectSelectionState {
  projects: Project[];
  loading: boolean;
  error: string | null;
  currentPage: number;
  itemsPerPage: number;
}

export class ProjectSelectionViewModel {
  private state: ProjectSelectionState;
  private setState: React.Dispatch<React.SetStateAction<ProjectSelectionState>>;

  constructor(
    state: ProjectSelectionState,
    setState: React.Dispatch<React.SetStateAction<ProjectSelectionState>>
  ) {
    this.state = state;
    this.setState = setState;
  }

  async loadProjects(): Promise<void> {
    try {
      this.setState(prev => ({ ...prev, loading: true, error: null }));
      
      // 하드코딩된 프로젝트 목록
      const projects: Project[] = [
        {
          id: 'banpo',
          name: '서울 반포',
          description: '서울 반포 주차장 관리 시스템',
          location: '서울특별시 서초구 반포동',
          status: 'active',
        },
        {
          id: 'gwangju',
          name: '전라남도 광주',
          description: '전라남도 광주 주차장 관리 시스템',
          location: '전라남도 광주시',
          status: 'inactive',
        },
        {
          id: 'mokpo',
          name: '목포',
          description: '목포 주차장 관리 시스템',
          location: '전라남도 목포시',
          status: 'active',
        },
        {
          id: 'pohang',
          name: '포항',
          description: '포항 주차장 관리 시스템',
          location: '경상북도 포항시',
          status: 'active',
        },
        {
          id: 'busan',
          name: '부산',
          description: '부산 주차장 관리 시스템',
          location: '부산광역시',
          status: 'inactive',
        },
      ];
      
      this.setState(prev => ({
        ...prev,
        projects: projects,
        loading: false,
        currentPage: 0,
        itemsPerPage: 4,
      }));
    } catch (error) {
      console.error('프로젝트 로드 실패:', error);
      this.setState(prev => ({
        ...prev,
        error: '프로젝트 목록을 불러오는데 실패했습니다.',
        loading: false,
      }));
    }
  }

  get projects(): Project[] {
    const startIndex = this.state.currentPage * this.state.itemsPerPage;
    const endIndex = startIndex + this.state.itemsPerPage;
    return this.state.projects.slice(startIndex, endIndex);
  }

  get allProjects(): Project[] {
    return this.state.projects;
  }

  get loading(): boolean {
    return this.state.loading;
  }

  get error(): string | null {
    return this.state.error;
  }

  get currentPage(): number {
    return this.state.currentPage;
  }

  get totalPages(): number {
    return Math.ceil(this.state.projects.length / this.state.itemsPerPage);
  }

  nextPage(): void {
    if (this.state.currentPage < this.totalPages - 1) {
      this.setState(prev => ({ ...prev, currentPage: prev.currentPage + 1 }));
    }
  }

  prevPage(): void {
    if (this.state.currentPage > 0) {
      this.setState(prev => ({ ...prev, currentPage: prev.currentPage - 1 }));
    }
  }

  goToPage(page: number): void {
    if (page >= 0 && page < this.totalPages) {
      this.setState(prev => ({ ...prev, currentPage: page }));
    }
  }
} 