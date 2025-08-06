# Parking Management Frontend

주차 관리 시스템의 프론트엔드 애플리케이션입니다.

## 🚀 시작하기

### 필수 요구사항
- Node.js 16.0.0 이상
- npm 또는 yarn

### 설치 및 실행

1. **의존성 설치**
```bash
npm install
```

2. **개발 서버 시작**
```bash
npm start
# 또는
./start.sh
```

3. **브라우저에서 확인**
```
http://localhost:3000
```

## ⚙️ API 설정

### 환경 변수 설정

프로젝트 루트에 `.env` 파일을 생성하고 다음 설정을 추가하세요:

```env
# API 설정
REACT_APP_API_BASE_URL=http://localhost:8080
REACT_APP_UPLOAD_URL=http://localhost:8080/v0.1/parking
REACT_APP_SWAGGER_URL=http://localhost:8080/swagger/index.html

# 환경 설정
NODE_ENV=development
```

### 설정 파일 위치
- API 설정: `src/config/api.ts`
- 환경별 설정: `development`, `production` 환경 지원

### 주요 설정 항목
- `BASE_URL`: API 서버 기본 URL
- `UPLOAD_URL`: 파일 업로드 API URL
- `SWAGGER_URL`: Swagger 문서 URL

## 📁 프로젝트 구조

```
src/
├── config/
│   └── api.ts          # API 설정 중앙 관리
├── services/
│   ├── FileUploadService.ts
│   ├── ProjectService.ts
│   └── ParkingTestService.ts
├── models/
├── viewmodels/
├── views/
└── utils/
```

## 🔧 개발

### 스크립트 실행
```bash
# 개발 서버 시작
npm start

# 빌드
npm run build

# 테스트
npm test
```

### API 설정 변경
1. `src/config/api.ts` 파일 수정
2. 환경 변수 설정 (`.env` 파일)
3. 개발 서버 재시작

## 📦 빌드

```bash
npm run build
```

빌드된 파일은 `build/` 디렉토리에 생성됩니다.

## 🐳 Docker

```bash
# Docker 이미지 빌드
docker build -t parking-manage-frontend .

# Docker 컨테이너 실행
docker run -p 3000:80 parking-manage-frontend
```
