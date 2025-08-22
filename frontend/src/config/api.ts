// API 설정
export const API_CONFIG = {
  // 개발 환경
  development: {
    BASE_URL: process.env.REACT_APP_API_BASE_URL || 'http://172.16.32.168:8080',
    UPLOAD_URL: process.env.REACT_APP_UPLOAD_URL || 'http://172.16.32.168:8080/v0.1/parking',
    SWAGGER_URL: process.env.REACT_APP_SWAGGER_URL || 'http://172.16.32.168:8080/swagger/index.html'
  },
  // 프로덕션 환경 (도커)
  production: {
    BASE_URL: process.env.REACT_APP_API_BASE_URL || 'http://localhost:8080',
    UPLOAD_URL: process.env.REACT_APP_UPLOAD_URL || 'http://localhost:8080/v0.1/parking',
    SWAGGER_URL: process.env.REACT_APP_SWAGGER_URL || 'http://localhost:8080/swagger/index.html'
  }
};

// 현재 환경에 따른 설정 반환
const getCurrentConfig = () => {
  const env = process.env.NODE_ENV || 'development';
  return API_CONFIG[env as keyof typeof API_CONFIG] || API_CONFIG.development;
};

// API 설정 객체
export const apiConfig = getCurrentConfig();

// API 엔드포인트
export const API_ENDPOINTS = {
  // 프로젝트 관련
  PROJECTS: '/api/projects',
  
  // 파일 업로드 관련
  UPLOAD_LEARNING: (projectId: string) => `/v0.1/parking/${projectId}/train-images`,
  UPLOAD_TEST: (projectId: string) => `/v0.1/parking/${projectId}/test-images`,
  UPLOAD_ROI: (projectId: string) => `/v0.1/parking/${projectId}/roi-files`,
  
  // 폴더 관련
  GET_FOLDERS: (projectId: string, fileType: string) => `/api/folders/${projectId}/${fileType}`,
  GET_LEARNING_FOLDERS: (projectId: string) => `/v0.1/parking/${projectId}/images/train-folders`,
  GET_TEST_FOLDERS: (projectId: string) => `/v0.1/parking/${projectId}/images/test-folders`,
  GET_ROI_FOLDERS: (projectId: string) => `/v0.1/parking/${projectId}/images/roi-folders`,
  DELETE_FILE_OR_FOLDER: (projectId: string, folderPath: string) => `/v0.1/parking/${projectId}/${folderPath}`,
  
  // 주차 테스트 관련
  PARKING_TEST: '/api/parking-test',
  
  // 학습 실행 관련
  LEARNING: (projectId: string) => `/v0.1/parking/${projectId}/learning`,
  
  // 학습 결과 조회 관련
  LEARNING_RESULTS: (projectId: string, folderPath: string) => `/v0.1/parking/${projectId}/learning-results/${folderPath}`,
  LEARNING_HISTORY: (projectId: string) => `/v0.1/parking/${projectId}/history`,
  
  // CCTV 이미지 조회 관련
  CCTV_IMAGE: (projectId: string, folderPath: string, cctvId: string, imageType: string) => 
    `/v0.1/parking/${projectId}/${folderPath}/${cctvId}/images/${imageType}`,
  
  // ROI 관련
  GET_ROI_IMAGES: (projectId: string, folderPath: string) => `/v0.1/roi/${projectId}/${folderPath}/images`,
  GET_ROI_IMAGE: (projectId: string, folderPath: string, fileName: string) => `/v0.1/roi/${projectId}/${folderPath}?file=${fileName}`,
  CREATE_DRAFT_ROI: (projectId: string, roiFileName: string) => `/v0.1/roi/${projectId}/draft?file=${roiFileName}`,
  GET_DRAFT_ROI: (projectId: string, roiFileName: string) => `/v0.1/roi/${projectId}/draft?file=${roiFileName}`,
  SAVE_DRAFT_ROI: (projectId: string, roiFileName: string) => `/v0.1/roi/${projectId}/draft/save?file=${roiFileName}`,
  CREATE_ROI: (projectId: string) => `/v0.1/roi/${projectId}/create`,
  READ_ROI: (projectId: string) => `/v0.1/roi/${projectId}/read`,
  UPDATE_ROI: (projectId: string) => `/v0.1/roi/${projectId}/update`,
  DELETE_ROI: (projectId: string) => `/v0.1/roi/${projectId}/delete`,
  
  // Swagger
  SWAGGER: '/swagger/index.html'
};

// axios 기본 설정
export const axiosConfig = {
  baseURL: apiConfig.BASE_URL,
  timeout: 30000, // 30초
  headers: {
    'Content-Type': 'application/json',
  }
};

// 설정 정보 출력 (개발 환경에서만)
if (process.env.NODE_ENV === 'development') {
  console.log('🔧 API 설정:', {
    BASE_URL: apiConfig.BASE_URL,
    UPLOAD_URL: apiConfig.UPLOAD_URL,
    SWAGGER_URL: apiConfig.SWAGGER_URL,
    NODE_ENV: process.env.NODE_ENV
  });
} 