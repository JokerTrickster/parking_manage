// API 설정
export const API_CONFIG = {
  // 개발 환경
  development: {
    BASE_URL: `http://${window.location.hostname}:5000`,
    UPLOAD_URL: `http://${window.location.hostname}:5000/v0.1/parking`,
    SWAGGER_URL: `http://${window.location.hostname}:5000/swagger/index.html`
  },
  // 프로덕션 환경 (도커)
  production: {
    BASE_URL: 'http://192.168.0.102:5000',
    UPLOAD_URL: 'http://192.168.0.102:5000/v0.1/parking',
    SWAGGER_URL: 'http://192.168.0.102:5000/swagger/index.html'
  }
};

// 현재 환경에 따른 설정 반환
const getCurrentConfig = () => {
  // 환경 변수 또는 window.location을 기반으로 API URL 결정
  const isDevelopment = process.env.NODE_ENV === 'development';
  const isDocker = process.env.REACT_APP_DOCKER === 'true';

  // 환경 변수로 명시적 설정이 있으면 우선 사용
  if (process.env.REACT_APP_API_URL) {
    return {
      BASE_URL: process.env.REACT_APP_API_URL,
      UPLOAD_URL: `${process.env.REACT_APP_API_URL}/v0.1/parking`,
      SWAGGER_URL: `${process.env.REACT_APP_API_URL}/swagger/index.html`
    };
  }

  // Docker 환경이면 production 설정 사용
  if (isDocker) {
    return API_CONFIG.production;
  }

  // 로컬 개발 환경
  if (isDevelopment) {
    return API_CONFIG.development;
  }

  // 기본값: 브라우저의 현재 호스트 사용 (배포된 경우)
  const currentHost = window.location.hostname;
  const apiUrl = `http://${currentHost}:5000`;

  return {
    BASE_URL: apiUrl,
    UPLOAD_URL: `${apiUrl}/v0.1/parking`,
    SWAGGER_URL: `${apiUrl}/swagger/index.html`
  };
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
  LEARNING_LIVE: (projectId: string) => `/v0.1/parking/${projectId}/learning/live`,

  // 배치 이미지 다운로드
  BATCH_IMAGES: (projectId: string) => `/v0.1/parking/${projectId}/images/batch`,

  // 학습 결과 조회 관련
  LEARNING_RESULTS: (projectId: string, folderPath: string) => `/v0.1/parking/${projectId}/learning-results/${folderPath}`,
  LEARNING_HISTORY: (projectId: string) => `/v0.1/parking/${projectId}/history`,

  // CCTV 이미지 조회 관련
  CCTV_IMAGE: (projectId: string, folderPath: string, cctvId: string, imageType: string) =>
    `/v0.1/parking/${projectId}/${folderPath}/${cctvId}/images/${imageType}`,
  // 실시간 CCTV 이미지 조회
  REALTIME_CCTV_IMAGE: (projectId: string, cctvId: string, imageType: string) =>
    `/v0.1/parking/${projectId}/${cctvId}/images/${imageType}`,

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

  // File Storage API v0.1
  FILE_STORAGE: {
    // Auto-upload for map editor (fire-and-forget, returns 202 Accepted)
    AUTO_UPLOAD_MAP: (projectId: string) =>
      `/v0.1/filestorage/${projectId}/map/auto-upload`,

    // Upload files to specific category
    UPLOAD: (projectId: string, category: string) =>
      `/v0.1/filestorage/${projectId}/${category}/upload`,

    // List files with pagination and filters
    LIST: (projectId: string, category: string, params?: {
      page?: number;
      pageSize?: number;
      cctvId?: string;
    }) => {
      const queryParams = new URLSearchParams();
      if (params?.page) queryParams.append('page', params.page.toString());
      if (params?.pageSize) queryParams.append('page_size', params.pageSize.toString());
      if (params?.cctvId) queryParams.append('cctv_id', params.cctvId);
      const query = queryParams.toString();
      return `/v0.1/filestorage/${projectId}/${category}/list${query ? '?' + query : ''}`;
    },

    // List folder structure (learning/test only)
    LIST_FOLDERS: (projectId: string, category: string) =>
      `/v0.1/filestorage/${projectId}/${category}/folders`,

    // Download specific file by filename
    DOWNLOAD: (projectId: string, category: string, filename: string) =>
      `/v0.1/filestorage/${projectId}/${category}/download/${filename}`,

    // Download latest version of a file
    DOWNLOAD_LATEST: (projectId: string, category: string, originalName: string) =>
      `/v0.1/filestorage/${projectId}/${category}/latest?original_name=${encodeURIComponent(originalName)}`,

    // Download multiple files as ZIP
    DOWNLOAD_MULTIPLE: (projectId: string, category: string) =>
      `/v0.1/filestorage/${projectId}/${category}/download-multiple`,

    // Delete file (encode path segments individually to preserve slashes)
    DELETE: (projectId: string, category: string, filename: string) => {
      const encodedPath = filename
        .split('/')
        .map(segment => encodeURIComponent(segment))
        .join('/');
      return `/v0.1/filestorage/${projectId}/${category}/delete/${encodedPath}`;
    },

    // Batch delete files
    BATCH_DELETE: (projectId: string, category: string) =>
      `/v0.1/filestorage/${projectId}/${category}/batch-delete`,

    // Delete folder (encode path segments individually to preserve slashes)
    DELETE_FOLDER: (projectId: string, category: string, folderPath: string) => {
      const encodedPath = folderPath
        .split('/')
        .map(segment => encodeURIComponent(segment))
        .join('/');
      return `/v0.1/filestorage/${projectId}/${category}/folder/${encodedPath}`;
    },
  },

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