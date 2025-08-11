export interface LearningRequest {
  projectId: string;
  learningRate: number;
  iterations: number;
  varThreshold: number;
  learningPath: string;
  testPath: string;
  roiPath: string;
}

export interface LearningResponse {
  folder_path: string;
}

export interface LearningResult {
  test_image_name: string;
  cctv_id: string;
  roi_results: Array<{
    roi_index: number;
    foreground_ratio: number;
  }>;
  timestamp: string;
  var_threshold: number;
  learning_rate: number;
  iterations: number;
  learning_path: string;
  test_image_path: string;
  roi_path: string;
}

export interface LearningStatistics {
  totalTests: number;
  totalRois: number;
  totalVehicles: number;
  cctvStats: Array<{
    cctvId: string;
    learningImages: number;
    roiCount: number;
    vehicleCount: number;
  }>;
}

export interface LearningResultsData {
  timestamp: string;
  cctv_list: CctvInfo[];
}

export interface CctvInfo {
  cctv_id: string;
  has_images: boolean;
}

export interface LearningResultsResponse {
  success: boolean;
  message: string;
  data: LearningResultsData;
} 