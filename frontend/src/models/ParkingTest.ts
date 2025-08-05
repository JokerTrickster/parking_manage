export interface ParkingTestRequest {
  cctv_id: string;
  var_threshold: number;
  learning_path: string;
  test_image_path: string;
  json_path: string;
}

export interface ParkingTestResponse {
  success: boolean;
  message: string;
  data?: {
    result_path: string;
  };
}

export interface RoiResult {
  roi_index: number;
  foreground_ratio: number;
}

export interface SavedResult {
  cctv_id: string;
  timestamp: string;
  var_threshold: number;
  learning_path: string;
  test_image_path: string;
  roi_results: RoiResult[];
} 