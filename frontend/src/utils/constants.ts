export const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8080/api';

export const FILE_UPLOAD_CONFIG = {
  MAX_FILE_SIZE_MB: 10,
  ALLOWED_EXTENSIONS: ['.jpg', '.jpeg', '.png'],
  MAX_FILES_PER_UPLOAD: 50,
} as const;

export const PARKING_TEST_CONFIG = {
  DEFAULT_VAR_THRESHOLD: 50.0,
  MIN_VAR_THRESHOLD: 0.0,
  MAX_VAR_THRESHOLD: 100.0,
} as const;

export const PROJECT_TYPES = {
  BANPO: 'banpo',
  GWANGJU: 'gwangju',
  BUSAN: 'busan',
  DAEGU: 'daegu',
} as const;

export const PAGE_ROUTES = {
  PROJECT_SELECTION: 'project-selection',
  DASHBOARD: 'dashboard',
  PARKING_TEST: 'parking-test',
  ROI_WORK: 'roi-work',
  LIVE_PARKING: 'live-parking',
  LEARNING_DATA: 'learning-data',
} as const; 