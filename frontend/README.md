# 주차 관리 시스템 - 프론트엔드 (MVVM 아키텍처)

React와 TypeScript를 사용한 주차 관리 시스템의 프론트엔드 애플리케이션입니다. **MVVM (Model-View-ViewModel)** 아키텍처 패턴을 적용하여 유지보수성과 확장성을 높였습니다.

## 🏗️ MVVM 아키텍처

### 📁 프로젝트 구조

```
src/
├── models/              # Model 계층 - 데이터 구조 정의
│   ├── Project.ts      # 프로젝트 관련 모델
│   ├── ParkingTest.ts  # 주차 테스트 관련 모델
│   └── FileUpload.ts   # 파일 업로드 관련 모델
├── viewmodels/         # ViewModel 계층 - 비즈니스 로직
│   ├── ProjectSelectionViewModel.ts
│   ├── ParkingTestViewModel.ts
│   └── FileUploadViewModel.ts
├── views/              # View 계층 - UI 컴포넌트
│   ├── LayoutView.tsx
│   ├── ProjectSelectionView.tsx
│   ├── DashboardView.tsx
│   ├── ParkingTestView.tsx
│   └── FileUploadView.tsx
├── services/           # Service 계층 - API 통신
│   ├── ProjectService.ts
│   ├── ParkingTestService.ts
│   └── FileUploadService.ts
├── utils/              # 유틸리티 함수
│   ├── validation.ts
│   └── constants.ts
└── App.tsx            # 메인 애플리케이션
```

### 🔄 MVVM 데이터 흐름

```
┌─────────────┐    ┌─────────────────┐    ┌─────────────┐
│    View     │◄──►│   ViewModel     │◄──►│    Model    │
│  (UI)       │    │ (비즈니스 로직)  │    │  (데이터)   │
└─────────────┘    └─────────────────┘    └─────────────┘
       │                    │                    │
       │                    │                    │
       ▼                    ▼                    ▼
┌─────────────┐    ┌─────────────────┐    ┌─────────────┐
│  사용자 입력  │    │  상태 관리       │    │ API 호출    │
│  이벤트 처리  │    │  데이터 변환     │    │  데이터 저장  │
└─────────────┘    └─────────────────┘    └─────────────┘
```

## 주요 기능

### 1. 프로젝트 선택
- 반포, 전라남도 광주, 부산, 대구 등 각 사이트별 프로젝트 선택
- 프로젝트별 정보 및 위치 표시

### 2. 대시보드
- **주차면 테스트**: 학습 데이터와 테스트 이미지를 사용한 주차면 감지
- **ROI 작업**: 관심 영역 설정 및 관리
- **실시간 주차면**: 실시간 모니터링
- **학습 데이터 등록**: 알고리즘 학습을 위한 데이터 관리

### 3. 주차면 테스트
- 학습 이미지 업로드 (다중 파일 지원)
- 테스트 이미지 업로드
- Var Threshold 설정
- 테스트 실행 및 결과 확인
- 매칭된 이미지 수 표시

## MVVM 계층별 설명

### 📊 Model 계층
데이터 구조와 타입을 정의합니다.

```typescript
// models/Project.ts
export interface Project {
  id: string;
  name: string;
  description: string;
  location: string;
}
```

### 🎛️ ViewModel 계층
비즈니스 로직과 상태 관리를 담당합니다.

```typescript
// viewmodels/ProjectSelectionViewModel.ts
export class ProjectSelectionViewModel {
  async loadProjects(): Promise<void> {
    // API 호출 및 상태 업데이트 로직
  }
}
```

### 🖼️ View 계층
사용자 인터페이스만 담당합니다.

```typescript
// views/ProjectSelectionView.tsx
const ProjectSelectionView: React.FC<ProjectSelectionViewProps> = ({ onProjectSelect }) => {
  const viewModel = new ProjectSelectionViewModel(state, setState);
  // UI 렌더링만 담당
}
```

### 🔌 Service 계층
API 통신을 담당합니다.

```typescript
// services/ProjectService.ts
export class ProjectService {
  static async getProjects(): Promise<{ success: boolean; data: Project[] }> {
    // HTTP 요청 처리
  }
}
```

## 기술 스택

- **React 18**: 사용자 인터페이스
- **TypeScript**: 타입 안전성
- **Material-UI**: UI 컴포넌트 라이브러리
- **Axios**: HTTP 클라이언트
- **MVVM 패턴**: 아키텍처 패턴

## 설치 및 실행

### 개발 환경

```bash
# 의존성 설치
npm install

# 개발 서버 실행
npm start
```

### 프로덕션 빌드

```bash
# 프로덕션 빌드
npm run build

# 빌드 결과 확인
npm run serve
```

## API 엔드포인트

### 주차 감지
- `POST /api/detect-parking`: 주차면 감지 테스트 실행

### 파일 업로드
- `POST /api/upload`: 학습/테스트 이미지 업로드

### 프로젝트 관리
- `GET /api/projects`: 프로젝트 목록 조회
- `GET /api/project/:id/stats`: 프로젝트 통계 조회

### 결과 조회
- `GET /api/results`: 모든 결과 조회
- `GET /api/results/:timestamp`: 특정 결과 조회

## MVVM 패턴의 장점

### ✅ **관심사 분리**
- **View**: UI만 담당
- **ViewModel**: 비즈니스 로직만 담당
- **Model**: 데이터 구조만 담당

### ✅ **테스트 용이성**
- 각 계층을 독립적으로 테스트 가능
- ViewModel의 비즈니스 로직을 단위 테스트로 검증

### ✅ **재사용성**
- ViewModel을 다른 View에서 재사용 가능
- Service 계층을 여러 ViewModel에서 공유

### ✅ **유지보수성**
- 코드 변경 시 영향 범위가 명확
- 새로운 기능 추가 시 기존 코드 영향 최소화

## 개발 가이드

### 새 기능 추가 시 MVVM 패턴 적용

1. **Model 정의**: `models/` 디렉토리에 데이터 타입 정의
2. **Service 생성**: `services/` 디렉토리에 API 통신 로직 작성
3. **ViewModel 구현**: `viewmodels/` 디렉토리에 비즈니스 로직 구현
4. **View 생성**: `views/` 디렉토리에 UI 컴포넌트 작성

### 예시: 새로운 기능 추가

```typescript
// 1. Model 정의
// models/NewFeature.ts
export interface NewFeatureData {
  id: string;
  name: string;
}

// 2. Service 생성
// services/NewFeatureService.ts
export class NewFeatureService {
  static async getData(): Promise<NewFeatureData[]> {
    // API 호출
  }
}

// 3. ViewModel 구현
// viewmodels/NewFeatureViewModel.ts
export class NewFeatureViewModel {
  // 비즈니스 로직
}

// 4. View 생성
// views/NewFeatureView.tsx
const NewFeatureView: React.FC = () => {
  // UI 렌더링
}
```

## 환경 변수

```bash
# .env 파일
REACT_APP_API_URL=http://localhost:8080/api
```

## Docker 실행

```bash
# 프론트엔드만 실행
docker build -t parking-frontend .
docker run -p 3000:3000 parking-frontend

# 전체 시스템 실행 (docker-compose)
docker-compose up --build
```

## 문제 해결

### CORS 오류
- 백엔드 서버가 실행 중인지 확인
- CORS 설정이 올바른지 확인

### 파일 업로드 실패
- 파일 크기 제한 확인
- 지원되는 파일 형식 확인 (.jpg, .jpeg, .png)

### API 연결 실패
- 백엔드 서버 상태 확인
- 네트워크 연결 확인
- API 엔드포인트 URL 확인
