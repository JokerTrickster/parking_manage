/**
 * Learning Data Management Models and Types
 *
 * TypeScript interfaces for Learning Data Management feature
 * Handles ROI file selection, learning data folder selection, and image editing
 */

/**
 * ROI polygon coordinates
 */
export interface ROIPolygon {
  roi_id: string;
  coords: number[]; // Flattened array of x,y coordinates [x1, y1, x2, y2, ...]
  occupied?: boolean; // Whether this ROI is marked as occupied (for editing)
}

/**
 * ROI match data from file
 */
export interface ROIMatch {
  img_center_roi: number[];
  original_roi: number[];
  parking_id: string;
  parking_position: number[];
}

/**
 * ROI data for a single CCTV (per IP address)
 */
export interface CCTVROIData {
  cctv_id: string;
  matches: ROIMatch[];
}

/**
 * ROI file data structure (IP address -> CCTV data mapping)
 */
export interface ROIFileData {
  [ipAddress: string]: CCTVROIData;
}

/**
 * Learning folder information
 */
export interface LearningFolder {
  folder_name: string;
  folder_path: string;
  cctv_count: number;
  cctv_ids: string[];
  image_count: number;
  created_at: string;
}

/**
 * CCTV information within a learning folder
 */
export interface CCTVInfo {
  cctv_id: string;
  folder_path: string;
  image_files: string[];
  first_image_url?: string;
}

/**
 * Learning data management state
 */
export interface LearningDataManagementState {
  // Selection state
  selectedRoiFile: string | null;
  selectedRoiFileData: ROIFileData | null;
  selectedLearningFolder: string | null;
  selectedCCTV: string | null;

  // Available options
  roiFiles: string[];
  learningFolders: LearningFolder[];
  cctvList: CCTVInfo[];

  // Current editing state
  currentImage: string | null;
  currentImageFile: string | null;
  editedROIs: ROIPolygon[];
  hasUnsavedChanges: boolean;

  // UI state
  loading: boolean;
  saving: boolean;
  error: string | null;
  successMessage: string | null;
}

/**
 * ROI fill operation request
 */
export interface FillROIRequest {
  projectId: string;
  folderPath: string;
  cctvId: string;
  imageFile: string;
  roiId: string;
  fillType: 'fill' | 'empty'; // fill = occupied (white), empty = vacant (black)
}

/**
 * Save edited image request
 */
export interface SaveEditedImageRequest {
  projectId: string;
  folderPath: string;
  cctvId: string;
  imageFile: string;
  imageData: Blob; // Edited image blob
}

/**
 * Save edited image response
 */
export interface SaveEditedImageResponse {
  success: boolean;
  message: string;
  data: {
    saved_path: string;
    file_size: number;
  };
}
