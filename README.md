# 주차 관리 시스템

OpenCV 기반 주차 감지 알고리즘과 Go 백엔드, React 프론트엔드를 결합한 통합 주차 관리 시스템입니다.

## 프로젝트 구조

```
parking_manage/
├── backend/                    # Go 백엔드
│   ├── opencv/                 # OpenCV C++ 알고리즘
│   │   ├── main.cpp           # MOG2 주차 감지 알고리즘
│   │   └── Makefile           # C++ 컴파일 설정
│   └── src/                   # Go 서버
│       ├── features/          # 기능별 모듈
│       │   ├── parking/       # 주차 감지 기능
│       │   └── roi/           # ROI 관리 기능
│       ├── common/            # 공통 유틸리티 (JWT, DB, env)
│       ├── middleware/        # Echo 미들웨어
│       └── main.go            # 애플리케이션 진입점
├── frontend/                  # React 프론트엔드
│   ├── src/
│   │   ├── components/        # 재사용 가능한 UI 컴포넌트
│   │   ├── pages/             # 페이지 컴포넌트
│   │   ├── views/             # UI 프레젠테이션 레이어
│   │   ├── viewmodels/        # 비즈니스 로직 레이어
│   │   ├── services/          # API 통신 레이어
│   │   ├── models/            # TypeScript 타입 정의
│   │   ├── config/            # 설정 파일
│   │   └── utils/             # 헬퍼 함수
│   └── package.json           # 프론트엔드 의존성
├── shared/
│   ├── results/               # 알고리즘 결과 저장
│   └── uploads/               # 업로드된 이미지
│       ├── learningImages/    # 학습용 이미지
│       └── testImages/        # 테스트 이미지
└── docker-compose.yml         # Docker 설정
```

## 기술 스택

### 백엔드 (Go)
- **Framework**: Echo v4 웹 프레임워크
- **Architecture**: Clean Architecture (handler/usecase/repository)
- **Database**: MySQL with GORM ORM
- **Authentication**: JWT with session management
- **Documentation**: Swagger API 문서화

### 프론트엔드 (React + TypeScript)
- **Framework**: React 19.1.1 with TypeScript 4.9.5
- **Architecture**: MVVM 패턴 (Model-View-ViewModel)
- **UI Framework**: Material-UI (MUI) v7.2.0
- **Routing**: React Router DOM v7.7.1
- **HTTP Client**: Axios 1.11.0
- **Testing**: Jest and React Testing Library

### OpenCV 알고리즘 (C++)
- **Language**: C++17 with OpenCV 4.x
- **Algorithm**: MOG2 배경 제거 알고리즘
- **Build System**: Make with pkg-config

## 설치 및 실행

### 1. 의존성 설치

#### 백엔드 의존성
```bash
# OpenCV 및 nlohmann/json 설치
brew install opencv nlohmann-json

# Go 의존성 설치
cd backend/src
go mod tidy
```

#### 프론트엔드 의존성
```bash
# Node.js 의존성 설치
cd frontend
npm install
```

### 2. C++ 알고리즘 컴파일

```bash
cd backend/opencv
make all
```

### 3. 애플리케이션 실행

#### 백엔드 서버 실행
```bash
cd backend/src
go run main.go
```
서버는 기본적으로 `http://localhost:8080`에서 실행됩니다.

#### 프론트엔드 개발 서버 실행
```bash
cd frontend
npm run dev    # 포트 5050에서 실행
# 또는
npm start      # 기본 포트 3000에서 실행
```

#### Docker로 전체 시스템 실행
```bash
# 전체 서비스 시작
docker-compose up

# 개별 서비스 시작
docker-compose up backend
docker-compose up frontend
docker-compose up mysql
```

## API 사용법

### 주차 감지 API

**POST** `/api/detect-parking`

요청 본문:
```json
{
  "cctv_id": "P1_B3_1_3",
  "var_threshold": 50.0,
  "learning_path": "../../shared/uploads/learningImages/P1_B3_1_3",
  "test_image_path": "../../shared/uploads/testImages/P1_B3_1_3.jpg",
  "json_path": "../../data/json/matched_rois_and_parkings_250707.json"
}
```

응답:
```json
{
  "success": true,
  "message": "주차 감지가 성공적으로 완료되었습니다",
  "data": {
    "result_path": "../../shared/results/20241205_143022_123/parking_result.json"
  }
}
```

### 결과 조회 API

**GET** `/api/results` - 모든 결과 조회
**GET** `/api/results/{timestamp}` - 특정 결과 조회

## 알고리즘 설명

### MOG2 배경 제거 알고리즘

1. **학습 단계**: 학습용 이미지들을 사용하여 배경 모델을 학습
2. **테스트 단계**: 테스트 이미지에서 배경을 제거하여 foreground 추출
3. **ROI 분석**: 각 ROI 영역에서 foreground 비율을 계산하여 주차 상태 판단

### 매개변수

- `var_threshold`: 배경 제거 민감도 (기본값: 50.0)
- `learning_path`: 학습용 이미지 폴더 경로
- `test_image_path`: 테스트 이미지 파일 경로
- `json_path`: ROI 정보가 담긴 JSON 파일 경로

## 결과 파일 형식

```json
{
  "cctv_id": "P1_B3_1_3",
  "timestamp": "20241205_143022_123",
  "var_threshold": 50.0,
  "learning_path": "../../shared/uploads/learningImages/P1_B3_1_3",
  "test_image_path": "../../shared/uploads/testImages/P1_B3_1_3.jpg",
  "roi_results": [
    {
      "roi_index": 1,
      "foreground_ratio": 0.15
    },
    {
      "roi_index": 2,
      "foreground_ratio": 0.85
    }
  ]
}
```

## 테스트

API 테스트를 위한 Python 스크립트가 포함되어 있습니다:

```bash
python test_api.py
```

## 프론트엔드 아키텍처

### MVVM 패턴 구조
```
Model (models/) → ViewModel (viewmodels/) → View (views/pages/)
                       ↓
Service (services/) → API 통신
```

### 주요 아키텍처 특징
- **타입 안전성**: TypeScript 엄격 모드로 전체 타입 안전성 보장
- **반응형 디자인**: 모바일 우선 접근 방식으로 모든 기기 지원
- **컴포넌트 재사용성**: Material-UI 기반 일관된 디자인 시스템
- **라우팅 구조**: 프로젝트 기반 중첩 라우팅 (`/project/:projectId/*`)
- **상태 관리**: ViewModel 패턴을 통한 로컬 상태 관리

### 디렉토리 구조 설명
- **components/**: 재사용 가능한 UI 컴포넌트
- **pages/**: 라우트별 페이지 컴포넌트
- **views/**: UI 프레젠테이션 담당 컴포넌트
- **viewmodels/**: 비즈니스 로직 및 상태 관리
- **services/**: API 통신 및 데이터 페칭
- **models/**: TypeScript 인터페이스 및 타입 정의
- **config/**: API 설정 및 환경 구성
- **utils/**: 헬퍼 함수 및 유틸리티

### 코딩 컨벤션
- **파일명**: PascalCase (컴포넌트), camelCase (함수/변수)
- **타입 정의**: 모든 컴포넌트와 함수에 명시적 타입 지정
- **반응형 유틸리티**: MUI breakpoint 시스템 활용
- **한국어 지원**: Noto Sans KR 폰트 및 한국어 UI

## 백엔드 아키텍처

### Clean Architecture 구조
```
Handler (API Layer) → UseCase (Business Logic) → Repository (Data Layer)
                              ↓
                         Model (Entity)
```

### 주요 특징
- **기능별 모듈화**: parking, roi 기능별 독립적 모듈
- **계층 분리**: handler/usecase/repository 3계층 구조
- **JWT 인증**: 세션 관리를 포함한 JWT 토큰 기반 인증
- **데이터베이스**: GORM을 사용한 MySQL 연동
- **API 문서화**: Swagger를 통한 자동 문서 생성

### 환경 설정
```bash
# 필수 환경 변수
DB_HOST=localhost
DB_PORT=3306
DB_NAME=parking_manage
DB_USER=root
DB_PASSWORD=password
PORT=8080
UPLOAD_PATH=shared/uploads/
JWT_SECRET=your_jwt_secret
DEBUG=true
IS_LOCAL=true
```

## 개발 환경

- **OS**: macOS (Homebrew 사용)
- **Backend**: Go 1.24.1, Echo v4, MySQL, GORM
- **Frontend**: Node.js, React 19.1.1, TypeScript 4.9.5
- **Algorithm**: C++17, OpenCV 4.12.0
- **Tools**: Docker, Swagger, Jest

## 문제 해결

### 컴파일 오류

1. OpenCV가 설치되어 있는지 확인:
   ```bash
   brew list opencv
   ```

2. pkg-config가 라이브러리를 찾을 수 있는지 확인:
   ```bash
   pkg-config --cflags --libs opencv4
   pkg-config --cflags --libs nlohmann_json
   ```

### 서버 연결 오류

1. 서버가 실행 중인지 확인:
   ```bash
   curl http://localhost:8080/api/results
   ```

2. 포트가 사용 중인지 확인:
   ```bash
   lsof -i :8080
   ``` 