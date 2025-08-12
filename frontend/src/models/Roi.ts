export interface RoiFile {
  name: string;
  path: string;
}

export interface TestFolder {
  name: string;
  path: string;
  images?: ImageFile[];
}

export interface ImageFile {
  name: string;
  path: string;
}

export interface RoiCoordinate {
  x: number;
  y: number;
}

export interface RoiData {
  roi_id: string;
  cctv_id: string;
  coords: number[];
}

export interface CreateRoiRequest {
  roi_id: string;
  cctv_id: string;
  project_id: string;
  roi_file: string;
  coords: number[];
}

export interface ReadRoiRequest {
  cctv_id: string;
  project_id: string;
  roi_file: string;
}

export interface UpdateRoiRequest {
  roi_id: string;
  cctv_id: string;
  project_id: string;
  roi_file: string;
  coords: number[];
}

export interface DeleteRoiRequest {
  roi_id: string;
  cctv_id: string;
  project_id: string;
  roi_file: string;
}

export interface RoiResponse {
  success: boolean;
  message: string;
}

export interface ReadRoiResponse {
  cctv_id: string;
  rois: { [roi_id: string]: number[] };
}

export interface TestStatsRoiResponse {
  images: ImageFile[];
  total: number;
}

export interface DraftRoiResponse {
  cctv_list: CctvRoiInfo[];
}

export interface CctvRoiInfo {
  cctv_id: string;
  parking_id: string;
  roi_coords: any[];
}

export interface SaveDraftResponse {
  success: boolean;
  message: string;
  file_name: string;
}
