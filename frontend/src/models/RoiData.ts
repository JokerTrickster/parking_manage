export interface RoiRegion {
  roi_id: string;
  coords: number[]; // [x1, y1, x2, y2, x3, y3, x4, y4] - 4개의 점으로 구성된 다각형
}

export interface RoiData {
  cctv_id: string;
  rois: RoiRegion[];
  image_width: number;
  image_height: number;
}

export interface RoiFile {
  filename: string;
  data?: RoiData;
}
