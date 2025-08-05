# 주차 관리 시스템

OpenCV를 사용한 주차 감지 알고리즘과 Go 서버를 결합한 주차 관리 시스템입니다.

## 프로젝트 구조

```
parking_manage/
├── backend/
│   ├── opencv/
│   │   ├── main.cpp          # OpenCV 주차 감지 알고리즘
│   │   └── Makefile          # C++ 컴파일 설정
│   └── src/
│       ├── main.go           # Go 서버
│       └── go.mod            # Go 의존성
├── shared/
│   ├── results/              # 알고리즘 결과 저장
│   └── uploads/              # 업로드된 이미지
│       ├── learningImages/   # 학습용 이미지
│       └── testImages/       # 테스트 이미지
└── docker-compose.yml        # Docker 설정
```

## 설치 및 실행

### 1. 의존성 설치

```bash
# OpenCV 및 nlohmann/json 설치
brew install opencv nlohmann-json

# Go 의존성 설치
cd backend/src
go mod tidy
```

### 2. C++ 알고리즘 컴파일

```bash
cd backend/opencv
make all
```

### 3. Go 서버 실행

```bash
cd backend/src
go run main.go
```

서버는 기본적으로 `http://localhost:8080`에서 실행됩니다.

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

## 개발 환경

- **OS**: macOS (Homebrew 사용)
- **C++**: g++ (C++17)
- **OpenCV**: 4.12.0
- **Go**: 1.24.1
- **Gin**: 웹 프레임워크

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